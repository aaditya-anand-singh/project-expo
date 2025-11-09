import { exec } from "child_process";
import screenshot from "screenshot-desktop";
import fs from "fs";
import Screenshot from "../models/Screenshot.js";

// ================== VOLUME CONTROL ==================
export const controlVolume = (req, res) => {
  const { type } = req.body;
  let command = "";

  if (type === "up") command = "(new-object -com wscript.shell).SendKeys([char]175)";
  else if (type === "down") command = "(new-object -com wscript.shell).SendKeys([char]174)";
  else return res.status(400).json({ message: "Invalid volume type" });

  exec(`powershell -Command "${command}"`, (err) => {
    if (err) console.error("🔊 Volume control error:", err);
  });

  res.json({ message: `Volume ${type}` });
};

// ================== BRIGHTNESS CONTROL ==================
let brightnessLevel = 50;

export const controlBrightness = (req, res) => {
  const { type } = req.body;

  if (type === "up") brightnessLevel = Math.min(100, brightnessLevel + 10);
  else if (type === "down") brightnessLevel = Math.max(0, brightnessLevel - 10);
  else return res.status(400).json({ message: "Invalid brightness type" });

  const command = `(Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightnessMethods).WmiSetBrightness(1,${brightnessLevel})`;

  exec(`powershell -Command "${command}"`, (err) => {
    if (err) console.error("💡 Brightness control error:", err);
  });

  res.json({ message: `Brightness set to ${brightnessLevel}%` });
};

// ================== SCREENSHOT — SAVE TO MONGODB ==================
export const takeScreenshot = async (req, res) => {
  try {
    const tempFile = `./temp_screenshot_${Date.now()}.jpg`;
    console.log("🟡 Attempting to capture screenshot...");

    await screenshot({ filename: tempFile })
      .then(() => console.log("✅ Screenshot file created:", tempFile))
      .catch((err) => {
        console.error("❌ Screenshot capture failed:", err);
        throw err;
      });

    if (!fs.existsSync(tempFile)) {
      console.error("❌ Screenshot file not found after capture attempt!");
      return res.status(500).json({ success: false, error: "File not created" });
    }

    console.log("🟢 File found. Reading...");
    const imgData = fs.readFileSync(tempFile);

    const savedShot = await Screenshot.create({
      image: imgData,
      contentType: "image/jpeg",
    });

    fs.unlinkSync(tempFile);
    console.log("✅ Screenshot saved to MongoDB:", savedShot._id);

    const base64 = imgData.toString("base64");
    res.json({
      success: true,
      id: savedShot._id,
      imageBase64: `data:image/jpeg;base64,${base64}`,
      message: "Screenshot saved in MongoDB",
    });
  } catch (err) {
    console.error("🔥 Screenshot error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ================== GET ALL SCREENSHOTS ==================
export const getAllScreenshots = async (req, res) => {
  try {
    const shots = await Screenshot.find().sort({ createdAt: -1 }).limit(10);
    const formatted = shots.map((s) => ({
      id: s._id,
      createdAt: s.createdAt,
      imageBase64: `data:${s.contentType};base64,${s.image.toString("base64")}`,
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ================== OPEN YOUTUBE ==================
export const openYouTube = (req, res) => {
  exec('start https://www.youtube.com', (err) => {
    if (err) console.error("🌐 YouTube error:", err);
  });
  res.json({ message: "YouTube opened" });
};

// ================== MUTE / UNMUTE ==================
export const toggleMute = (req, res) => {
  exec("nircmd.exe mutesysvolume 2", (err) => {
    if (err) console.error("🔇 Mute/Unmute error:", err);
  });
  res.json({ message: "Mute toggled" });
};
