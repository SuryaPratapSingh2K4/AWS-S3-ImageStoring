import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema(
    {
        caption: { type: String, required: true },
        imageURL: { type: String, required: true },
        imageKey: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

const Upload = mongoose.model("Upload", uploadSchema);
export default Upload;