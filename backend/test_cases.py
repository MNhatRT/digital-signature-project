"""
Test Cases - Digital Signature for Public Administrative Services
NT219 - Mat Ma Ung Dung
Nhom: Nguyen Minh Nhat, Tong Thanh Nhan, Bui Tien Khai
"""

import asyncio
import json
import os
import sys
import time
import unittest
import shutil
import subprocess
from pathlib import Path

# ── Cau hinh duong dan ───────────────────────────────────────────────────────
BASE        = Path(__file__).parent.parent          # digital-signature/
BACKEND     = Path(__file__).parent                 # backend/
USERS       = BASE / "users"
CA          = BASE / "ca"
SIGN_PY     = BACKEND / "sign_pdf.py"
VERIFY_PY   = BACKEND / "verify_pdf.py"
TMP         = BACKEND / "test_tmp"

CITIZEN_P12  = USERS / "citizen.p12"
OFFICER_P12  = USERS / "officer.p12"
ROOT_CA_CRT  = CA / "root-ca.crt"

CITIZEN_PASS = b"citizen123"
OFFICER_PASS = b"officer123"

# ── Helper tao PDF don gian ───────────────────────────────────────────────────
def create_test_pdf(path: Path, content: str = "Don xin cap phep xay dung"):
    from reportlab.pdfgen import canvas
    c = canvas.Canvas(str(path))
    c.setFont("Helvetica", 14)
    c.drawString(100, 750, content)
    c.drawString(100, 720, "Nguyen Van A - CCCD: 079123456789")
    c.drawString(100, 690, "Ngay: 25/06/2026")
    c.save()

async def _sign(input_path, output_path, p12, pw):
    """Goi ham ky bat dong bo tu sign_pdf.py"""
    from pyhanko.sign import signers, fields
    from pyhanko.sign.fields import SigFieldSpec
    from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter

    signer = signers.SimpleSigner.load_pkcs12(str(p12), passphrase=pw)
    with open(input_path, "rb") as inf:
        w = IncrementalPdfFileWriter(inf)
        fields.append_signature_field(w, sig_field_spec=SigFieldSpec("Sig1", on_page=0))
        meta = signers.PdfSignatureMetadata(field_name="Sig1")
        with open(output_path, "wb") as outf:
            await signers.async_sign_pdf(w, signature_meta=meta, signer=signer, output=outf)

def sign_pdf(input_path, output_path, p12, pw):
    asyncio.run(_sign(input_path, output_path, p12, pw))

def verify_pdf(pdf_path) -> dict:
    """Chay verify_pdf.py, tra ve dict ket qua"""
    result = subprocess.run(
        [sys.executable, str(VERIFY_PY), str(pdf_path)],
        capture_output=True, text=True
    )
    if result.returncode != 0 or not result.stdout.strip():
        return {"valid": False, "reason": result.stderr.strip() or "Unknown error"}
    return json.loads(result.stdout)


