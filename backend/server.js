const https = require("https");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = "uit-lab-secret-key-2026";

// Database giả lập (tuần sau thay bằng MySQL)
const users = {
  "nguyenvana@citizen.vn": {
    passwordHash: bcrypt.hashSync("pass123", 12),
    role: "citizen",
    name: "Nguyen Van A",
    certSerial: "01",
  },
  "tranthib@gov.vn": {
    passwordHash: bcrypt.hashSync("pass456", 12),
    role: "officer",
    name: "Tran Thi B",
    certSerial: "02",
  },
};

// ── Middleware: Xác thực JWT ──────────────────────────
function authenticate(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ error: "Chua co token" });
  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token khong hop le hoac het han" });
  }
}

// ── Middleware: Kiem tra role ─────────────────────────
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({
        error: `Khong co quyen. Can role: ${roles.join(" hoac ")}`,
      });
    next();
  };
}

// ── API: Login ────────────────────────────────────────
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users[email];
  if (!user || !bcrypt.compareSync(password, user.passwordHash))
    return res.status(401).json({ error: "Sai email hoac mat khau" });

  const token = jwt.sign(
    { email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "30m" },
  );
  res.json({ token, role: user.role, name: user.name });
  console.log(
    `[LOGIN] ${user.name} (${user.role}) dang nhap luc ${new Date().toLocaleTimeString()}`,
  );
});

// ── API: Xem thong tin user hien tai ─────────────────
app.get("/api/me", authenticate, (req, res) => {
  res.json({
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
});

// ── API: Citizen nop ho so ───────────────────────────
app.post(
  "/api/documents/submit",
  authenticate,
  requireRole("citizen"),
  (req, res) => {
    const { filename } = req.body;
    res.json({
      message: `Ho so "${filename}" da nhan boi ${req.user.name}`,
      status: "pending",
      submittedAt: new Date().toISOString(),
    });
    console.log(`[SUBMIT] ${req.user.name} nop ho so: ${filename}`);
  },
);

// ── API: Officer xem tat ca ho so ───────────────────
app.get(
  "/api/documents/all",
  authenticate,
  requireRole("officer"),
  (req, res) => {
    res.json({
      message: "Danh sach ho so (chi officer duoc xem)",
      docs: [
        {
          id: 1,
          filename: "don_cap_phep.pdf",
          status: "pending",
          submittedBy: "Nguyen Van A",
        },
        {
          id: 2,
          filename: "ho_so_khai_sinh.pdf",
          status: "approved",
          submittedBy: "Le Van C",
        },
      ],
    });
  },
);

const { execFile } = require("child_process");
const multer = require("multer");
const path = require("path");

const upload = multer({ dest: "uploads/" });

// ── API: Ký số PDF ────────────────────────────────────
app.post(
  "/api/documents/sign",
  authenticate,
  upload.single("pdf"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Chua co file PDF" });

    const inputPath = req.file.path;
    const outputPath = req.file.path + "_signed.pdf";
    const p12Path = path.join(
      __dirname,
      "..",
      "users",
      `${req.user.role === "citizen" ? "citizen" : "officer"}.p12`,
    );
    const passphrase =
      req.user.role === "citizen" ? "citizen123" : "officer123";
    const start = Date.now();

    execFile(
      "python",
      [
        path.join(__dirname, "sign_pdf.py"),
        inputPath,
        outputPath,
        p12Path,
        passphrase,
      ],
      (err, stdout, stderr) => {
        if (err) {
          console.error("[SIGN ERROR]", stderr);
          return res
            .status(500)
            .json({ error: "Ky so that bai", detail: stderr });
        }
        const ms = Date.now() - start;
        const fileId = path.basename(outputPath);
        console.log(`[SIGN] ${req.user.name} ky xong trong ${ms}ms`);
        res.json({
          message: "Ky so thanh cong",
          signedFile: outputPath,
          downloadId: fileId,
          signingTime: ms,
          signer: req.user.name,
          algorithm: "RSA-PSS 2048 + SHA-256",
        });
      },
    );
  },
);

// ── API: Tai file da ky ve ───────────────────────────
app.get("/api/documents/download/:fileId", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.fileId);
  if (!fs.existsSync(filePath)) {
    return res
      .status(404)
      .json({ error: "File khong ton tai hoac da het han" });
  }
  res.download(filePath, "signed_document.pdf");
});

// ── API: Xác minh chữ ký ─────────────────────────────
app.post("/api/documents/verify", upload.single("pdf"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Chua co file PDF" });

  execFile(
    "python",
    [path.join(__dirname, "verify_pdf.py"), req.file.path],
    (err, stdout, stderr) => {
      if (err) {
        return res.json({
          valid: false,
          reason: "Chu ky khong hop le hoac tai lieu bi sua",
        });
      }
      try {
        const result = JSON.parse(stdout);
        res.json(result);
      } catch {
        res.json({ valid: true, raw: stdout });
      }
    },
  );
});

// ── API: Thông tin chứng thư ──────────────────────────
app.get("/api/certificate/:serial", authenticate, (req, res) => {
  const certs = {
    "01": {
      subject: "CN=Nguyen Van A, emailAddress=nguyenvana@citizen.vn, C=VN",
      issuer: "CN=Demo Root CA, O=UIT Lab, C=VN",
      serial: "01",
      validFrom: "2025-01-01",
      validUntil: "2026-12-31",
      keyUsage: "Digital Signature, Non-Repudiation",
      algorithm: "RSA-PSS 2048-bit + SHA-256",
      status: "active",
    },
    "02": {
      subject: "CN=Tran Thi B, emailAddress=tranthib@gov.vn, C=VN",
      issuer: "CN=Demo Root CA, O=UIT Lab, C=VN",
      serial: "02",
      validFrom: "2025-01-01",
      validUntil: "2026-12-31",
      keyUsage: "Digital Signature, Non-Repudiation",
      algorithm: "RSA-PSS 2048-bit + SHA-256",
      status: "active",
    },
  };
  const cert = certs[req.params.serial];
  if (!cert) return res.status(404).json({ error: "Khong tim thay chung thu" });
  res.json(cert);
});

// ── API: Health check ────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", time: new Date().toISOString() });
});

// ── Khoi dong HTTPS server ────────────────────────────
const PORT = process.env.PORT || 3443;

if (process.env.RENDER) {
  // Tren Render: chay HTTP thuong (Render tu lo HTTPS ben ngoai)
  app.listen(PORT, () => {
    console.log(`HTTP Server chay tai port ${PORT} (Render mode)`);
  });
} else {
  // Chay local: HTTPS tu ky
  const httpsOptions = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.crt"),
  };
  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log("================================================");
    console.log(` HTTPS Server chay tai https://localhost:${PORT}`);
    console.log(" JWT expiry: 30 phut | TLS: active");
    console.log("================================================");
  });
}
