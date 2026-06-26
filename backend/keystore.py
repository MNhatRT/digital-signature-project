import os, json, base64
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding, hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

STORE_PATH = os.path.join(os.path.dirname(__file__), "keystore.enc")

def _derive_key(passphrase: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    return kdf.derive(passphrase.encode())

def save_key(name: str, key_pem: bytes, passphrase: str):
    salt = os.urandom(16)
    iv   = os.urandom(16)
    key  = _derive_key(passphrase, salt)

    padder = padding.PKCS7(128).padder()
    padded = padder.update(key_pem) + padder.finalize()

    cipher     = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    encryptor  = cipher.encryptor()
    ciphertext = encryptor.update(padded) + encryptor.finalize()

    store = {}
    if os.path.exists(STORE_PATH):
        with open(STORE_PATH, "r") as f:
            store = json.load(f)

    store[name] = {
        "salt":       base64.b64encode(salt).decode(),
        "iv":         base64.b64encode(iv).decode(),
        "ciphertext": base64.b64encode(ciphertext).decode()
    }
    with open(STORE_PATH, "w") as f:
        json.dump(store, f, indent=2)
    print(f"[OK] Saved key '{name}' to keystore.")

def load_key(name: str, passphrase: str) -> bytes:
    with open(STORE_PATH, "r") as f:
        store = json.load(f)
    entry      = store[name]
    salt       = base64.b64decode(entry["salt"])
    iv         = base64.b64decode(entry["iv"])
    ciphertext = base64.b64decode(entry["ciphertext"])
    key        = _derive_key(passphrase, salt)

    cipher    = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    padded    = decryptor.update(ciphertext) + decryptor.finalize()

    unpadder = padding.PKCS7(128).unpadder()
    return unpadder.update(padded) + unpadder.finalize()

if __name__ == "__main__":
    BASE = os.path.dirname(os.path.dirname(__file__))

    print("=== Key Store Test ===")

    # Lưu citizen key
    with open(os.path.join(BASE, "users", "citizen.key"), "rb") as f:
        citizen_key = f.read()
    save_key("citizen_nguyenvana", citizen_key, "citizen123")

    # Lưu officer key
    with open(os.path.join(BASE, "users", "officer.key"), "rb") as f:
        officer_key = f.read()
    save_key("officer_tranthib", officer_key, "officer123")

    # Test đọc lại và so sánh
    recovered_citizen = load_key("citizen_nguyenvana", "citizen123")
    recovered_officer = load_key("officer_tranthib",   "officer123")

    assert citizen_key == recovered_citizen, "FAIL: citizen key mismatch!"
    assert officer_key == recovered_officer, "FAIL: officer key mismatch!"

    print("[OK] Citizen key: encrypt → decrypt thành công")
    print("[OK] Officer key: encrypt → decrypt thành công")

    # Test sai passphrase
    try:
        load_key("citizen_nguyenvana", "wrongpassword")
        print("[FAIL] Đáng lẽ phải báo lỗi!")
    except Exception:
        print("[OK] Sai passphrase → bị chặn đúng cách")

    print("=== Tuần 3 HOÀN THÀNH ===")