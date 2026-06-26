import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function SignForm() {
  const [signing, setSigning] = useState(false)
  const [signed, setSigned] = useState(false)

  const handleSign = () => {
    setSigning(true)
    setTimeout(() => {
      setSigning(false)
      setSigned(true)
    }, 2000)
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Ký số tài liệu</CardTitle>
          <CardDescription>Ký số file PDF bằng chứng thư RSA-PSS 2048</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">File: don_xin_cap_phep.pdf</span>
            <Badge>PDF</Badge>
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <span>Người ký: Nguyễn Văn A</span>
            <span>Chứng thư: 0A:1B:2C:3D</span>
            <span>Thuật toán: RSA-PSS 2048 + SHA-256</span>
          </div>
          <Button onClick={handleSign} disabled={signing || signed}>
            {signing ? "Đang ký..." : signed ? "Đã ký thành công" : "Ký số"}
          </Button>
          {signed && (
            <div className="text-sm text-green-600 flex flex-col gap-1">
              <span>Thời gian ký: 4.2 ms</span>
              <span>Signed PDF đã được lưu!</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}