# ═══════════════════════════════════════════════════════════════════════════════
# TC-01: Ky so hop le - Citizen
# ═══════════════════════════════════════════════════════════════════════════════
class TC01_ValidSignCitizen(unittest.TestCase):
    """TC-01: Ky so tai lieu PDF hop le bang chung thu citizen"""

    def setUp(self):
        TMP.mkdir(exist_ok=True)
        self.input_pdf  = TMP / "tc01_input.pdf"
        self.signed_pdf = TMP / "tc01_signed.pdf"
        create_test_pdf(self.input_pdf)

    def test_sign_creates_output_file(self):
        """Ky xong phai tao ra file output"""
        sign_pdf(self.input_pdf, self.signed_pdf, CITIZEN_P12, CITIZEN_PASS)
        self.assertTrue(self.signed_pdf.exists(), "File PDF da ky khong duoc tao ra")

    def test_signed_file_larger_than_original(self):
        """File da ky phai lon hon file goc (co them chu ky nhung vao)"""
        sign_pdf(self.input_pdf, self.signed_pdf, CITIZEN_P12, CITIZEN_PASS)
        orig_size   = self.input_pdf.stat().st_size
        signed_size = self.signed_pdf.stat().st_size
        self.assertGreater(signed_size, orig_size, "File da ky phai lon hon file goc")

    def test_verify_signed_pdf_is_valid(self):
        """Xac minh chu ky cua file vua ky phai tra ve VALID"""
        sign_pdf(self.input_pdf, self.signed_pdf, CITIZEN_P12, CITIZEN_PASS)
        result = verify_pdf(self.signed_pdf)
        self.assertTrue(result.get("valid"), f"Chu ky phai hop le. Ket qua: {result}")

    def test_verify_intact_document(self):
        """Tai lieu khong bi thay doi sau khi ky"""
        sign_pdf(self.input_pdf, self.signed_pdf, CITIZEN_P12, CITIZEN_PASS)
        result = verify_pdf(self.signed_pdf)
        self.assertTrue(result.get("intactDocument", True), "Tai lieu bi bao la da thay doi")

    def tearDown(self):
        shutil.rmtree(TMP, ignore_errors=True)


# ═══════════════════════════════════════════════════════════════════════════════
# TC-02: Ky so hop le - Officer
# ═══════════════════════════════════════════════════════════════════════════════
class TC02_ValidSignOfficer(unittest.TestCase):
    """TC-02: Ky so tai lieu PDF hop le bang chung thu officer"""

    def setUp(self):
        TMP.mkdir(exist_ok=True)
        self.input_pdf  = TMP / "tc02_input.pdf"
        self.signed_pdf = TMP / "tc02_signed.pdf"
        create_test_pdf(self.input_pdf, "Quyet dinh phe duyet ho so")

    def test_officer_sign_valid(self):
        """Officer ky xong phai xac minh duoc"""
        sign_pdf(self.input_pdf, self.signed_pdf, OFFICER_P12, OFFICER_PASS)
        result = verify_pdf(self.signed_pdf)
        self.assertTrue(result.get("valid"), f"Chu ky officer phai hop le. Ket qua: {result}")

    def tearDown(self):
        shutil.rmtree(TMP, ignore_errors=True)


# ═══════════════════════════════════════════════════════════════════════════════
# TC-03: Tai lieu bi gia mao (Tampered Document)
# ═══════════════════════════════════════════════════════════════════════════════
class TC03_TamperedDocument(unittest.TestCase):
    """TC-03: Phat hien tai lieu bi sua sau khi ky"""

    def setUp(self):
        TMP.mkdir(exist_ok=True)
        self.input_pdf  = TMP / "tc03_input.pdf"
        self.signed_pdf = TMP / "tc03_signed.pdf"
        self.tampered   = TMP / "tc03_tampered.pdf"
        create_test_pdf(self.input_pdf)
        sign_pdf(self.input_pdf, self.signed_pdf, CITIZEN_P12, CITIZEN_PASS)

    def test_tampered_content_detected(self):
        """Sua noi dung PDF sau khi ky -> xac minh phai tra ve INVALID"""
        # Doc file da ky, them byte rac vao cuoi
        data = self.signed_pdf.read_bytes()
        # Sua mot vai byte o giua file (khong phai vung chu ky)
        tampered = bytearray(data)
        mid = len(tampered) // 3
        tampered[mid] = (tampered[mid] + 1) % 256
        tampered[mid + 1] = (tampered[mid + 1] + 1) % 256
        self.tampered.write_bytes(bytes(tampered))

        result = verify_pdf(self.tampered)
        self.assertFalse(result.get("valid"), "Tai lieu bi sua phai bi phat hien (INVALID)")

    def test_append_junk_detected(self):
        """Them du lieu rac vao PDF da ky -> phai INVALID"""
        data = self.signed_pdf.read_bytes()
        # Them byte rac truoc doan chu ky (pha vo incremental update)
        junk_pos = len(data) // 2
        tampered = data[:junk_pos] + b"JUNK_INJECTED" + data[junk_pos:]
        self.tampered.write_bytes(tampered)

        result = verify_pdf(self.tampered)
        self.assertFalse(result.get("valid"), "Them byte rac vao PDF phai bi phat hien")

    def tearDown(self):
        shutil.rmtree(TMP, ignore_errors=True)


