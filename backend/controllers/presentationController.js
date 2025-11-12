import fs from "fs";
import path from "path";
import { exec } from "child_process";

// ✅ Windows path for LibreOffice
const sofficePath = `"C:\\Program Files\\LibreOffice\\program\\soffice.exe"`;

// ✅ UPLOAD + CONVERT CONTROLLER
export const uploadPPT = (req, res) => {
  const filePath = path.resolve(req.file.path);
  const outputDir = path.resolve("slides", Date.now().toString());

  fs.mkdirSync(outputDir, { recursive: true });

  // ✅ Step 1 → Convert PPTX → PNG Slides
  const convertCmd = `
    ${sofficePath} --headless --convert-to "png:impress_png_Export" 
    --outdir "${outputDir}" "${filePath}"
  `;

  exec(convertCmd, (err) => {
    if (err) {
      console.error("❌ LibreOffice Conversion Error:", err);
      return res.json({ success: false, message: "Slide conversion failed" });
    }

    // ✅ Step 2 → Read all PNGs inside output folder
    const allFiles = fs.readdirSync(outputDir);

    const slideImages = allFiles
      .filter(f => f.endsWith(".png"))
      .sort() // ensures correct slide order
      .map(f => ({
        url: `http://localhost:5000/${path.join(outputDir, f).replace(/\\/g, "/")}`
      }));

    if (slideImages.length === 0) {
      return res.json({ success: false, message: "No slides were generated" });
    }

    console.log("✅ Slides generated:", slideImages.length);
    return res.json({ success: true, slides: slideImages });
  });
};
