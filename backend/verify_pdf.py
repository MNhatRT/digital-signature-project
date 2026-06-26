import sys, json, os
from asn1crypto import pem, x509
from pyhanko.sign.validation import validate_pdf_signature
from pyhanko.pdf_utils.reader import PdfFileReader
from pyhanko_certvalidator.context import ValidationContext

def verify(pdf_path):
    ca_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ca', 'certs', 'root-ca.crt')
    with open(ca_path, 'rb') as ca_file:
        ca_data = ca_file.read()
    if pem.detect(ca_data):
        _, _, ca_der = pem.unarmor(ca_data)
    else:
        ca_der = ca_data
    ca_cert = x509.Certificate.load(ca_der)

    vc = ValidationContext(
        trust_roots=[ca_cert],
        allow_fetching=False,
        revocation_mode='soft-fail'
    )

    with open(pdf_path, "rb") as f:
        r = PdfFileReader(f)
        sigs = r.embedded_signatures
        if not sigs:
            print(json.dumps({ "valid": False, "reason": "Khong co chu ky trong file" }))
            return

        sig = sigs[0]
        status = validate_pdf_signature(sig, vc)

        print(json.dumps({
            "valid": status.valid and status.intact,
            "signer": str(status.signing_cert.subject.human_friendly) if status.signing_cert else "Unknown",
            "signedAt": str(status.signer_reported_dt) if status.signer_reported_dt else "Unknown",
            "algorithm": "RSA-PSS 2048 + SHA-256",
            "intactDocument": status.intact,
            "validSignature": status.valid,
            "certTrusted": status.trusted,
        }))

if __name__ == "__main__":
    verify(sys.argv[1])