# ═══════════════════════════════════════════════════════════════════════════════
# TC-04: File PDF chua co chu ky
# ═══════════════════════════════════════════════════════════════════════════════
class TC04_UnsignedPDF(unittest.TestCase):
    """TC-04: Xac minh file PDF chua duoc ky"""

    def setUp(self):
        TMP.mkdir(exist_ok=True)
        self.unsigned_pdf = TMP / "tc04_unsigned.pdf"
        create_test_pdf(self.unsigned_pdf)

    def test_unsigned_pdf_returns_invalid(self):
        """File PDF chua ky -> xac minh phai tra ve INVALID / khong co chu ky"""
        result = verify_pdf(self.unsigned_pdf)
        self.assertFalse(result.get("valid"), "File chua ky phai bao INVALID")

    def tearDown(self):
        shutil.rmtree(TMP, ignore_errors=True)


# ═══════════════════════════════════════════════════════════════════════════════
# TC-05: Sai passphrase khi ky
# ═══════════════════════════════════════════════════════════════════════════════
class TC05_WrongPassphrase(unittest.TestCase):
    """TC-05: Ky voi sai passphrase phai that bai"""

    def setUp(self):
        TMP.mkdir(exist_ok=True)
        self.input_pdf  = TMP / "tc05_input.pdf"
        self.signed_pdf = TMP / "tc05_signed.pdf"
        create_test_pdf(self.input_pdf)

    def test_wrong_passphrase_raises_error(self):
        """Sai passphrase -> qua trinh ky phai nem exception"""
        with self.assertRaises(Exception):
            sign_pdf(self.input_pdf, self.signed_pdf, CITIZEN_P12, b"wrongpassword")

    def tearDown(self):
        shutil.rmtree(TMP, ignore_errors=True)


# ═══════════════════════════════════════════════════════════════════════════════
# TC-06: Benchmark hieu nang ky so
# ═══════════════════════════════════════════════════════════════════════════════
class TC06_Benchmark(unittest.TestCase):
    """TC-06: Do hieu nang ky so va xac minh"""

    ITERATIONS = 5

    def setUp(self):
        TMP.mkdir(exist_ok=True)
        self.input_pdf = TMP / "tc06_input.pdf"
        create_test_pdf(self.input_pdf)

    def test_signing_time_under_500ms(self):
        """Thoi gian ky moi lan phai duoi 500ms (tren may ca nhan binh thuong)"""
        times = []
        for i in range(self.ITERATIONS):
            out = TMP / f"tc06_signed_{i}.pdf"
            t0 = time.perf_counter()
            sign_pdf(self.input_pdf, out, CITIZEN_P12, CITIZEN_PASS)
            elapsed_ms = (time.perf_counter() - t0) * 1000
            times.append(elapsed_ms)

        avg = sum(times) / len(times)
        print(f"\n  [BENCHMARK] Ky so: avg={avg:.1f}ms, min={min(times):.1f}ms, max={max(times):.1f}ms")
        self.assertLess(avg, 500, f"Thoi gian ky trung binh ({avg:.1f}ms) vuot 500ms")

    def test_verification_time_under_200ms(self):
        """Thoi gian xac minh moi lan phai duoi 200ms"""
        signed = TMP / "tc06_bench_signed.pdf"
        sign_pdf(self.input_pdf, signed, CITIZEN_P12, CITIZEN_PASS)

        times = []
        for _ in range(self.ITERATIONS):
            t0 = time.perf_counter()
            verify_pdf(signed)
            elapsed_ms = (time.perf_counter() - t0) * 1000
            times.append(elapsed_ms)

        avg = sum(times) / len(times)
        print(f"\n  [BENCHMARK] Xac minh: avg={avg:.1f}ms, min={min(times):.1f}ms, max={max(times):.1f}ms")
        self.assertLess(avg, 200, f"Thoi gian xac minh trung binh ({avg:.1f}ms) vuot 200ms")

    def tearDown(self):
        shutil.rmtree(TMP, ignore_errors=True)


