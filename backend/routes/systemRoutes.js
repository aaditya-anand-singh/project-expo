import express from "express";
import {
  controlVolume,
  controlBrightness,
  takeScreenshot,
  getAllScreenshots,
  openYouTube,
  toggleMute,
} from "../controllers/systemController.js";

const router = express.Router();

// --- Control Endpoints ---
router.post("/volume", controlVolume);
router.post("/brightness", controlBrightness);
router.get("/youtube", openYouTube);
router.get("/mute", toggleMute);

// --- Screenshot Endpoints ---
router.post("/screenshot", takeScreenshot);
router.get("/screenshots", getAllScreenshots);

export default router;
