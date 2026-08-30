"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { Paperclip, X, FileText } from "lucide-react";

export default function FileUploader({ files, setFiles, compact }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(e) {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    setUploading(true);
    setError("");
    try {
      for (const file of selected) {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        setFiles((prev) => [...prev, { url: blob.url, filename: file.name }]);
      }
    } catch (err) {
      setError("Kunne ikke uploade filen. Prøv igen (max 100 MB pr. fil).");
    }
    setUploading(false);
    e.target.value = "";
  }

  function removeFile(url) {
    setFiles((prev) => prev.filter((f) => f.url !== url));
  }

  return (
    <div>
      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: compact ? 12 : 12.5,
          fontWeight: 700,
          color: "#2A55E5",
          cursor: uploading ? "default" : "pointer",
          opacity: uploading ? 0.6 : 1,
        }}
      >
        <Paperclip size={compact ? 13 : 14} />
        {uploading ? "Uploader…" : "Vedhæft fil"}
        <input type="file" multiple onChange={handleFiles} disabled={uploading} style={{ display: "none" }} />
      </label>
      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
          {files.map((f) => (
            <div key={f.url} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, background: "#F5F7FB", padding: "6px 10px", borderRadius: 8 }}>
              <FileText size={13} color="#5B6478" />
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.filename}</span>
              <button onClick={() => removeFile(f.url)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9AA2B1", padding: 0 }}>
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <div style={{ fontSize: 11.5, color: "#C0392B", marginTop: 6 }}>{error}</div>}
    </div>
  );
}
