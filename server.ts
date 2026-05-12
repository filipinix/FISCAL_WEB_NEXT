import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import AdmZip from "adm-zip";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";

// Types
interface Filial {
  id: number;
  nome: string;
  api_url: string;
}

interface Config {
  filiais: Filial[];
  smtp: any;
  export_dir: string;
}

const PORT = 3000;
const SECRET = "fiscal-web-secret-key-123";
const CONFIG_PATH = path.join(process.cwd(), "config.json");

// Helper to read config
function getConfig(): Config {
  if (!fs.existsSync(CONFIG_PATH)) {
    return { filiais: [], smtp: {}, export_dir: "./exports" };
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
}

// Simulation Data for "Local" Python APIs
const mockData: Record<number, any> = {
  1: {
    nfce: Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      chave_acesso: `3526011234567800018955001${(i + 1000).toString().padStart(9, '0')}1345678901`,
      numero_nfce: i + 1001,
      serie: 1,
      modelo: 65,
      data_emissao: new Date(Date.now() - i * 3600000).toISOString(),
      valor_total: (Math.random() * 500 + 50).toFixed(2),
      ativa: 1,
      protocolo_autorizacao: "135260000001234",
      data_autorizacao: new Date().toISOString()
    })),
  },
  2: {
    nfce: Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      chave_acesso: `3526018888888800018955001${(i + 2000).toString().padStart(9, '0')}1345678901`,
      numero_nfce: i + 2001,
      serie: 1,
      modelo: 65,
      data_emissao: new Date(Date.now() - i * 7200000).toISOString(),
      valor_total: (Math.random() * 300 + 20).toFixed(2),
      ativa: 1,
      protocolo_autorizacao: "135260000005555",
      data_autorizacao: new Date().toISOString()
    })),
  }
};

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());

  // --- Auth Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Access denied" });

    jwt.verify(token, SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  // Auth
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    // Simple mock user
    if (username === "admin" && password === "admin") {
      const token = jwt.sign({ username: "admin", role: "admin" }, SECRET, { expiresIn: "8h" });
      res.cookie("token", token, { httpOnly: true });
      return res.json({ token, user: { username: "admin", role: "admin" } });
    }
    res.status(401).json({ error: "Invalid credentials" });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  // Config / Branches
  app.get("/api/config", authenticateToken, (req, res) => {
    res.json(getConfig());
  });

  app.post("/api/config/filiais", authenticateToken, (req, res) => {
    const config = getConfig();
    config.filiais = req.body;
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    res.json({ success: true });
  });

  // Data Proxy (Simulating calls to branch APIs)
  app.get("/api/filial/:id/data", authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    const type = req.query.type as string; // autorizadas, canceladas, etc.
    
    // In a REAL system, this would use axios to fetch from your Python API
    // GET filial.api_url/api/nfce
    const data = mockData[id] ? mockData[id].nfce || [] : [];
    res.json(data);
  });

  // Export
  app.post("/api/export", authenticateToken, async (req, res) => {
    const { filialId, period, types } = req.body;
    const config = getConfig();
    const exportDir = path.join(process.cwd(), config.export_dir || "exports");
    
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const timestamp = Date.now();
    const zipName = `export_${filialId}_${timestamp}.zip`;
    const zipPath = path.join(exportDir, zipName);
    const zip = new AdmZip();

    // Mapping to Python API field names
    const data = mockData[filialId]?.nfce || [];
    data.forEach((note: any) => {
      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?><nfeProc><NFe><infNFe chNFe="${note.chave_acesso}"><ide><nNF>${note.numero_nfce}</nNF></ide></infNFe></NFe></nfeProc>`;
      zip.addFile(`XML/${note.chave_acesso}.xml`, Buffer.from(xmlContent, "utf-8"));
    });

    // Mock PDF Report
    const doc = new PDFDocument();
    const pdfChunks: any[] = [];
    doc.on("data", chunk => pdfChunks.push(chunk));
    
    doc.fontSize(18).text(`Relatório Fiscal - Filial ${filialId}`, { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Período: ${period}`);
    doc.moveDown();
    data.forEach((n: any) => {
      doc.text(`NFCe: ${n.numero_nfce} | Valor: R$ ${n.valor_total} | Chave: ${n.chave_acesso.substring(0, 15)}...`);
    });
    doc.end();

    // Wait for PDF to finish
    await new Promise(resolve => doc.on("end", resolve));
    const pdfBuffer = Buffer.concat(pdfChunks);
    zip.addFile(`RELATORIOS/relatorio.pdf`, pdfBuffer);

    zip.writeZip(zipPath);

    res.json({ downloadUrl: `/api/download/${zipName}` });
  });

  app.get("/api/download/:filename", (req, res) => {
    const filePath = path.join(process.cwd(), "exports", req.params.filename);
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).send("File not found");
    }
  });

  // Health
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // --- Vite / Static Assets ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
