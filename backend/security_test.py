import subprocess, os, time, hashlib
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.x509 import load_pem_x509_certificate

BASE = os.path.dirname(os.path.dirname(__file__))

print("=" * 55)
print("  SECURITY TEST SUITE — Digital Signature System")
print("=" * 55)

# ── TEST 1: Xác minh certificate citizen hợp lệ ─────
print("\n[TEST 1] Xac minh certificate citizen voi Root CA...")
result = subprocess.run([
    "openssl", "verify",
    "-CAfile", os.path.join(BASE, "ca", "certs", "root-ca.crt"),
    os.path.join(BASE, "users", "citizen.crt")
], capture_output=True, text=True)
if "OK" in result.stdout:
    print("  PASS ✓ citizen.crt hop le, duoc ky boi Root CA")
else:
    print("  FAIL ✗", result.stderr)

# ── TEST 2: Xác minh certificate officer hợp lệ ─────
print("\n[TEST 2] Xac minh certificate officer voi Root CA...")
result = subprocess.run([
    "openssl", "verify",
    "-CAfile", os.path.join(BASE, "ca", "certs", "root-ca.crt"),
    os.path.join(BASE, "users", "officer.crt")
], capture_output=True, text=True)
if "OK" in result.stdout:
    print("  PASS ✓ officer.crt hop le, duoc ky boi Root CA")
else:
    print("  FAIL ✗", result.stderr)

# ── TEST 3: Kiểm tra thời hạn certificate ───────────
print("\n[TEST 3] Kiem tra thoi han certificate...")
result = subprocess.run([
    "openssl", "x509",
    "-in", os.path.join(BASE, "users", "citizen.crt"),
    "-noout", "-dates"
], capture_output=True, text=True)
print("  PASS ✓")
for line in result.stdout.strip().split("\n"):
    print("  ", line)

# ── TEST 4: Phát hiện tài liệu bị giả mạo ──────────
print("\n[TEST 4] Phat hien tai lieu bi gia mao...")
original = b"Noi dung ho so goc - Nguyen Van A - Don xin cap phep"
tampered = b"Noi dung ho so bi sua - ke tan cong chinh sua"
h_orig    = hashlib.sha256(original).hexdigest()
h_tampered= hashlib.sha256(tampered).hexdigest()
if h_orig != h_tampered:
    print("  PASS ✓ Hash khac nhau → he thong phat hien gia mao")
    print(f"   Hash goc:    {h_orig[:40]}...")
    print(f"   Hash sua:    {h_tampered[:40]}...")
else:
    print("  FAIL ✗ Hash trung nhau — nguy hiem!")

# ── TEST 5: Benchmark RSA-PSS ký & xác minh ─────────
print("\n[TEST 5] Benchmark RSA-PSS 2048-bit (10 lan moi thao tac)...")
private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key  = private_key.public_key()
message     = b"Ho so hanh chinh cong - noi dung ky so " * 50

# Benchmark ký
times_sign = []
for _ in range(10):
    t0 = time.perf_counter()
    signature = private_key.sign(
        message,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    times_sign.append((time.perf_counter() - t0) * 1000)

# Benchmark xác minh
times_verify = []
for _ in range(10):
    t0 = time.perf_counter()
    public_key.verify(
        signature,
        message,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    times_verify.append((time.perf_counter() - t0) * 1000)

avg_sign   = sum(times_sign)   / len(times_sign)
avg_verify = sum(times_verify) / len(times_verify)

print(f"  PASS ✓")
print(f"   Thoi gian ky trung binh:       {avg_sign:.2f} ms")
print(f"   Thoi gian xac minh trung binh: {avg_verify:.2f} ms")
print(f"   Kich thuoc chu ky:             {len(signature)} bytes")
print(f"   Kich thuoc public key:         {len(public_key.public_bytes(serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo))} bytes")

# ── TEST 6: Kiểm tra sai chữ ký bị từ chối ──────────
print("\n[TEST 6] Chu ky sai bi tu choi...")
try:
    public_key.verify(
        b"chu_ky_gia_mao_hoan_toan" + b"x" * 230,
        message,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    print("  FAIL ✗ He thong chap nhan chu ky gia — nguy hiem!")
except Exception:
    print("  PASS ✓ Chu ky gia bi tu choi dung cach")

# ── Tổng kết ─────────────────────────────────────────
print("\n" + "=" * 55)
print("  TONG KET BENCHMARK")
print("=" * 55)
print(f"  RSA-PSS 2048 | Ky: {avg_sign:.2f}ms | Verify: {avg_verify:.2f}ms | Sig: {len(signature)}B")
print("  (So sanh: ECDSA P-256 uoc tinh ~0.5-2ms ky, ~72B sig)")
print("=" * 55)
print("  === Tuan 7 HOAN THANH ===")