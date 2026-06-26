import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function VerifyForm() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [verifying, setVerifying] = useState(false)

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setResult(null)
  }

  const handleVerify = () => {
    setVerifying(true)
    setTimeout(() => {
      setVerifying(false)
      setResult("valid") // đổi thành "invalid" để test giả mạo
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Xác minh chữ ký số</CardTitle>
          <CardDescription>Upload file PDF đã ký để kiểm tra tính hợp lệ</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <input type="file" accept=".pdf" onChange={handleFileChange} />
          <Button onClick={handleVerify} disabled={!file || verifying}>
            {verifying ? "Đang xác minh..." : "Xác minh"}
          </Button>

          {result === "valid" && (
            <div style={{ border: "1px solid #16a34a", borderRadius: 8, padding: 12, background: "#f0fdf4" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Badge style={{ background: "#16a34a", color: "white" }}>VALID ✓</Badge>
                <span style={{ fontWeight: 600 }}>Chữ ký hợp lệ</span>
              </div>
              <div style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
                <span>Người ký: Nguyễn Văn A</span>
                <span>Email: nguyenvana@citizen.vn</span>
                <span>Thời điểm ký: 2025-10-15 09:30:00</span>
                <span>Thuật toán: SHA256withRSA</span>
                <span>Chuỗi CA: ✓ Hợp lệ</span>
                <span>Trạng thái chứng thư: ✓ Chưa thu hồi</span>
              </div>
            </div>
          )}

          {result === "invalid" && (
            <div style={{ border: "1px solid #dc2626", borderRadius: 8, padding: 12, background: "#fef2f2" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Badge style={{ background: "#dc2626", color: "white" }}>INVALID ✗</Badge>
                <span style={{ fontWeight: 600 }}>Chữ ký không hợp lệ</span>
              </div>
              <p style={{ fontSize: 13, color: "#dc2626" }}>
                Tài liệu đã bị chỉnh sửa sau khi ký. Hash không khớp.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}