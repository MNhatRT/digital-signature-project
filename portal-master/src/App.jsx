import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"

const API = "https://localhost:3443"

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setLoading(false); return }
      localStorage.setItem("token", data.token)
      localStorage.setItem("name", data.name)
      localStorage.setItem("role", data.role)
      onLogin(data)
    } catch {
      setError("Không kết nối được server!")
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: "40px 36px", width: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏛️</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>Cổng Dịch Vụ Công</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>NT219 — Mật Mã Ứng Dụng</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Email</div>
            <input value={email} onChange={e => setEmail(e.target.value)}
              placeholder="nguyenvana@citizen.vn"
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, boxSizing: "border-box" }} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Mật khẩu</div>
            <input value={password} onChange={e => setPassword(e.target.value)}
              type="password" placeholder="••••••••"
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, boxSizing: "border-box" }} />
          </div>
          {error && <div style={{ fontSize: 12, color: "#dc2626", background: "#fef2f2", padding: "8px 12px", borderRadius: 6 }}>{error}</div>}
          <button onClick={handleLogin} disabled={loading} style={{
            padding: "10px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600,
            background: "linear-gradient(135deg, #1e40af, #3b82f6)", color: "white", cursor: "pointer", marginTop: 4
          }}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </div>
      </div>
    </div>
  )
}
const NAV = [
  { path: "/upload", icon: "📄", label: "Upload PDF" },
  { path: "/sign", icon: "✍️", label: "Ký số" },
  { path: "/verify", icon: "🔍", label: "Xác minh" },
  { path: "/certificate", icon: "📋", label: "Chứng thư" },
]

function Sidebar({ user, onLogout }) {
  const location = useLocation()
  return (
    <div style={{ width: 240, minHeight: "100vh", background: "white", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
      <Link to="/" style={{ textDecoration: "none", padding: "20px 20px 16px", borderBottom: "1px solid #f1f5f9", display: "block", background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)" }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>🏛️ Cổng Dịch Vụ Công</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>NT219 — Mật Mã Ứng Dụng</div>
      </Link>
      <div style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {NAV.map(l => (
          <Link key={l.path} to={l.path} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px", borderRadius: 8, textDecoration: "none",
            fontSize: 13, fontWeight: location.pathname === l.path ? 600 : 400,
            color: location.pathname === l.path ? "#1e40af" : "#475569",
            background: location.pathname === l.path ? "#eff6ff" : "transparent",
          }}>
            <span>{l.icon}</span>
            <span>{l.label}</span>
          </Link>
        ))}
      </div>
       <div style={{ padding: "16px 20px", borderTop: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #1e40af, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "white", fontWeight: 700 }}>
            {user?.name?.charAt(0) || "A"}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>{user?.role === "citizen" ? "Công dân" : "Cán bộ"}</div>
          </div>
        </div>
        <button onClick={onLogout} style={{ width: "100%", padding: "7px", borderRadius: 6, border: "1px solid #e2e8f0", background: "transparent", fontSize: 12, color: "#64748b", cursor: "pointer" }}>
          Đăng xuất
        </button>
      </div>
    </div>
    )
  }
    
function Card({ children, style }) {
  return (
    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: "28px 32px", ...style }}>
      {children}
    </div>
  )
}

function Btn({ children, onClick, disabled, style }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer", border: "none",
      background: disabled ? "#e2e8f0" : "linear-gradient(135deg, #1e40af, #3b82f6)",
      color: disabled ? "#94a3b8" : "white", width: "100%", ...style
    }}>{children}</button>
  )
}

function Badge({ children, color = "blue" }) {
  const colors = {
    green: { background: "#dcfce7", color: "#166534" },
    red: { background: "#fee2e2", color: "#991b1b" },
    blue: { background: "#dbeafe", color: "#1e40af" },
    gray: { background: "#f1f5f9", color: "#475569" },
  }
  return <span style={{ ...colors[color], fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>{children}</span>
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ fontSize: 13, color: "#64748b" }}>{label}</span>
      <span style={{ fontSize: 13, color: "#1e293b", maxWidth: "60%", textAlign: "right" }}>{value}</span>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: { bg: "#eff6ff", icon: "#1e40af", border: "#bfdbfe" },
    green: { bg: "#f0fdf4", icon: "#166534", border: "#bbf7d0" },
    purple: { bg: "#f5f3ff", icon: "#6d28d9", border: "#ddd6fe" },
    amber: { bg: "#fffbeb", icon: "#92400e", border: "#fde68a" },
  }
  const c = colors[color] || colors.blue
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: c.icon, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
    </div>
  )
}

