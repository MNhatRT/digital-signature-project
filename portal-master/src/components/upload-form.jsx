import { useState } from "react"

export function UploadForm() {
  const [file, setFile] = useState(null)
  const [uploaded, setUploaded] = useState(false)

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected && selected.type === "application/pdf") {
      setFile(selected)
      setUploaded(false)
    }
  }

  return (
    <div style={{ width: "100%", maxWidth: 480 }}>
      <div className="card">
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: "#1e40af" }}>
          📄 Upload PDF
        </h2>
        <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>
          Chọn file PDF hồ sơ cần ký số
        </p>

        <label style={{
          display: "block", border: "2px dashed #cbd5e1", borderRadius: 10,
          padding: "32px 16px", textAlign: "center", cursor: "pointer",
          background: file ? "#f0fdf4" : "#f8fafc", marginBottom: 16,
          borderColor: file ? "#86efac" : "#cbd5e1"
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
          <div style={{ color: "#475569", fontSize: 14 }}>
            {file ? file.name : "Bấm để chọn file PDF"}
          </div>
          <input type="file" accept=".pdf" onChange={handleFileChange} style={{ display: "none" }} />
        </label>

        <button
          onClick={() => file && setUploaded(true)}
          disabled={!file}
          style={{
            width: "100%", padding: "12px", borderRadius: 8, border: "none",
            background: file ? "#1e40af" : "#e2e8f0",
            color: file ? "white" : "#94a3b8",
            fontWeight: 600, fontSize: 15, cursor: file ? "pointer" : "not-allowed"
          }}
        >
          Upload
        </button>

        {uploaded && (
          <div style={{
            marginTop: 16, padding: 12, background: "#f0fdf4",
            border: "1px solid #86efac", borderRadius: 8, fontSize: 13
          }}>
            ✅ Upload thành công!<br />
            <span style={{ color: "#64748b" }}>Hash SHA-256: abc123def456789...</span>
          </div>
        )}
      </div>
    </div>
  )
}