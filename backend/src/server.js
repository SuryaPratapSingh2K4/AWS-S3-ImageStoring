import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
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

app.put("/api/update/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { caption } = req.body;

    const post = await Upload.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Update image if a new file is uploaded
    if (req.file) {
      const buffer = await sharp(req.file.buffer)
        .resize({ width: 1920, height: 1080, fit: "contain" })
        .toBuffer();

      const imageName = crypto.randomBytes(32).toString("hex");

      // Upload new image
      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: imageName,
          Body: buffer,
          ContentType: req.file.mimetype,
        })
      );

      // Delete old image only if imageKey exists
      if (post.imageKey) {
        await s3.send(
          new DeleteObjectCommand({ Bucket: bucketName, Key: post.imageKey })
        );
      }

      post.imageKey = imageName;
      post.imageURL = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${imageName}`;
    }

    // Update caption
    if (caption) post.caption = caption;

    await post.save();

    res.status(200).json({ message: "Post updated successfully", data: post });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Failed to update post" });
  }
});

app.delete("/api/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Upload.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.imageKey) {
      await s3.send(
        new DeleteObjectCommand({ Bucket: bucketName, Key: post.imageKey })
      );
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Failed to delete post" });
  }
});

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server connected to PORT ${process.env.PORT}`);
  });
});
