import fs from "fs";
import path from "path";
import { exec } from "child_process";

export const uploadPPT = (req, res) => {
  const filePath = path.resolve(req.file.path);
  const outputDir = path.resolve("uploads", `slides_${Date.now()}`);
  fs.mkdirSync(outputDir);

  // Convert PPTX → images using LibreOffice
  const command = `libreoffice --headless --convert-to png --outdir "${outputDir}" "${filePath}"`;

  exec(command, (err) => {
    if (err) {
      console.error("❌ Conversion error:", err);
      return res.status(500).json({ success: false, message: "Conversion failed" });
    }

    // Get all slide images
    const slides = fs
      .readdirSync(outputDir)
      .filter((f) => f.endsWith(".png"))
      .map((f) => `http://localhost:5000/${path.join(outputDir, f)}`);

    res.json({ success: true, slides });
  });
};
