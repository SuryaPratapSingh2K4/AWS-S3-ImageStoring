import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import sharp from "sharp";
import { connectDB } from "./config.js";
import Upload from "./model/upload.js";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
});

const app = express();
app.use(cors());
app.use(express.json());

// app.get("/", (req, res) => {
//   res.status(201).send("API is running...");
// });

app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Upload.find().sort({ createdAt: -1 });
    for (const post of posts) {
      const getObjectParams = {
        Bucket: bucketName,
        Key: post.imageKey,
      };

      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      post.imageURL = url;
    }

    res.status(201).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});

app.post("/api/upload", upload.single("image"), async (req, res) => {
  console.log("req-body", req.body);
  console.log("req-file", req.file);

  try {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 1920, height: 1080, fit: "contain" })
      .toBuffer();

    const imageName = randomImageName();

    const params = {
      Bucket: bucketName,
      // Key: req.file.originalname,
      Key: imageName,
      Body: buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    const imageURL = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${imageName}`;

    const newUpload = Upload({
      caption: req.body.caption,
      imageURL: imageURL,
      imageKey: imageName,
    });

    await newUpload.save();
    res.status(200).json({
      message: "File uploaded successfully",
      data: newUpload,
    });
  } catch (error) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to upload file" });
  }

  req.file.buffer;

  res.send("File uploaded successfully");
});

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server connected to PORT ${process.env.PORT}`);
  });
});
