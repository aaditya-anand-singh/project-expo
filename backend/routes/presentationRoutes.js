import express from "express";
import multer from "multer";
import { uploadPPT } from "../controllers/presentationController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), uploadPPT);

export default router;
