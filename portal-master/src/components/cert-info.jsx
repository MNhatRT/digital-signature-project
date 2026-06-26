import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function CertInfo() {
  const cert = {
    subject: "CN=Nguyễn Văn A, emailAddress=nguyenvana@citizen.vn, C=VN",
    issuer: "CN=Demo Root CA, O=UIT Lab, C=VN",
    serial: "0A:1B:2C:3D:4E:5F",
    validFrom: "2025-01-01",
    validUntil: "2026-12-31",
    keyUsage: "Digital Signature, Non-Repudiation",
    algorithm: "RSA-PSS 2048-bit + SHA-256",
    status: "active",
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin chứng thư số X.509</CardTitle>
          <CardDescription>Chi tiết chứng thư của người ký</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600 }}>Trạng thái</span>
              <Badge style={{ background: "#16a34a", color: "white" }}>Còn hiệu lực ✓</Badge>
            </div>

            {[
              { label: "Subject (Chủ sở hữu)", value: cert.subject },
              { label: "Issuer (Tổ chức cấp)", value: cert.issuer },
              { label: "Serial Number", value: cert.serial },
              { label: "Hiệu lực từ", value: cert.validFrom },
              { label: "Hiệu lực đến", value: cert.validUntil },
              { label: "Key Usage", value: cert.keyUsage },
              { label: "Thuật toán", value: cert.algorithm },
            ].map((row) => (
              <div key={row.label} style={{
                display: "flex", justifyContent: "space-between",
                borderBottom: "1px solid #e5e7eb", paddingBottom: 8, gap: 16
              }}>
                <span style={{ color: "#6b7280", fontSize: 13, minWidth: 140 }}>{row.label}</span>
                <span style={{ fontSize: 13, textAlign: "right" }}>{row.value}</span>
              </div>
            ))}

          </div>
        </CardContent>
      </Card>
    </div>
  )
}