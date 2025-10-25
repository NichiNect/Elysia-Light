import { Elysia } from "elysia";
import fs from "fs";
import path from "path";

export const Storage = (app: Elysia) =>
  app.get("/storage/*", async ({ params, set }) => {
    const requestedPath = params["*"]; // contoh: "user/avatar.png"
    const baseDir = path.resolve("storage", "public");
    const targetPath = path.resolve(baseDir, requestedPath);

    // Cegah akses keluar dari baseDir (traversal attack)
    if (!targetPath.startsWith(baseDir)) {
      set.status = 400;
      return { error: "Invalid path" };
    }

    // Cek apakah file ada
    if (!fs.existsSync(targetPath)) {
      set.status = 404;
      return { error: "File not found" };
    }

    // Deteksi MIME type sederhana
    const ext = path.extname(targetPath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".pdf": "application/pdf",
      ".txt": "text/plain",
      ".json": "application/json",
      ".svg": "image/svg+xml",
    };

    const buffer = fs.readFileSync(targetPath);
    
    set.headers["Content-Type"] = mimeTypes[ext] || "application/octet-stream";
    set.headers["Content-Length"] = buffer.length.toString();

    return new Response(buffer);

  });