# ═══════════════════════════════════════════════════════════════════════════════
# TC-07: Keystore - Ma hoa va giai ma khoa
# ═══════════════════════════════════════════════════════════════════════════════
class TC07_Keystore(unittest.TestCase):
    """TC-07: Kiem tra chuc nang ma hoa / giai ma Key Store AES-256"""

    def setUp(self):
        TMP.mkdir(exist_ok=True)
        # Copy keystore module de test doc lap
        self.keystore_path = TMP / "keystore_test.enc"
        # Patch STORE_PATH trong module
        import importlib, types
        self.ks_src = (BACKEND / "keystore.py").read_text()

    def _get_ks_module(self, store_path):
        import types, importlib
        src = self.ks_src.replace(
            'os.path.join(os.path.dirname(__file__), "keystore.enc")',
            f'"{store_path}"'
        )
        mod = types.ModuleType("keystore_tmp")
        exec(compile(src, "keystore_tmp", "exec"), mod.__dict__)
        return mod

    def test_save_and_load_key(self):
        """Luu key va doc lai phai khop chinh xac"""
        ks = self._get_ks_module(str(self.keystore_path))
        dummy_key = b"FAKE_PRIVATE_KEY_DATA_FOR_TEST_" * 3
        ks.save_key("test_key", dummy_key, "testpass123")
        recovered = ks.load_key("test_key", "testpass123")
        self.assertEqual(dummy_key, recovered, "Key doc lai phai khop voi key da luu")

    def test_wrong_passphrase_fails(self):
        """Sai passphrase khi doc key phai nem exception"""
        ks = self._get_ks_module(str(self.keystore_path))
        dummy_key = b"FAKE_PRIVATE_KEY_DATA_FOR_TEST_" * 3
        ks.save_key("test_key2", dummy_key, "correctpass")
        with self.assertRaises(Exception):
            ks.load_key("test_key2", "wrongpass")

    def test_different_keys_stored_independently(self):
        """Nhieu key khac nhau luu doc lap, khong ghi de nhau"""
        ks = self._get_ks_module(str(self.keystore_path))
        key_a = b"KEY_A_DATA_" * 5
        key_b = b"KEY_B_DATA_" * 5
        ks.save_key("key_a", key_a, "passa")
        ks.save_key("key_b", key_b, "passb")
        self.assertEqual(key_a, ks.load_key("key_a", "passa"))
        self.assertEqual(key_b, ks.load_key("key_b", "passb"))

    def tearDown(self):
        shutil.rmtree(TMP, ignore_errors=True)


# ═══════════════════════════════════════════════════════════════════════════════
# TC-08: Khong the ky file khong phai PDF
# ═══════════════════════════════════════════════════════════════════════════════
class TC08_InvalidFileType(unittest.TestCase):
    """TC-08: Ky file khong phai PDF phai that bai"""

    def setUp(self):
        TMP.mkdir(exist_ok=True)
        self.fake_pdf = TMP / "tc08_fake.pdf"
        self.out      = TMP / "tc08_out.pdf"
        # Tao file text gia dang .pdf
        self.fake_pdf.write_text("Day la file text, khong phai PDF that su.")

    def test_sign_non_pdf_raises_error(self):
        """Ky file gia dang PDF (noi dung khong phai PDF) phai nem exception"""
        with self.assertRaises(Exception):
            sign_pdf(self.fake_pdf, self.out, CITIZEN_P12, CITIZEN_PASS)

    def tearDown(self):
        shutil.rmtree(TMP, ignore_errors=True)


# ═══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("=" * 60)
    print(" NT219 - Digital Signature Test Suite")
    print(" Nhom: Nhat - Nhan - Khai")
    print("=" * 60)
    unittest.main(verbosity=2)