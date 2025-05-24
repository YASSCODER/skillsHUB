import fs from "fs";
import path from "path";

export function ensureUploadsDir() {
  const uploadDir = path.join(__dirname, "../../../uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
}
