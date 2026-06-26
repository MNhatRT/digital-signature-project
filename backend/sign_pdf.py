import sys
sys.stdout.reconfigure(encoding='utf-8')
import asyncio, os
from pyhanko.sign import signers, fields
from pyhanko.sign.fields import SigFieldSpec
from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter

BASE = os.path.dirname(os.path.dirname(__file__))

async def sign_pdf(input_path, output_path, p12_path, passphrase):
    signer = signers.SimpleSigner.load_pkcs12(p12_path, passphrase=passphrase)
    with open(input_path, "rb") as inf:
        w = IncrementalPdfFileWriter(inf)
        fields.append_signature_field(
            w, sig_field_spec=SigFieldSpec("Sig1", on_page=0)
        )
        meta = signers.PdfSignatureMetadata(field_name="Sig1")
        with open(output_path, "wb") as outf:
            await signers.async_sign_pdf(
                w, signature_meta=meta, signer=signer, output=outf
            )
    print(f"[OK] Signed PDF saved: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) >= 5:
        # Gọi từ Node.js: nhận arguments
        asyncio.run(sign_pdf(
            input_path  = sys.argv[1],
            output_path = sys.argv[2],
            p12_path    = sys.argv[3],
            passphrase  = sys.argv[4].encode()
        ))
    else:
        # Chạy standalone test
        from reportlab.pdfgen import canvas
        input_path  = os.path.join(BASE, "backend", "test_input.pdf")
        output_path = os.path.join(BASE, "backend", "test_signed.pdf")
        p12_path    = os.path.join(BASE, "users", "citizen.p12")
        c = canvas.Canvas(input_path)
        c.setFont("Helvetica", 14)
        c.drawString(100, 750, "Don xin cap phep xay dung")
        c.save()
        asyncio.run(sign_pdf(input_path, output_path, p12_path, b"citizen123"))
        print("=== Tuan 4 HOAN THANH ===")