function Home() {
  const navigate = useNavigate()
  return (
    <div style={{ paddingTop: 40, maxWidth: 860 }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#1e40af", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>NT219 — Mật Mã Ứng Dụng</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", margin: "0 0 8px", lineHeight: 1.3 }}>Hệ thống chữ ký số<br />dịch vụ hành chính công</h1>
        <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>Ký số và xác minh tài liệu PDF sử dụng RSA-PSS 2048-bit + X.509</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
        <StatCard icon="📄" label="Tài liệu đã ký" value="128" color="blue" />
        <StatCard icon="✅" label="Xác minh thành công" value="124" color="green" />
        <StatCard icon="👤" label="Người dùng" value="32" color="purple" />
        <StatCard icon="🔐" label="Chứng thư hoạt động" value="18" color="amber" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {NAV.map(item => (
          <div key={item.path} onClick={() => navigate(item.path)} style={{
            background: "white", border: "1px solid #e2e8f0", borderRadius: 10,
            padding: "20px 22px", cursor: "pointer",
            transition: "box-shadow .15s",
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", marginBottom: 4 }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function UploadPage() {
  const [file, setFile] = useState(null)
  const [uploaded, setUploaded] = useState(false)
  return (
    <div style={{ paddingTop: 40, maxWidth: 600 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Upload PDF</h2>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>Chọn file PDF hồ sơ cần ký số</p>
      <Card>
        <label style={{
          display: "block", border: "1.5px dashed #cbd5e1", borderRadius: 8,
          padding: "36px 16px", textAlign: "center", cursor: "pointer",
          background: file ? "#f0fdf4" : "#fafafa", marginBottom: 16,
          borderColor: file ? "#86efac" : "#cbd5e1"
        }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>📁</div>
          <div style={{ fontSize: 13, color: file ? "#166534" : "#64748b", fontWeight: file ? 600 : 400 }}>
            {file ? file.name : "Bấm để chọn file PDF"}
          </div>
          {!file && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Chỉ chấp nhận .pdf</div>}
          <input type="file" accept=".pdf" onChange={e => { setFile(e.target.files[0]); setUploaded(false) }} style={{ display: "none" }} />
        </label>
        <Btn onClick={() => setUploaded(true)} disabled={!file}>Upload hồ sơ</Btn>
        {uploaded && (
          <div style={{ marginTop: 16, padding: "12px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#166534", marginBottom: 4 }}>✓ Upload thành công</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>SHA-256: e3b0c44298fc1c149afbf4c8996fb924...</div>
          </div>
        )}
      </Card>
    </div>
  )
}

function SignPage() {
  const [file, setFile] = useState(null)
  const [state, setState] = useState("idle")
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")

  const handleSign = async () => {
    setState("signing")
    setError("")
    try {
      const formData = new FormData()
      formData.append("pdf", file)
      const res = await fetch(`${API}/api/documents/sign`, {
        method: "POST",
        headers: { "Authorization": "Bearer " + localStorage.getItem("token") },
        body: formData
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || data.detail); setState("idle"); return }
      setResult(data)
      setState("done")
    } catch {
      setError("Không kết nối được server!")
      setState("idle")
    }
  }

  return (
    <div style={{ paddingTop: 40, maxWidth: 600 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Ký số tài liệu</h2>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>Ký PDF bằng RSA-PSS 2048-bit + SHA-256</p>
      <Card>
        <label style={{
          display: "block", border: "1.5px dashed #cbd5e1", borderRadius: 8,
          padding: "36px 16px", textAlign: "center", cursor: "pointer",
          background: file ? "#f0fdf4" : "#fafafa", marginBottom: 16,
          borderColor: file ? "#86efac" : "#cbd5e1"
        }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>📁</div>
          <div style={{ fontSize: 13, color: file ? "#166534" : "#64748b", fontWeight: file ? 600 : 400 }}>
            {file ? file.name : "Bấm để chọn file PDF cần ký"}
          </div>
          {!file && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Chỉ chấp nhận .pdf</div>}
          <input type="file" accept=".pdf" onChange={e => { setFile(e.target.files[0]); setState("idle"); setResult(null) }} style={{ display: "none" }} />
        </label>
        {file && state === "idle" && (
          <div style={{ marginBottom: 16 }}>
            <Row label="Người ký" value={localStorage.getItem("name")} />
            <Row label="Thuật toán" value="RSA-PSS 2048 + SHA-256" />
          </div>
        )}
        {error && <div style={{ marginBottom: 12, padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, fontSize: 12, color: "#dc2626" }}>{error}</div>}
        <Btn onClick={handleSign} disabled={!file || state !== "idle"}>
          {state === "signing" ? "Đang ký..." : state === "done" ? "✓ Đã ký thành công" : "Ký số"}
        </Btn>
        {result && (
          <div style={{ marginTop: 16, padding: "12px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#166534", marginBottom: 8 }}>✓ Ký số thành công</div>
            <Row label="Người ký" value={result.signer} />
            <Row label="Thời gian ký" value={`${result.signingTime} ms`} />
            <Row label="Thuật toán" value={result.algorithm} />
          </div>
        )}
      </Card>
    </div>
  )
}

function VerifyPage() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleVerify = async () => {
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const formData = new FormData()
      formData.append("pdf", file)
      const res = await fetch(`${API}/api/documents/verify`, {
        method: "POST",
        body: formData
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setError("Không kết nối được server!")
    }
    setLoading(false)
  }

  return (
    <div style={{ paddingTop: 40, maxWidth: 600 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Xác minh chữ ký</h2>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>Upload file PDF đã ký để kiểm tra tính hợp lệ</p>
      <Card>
        <label style={{
          display: "block", border: "1.5px dashed #cbd5e1", borderRadius: 8,
          padding: "28px 16px", textAlign: "center", cursor: "pointer",
          background: "#fafafa", marginBottom: 16
        }}>
          <div style={{ fontSize: 13, color: "#64748b" }}>{file ? file.name : "Chọn file PDF đã ký"}</div>
          <input type="file" accept=".pdf" onChange={e => { setFile(e.target.files[0]); setResult(null) }} style={{ display: "none" }} />
        </label>
        {error && <div style={{ marginBottom: 12, padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, fontSize: 12, color: "#dc2626" }}>{error}</div>}
        <Btn onClick={handleVerify} disabled={!file || loading}>
          {loading ? "Đang xác minh..." : "Xác minh"}
        </Btn>
        {result && (
          <div style={{
            marginTop: 16, padding: "14px 16px", borderRadius: 8,
            background: result.valid ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${result.valid ? "#bbf7d0" : "#fecaca"}`
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Badge color={result.valid ? "green" : "red"}>{result.valid ? "VALID" : "INVALID"}</Badge>
              <span style={{ fontSize: 13, fontWeight: 600, color: result.valid ? "#166534" : "#991b1b" }}>
                {result.valid ? "Chữ ký hợp lệ" : "Chữ ký không hợp lệ"}
              </span>
            </div>
            {result.valid ? (
              <>
                <Row label="Người ký" value={result.signer || "—"} />
                <Row label="Thời điểm ký" value={result.signedAt || "—"} />
                <Row label="Thuật toán" value={result.algorithm || "—"} />
                <Row label="Tài liệu nguyên vẹn" value={result.intactDocument ? "✓ Có" : "✗ Không"} />
                <Row label="Cert tin cậy" value={result.certTrusted ? "✓ Có" : "⚠ Chưa xác nhận"} />
              </>
            ) : (
              <div style={{ fontSize: 12, color: "#991b1b" }}>{result.reason || "Chữ ký không hợp lệ hoặc tài liệu bị sửa"}</div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

function CertPage() {
  const [cert, setCert] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchCert = async () => {
    setLoading(true)
    setError("")
    const role = localStorage.getItem("role")
    const serial = role === "citizen" ? "01" : "02"
    try {
      const res = await fetch(`${API}/api/certificate/${serial}`, {
        headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setLoading(false); return }
      setCert(data)
    } catch {
      setError("Không kết nối được server!")
    }
    setLoading(false)
  }

  // Tự load khi vào trang
  useState(() => { fetchCert() }, [])

  return (
    <div style={{ paddingTop: 40, maxWidth: 600 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Chứng thư số X.509</h2>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>Chi tiết certificate của người ký</p>
      <Card>
        {loading && <div style={{ textAlign: "center", color: "#64748b", fontSize: 13, padding: 20 }}>Đang tải...</div>}
        {error && <div style={{ padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, fontSize: 12, color: "#dc2626" }}>{error}</div>}
        {cert && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #1e40af, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{localStorage.getItem("name")}</div>
              </div>
              <Badge color={cert.status === "active" ? "green" : "red"}>
                {cert.status === "active" ? "Còn hiệu lực" : "Đã thu hồi"}
              </Badge>
            </div>
            <Row label="Subject" value={cert.subject} />
            <Row label="Issuer" value={cert.issuer} />
            <Row label="Serial Number" value={cert.serial} />
            <Row label="Hiệu lực từ" value={cert.validFrom} />
            <Row label="Hiệu lực đến" value={cert.validUntil} />
            <Row label="Key Usage" value={cert.keyUsage} />
            <Row label="Thuật toán" value={cert.algorithm} />
          </>
        )}
      </Card>
    </div>
  )
}
export default function App() {
  const [user, setUser] = useState(
    localStorage.getItem("token") ? { name: localStorage.getItem("name"), role: localStorage.getItem("role") } : null
  )

  if (!user) return <LoginPage onLogin={setUser} />

  return (
    <BrowserRouter>
      <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
        <Sidebar user={user} onLogout={() => { localStorage.clear(); setUser(null) }} />
        <div style={{ flex: 1, padding: "0 48px 64px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/sign" element={<SignPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/certificate" element={<CertPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}