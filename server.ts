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
    nfce: [
      ...Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        chave_acesso: `3526011234567800018955001${(i + 1001).toString().padStart(9, '0')}1345678901`,
        numero_nfce: i + 1001,
        serie: 1,
        modelo: 65,
        data_emissao: new Date(Date.now() - i * 3600000).toISOString(),
        valor_total: (Math.random() * 500 + 50).toFixed(2),
        ativa: 1,
      })),
      // Missing 1021 to 1023
      ...Array.from({ length: 10 }, (_, i) => ({
        id: i + 21,
        chave_acesso: `3526011234567800018955001${(i + 1024).toString().padStart(9, '0')}1345678901`,
        numero_nfce: i + 1024,
        serie: 1,
        modelo: 65,
        data_emissao: new Date(Date.now() - (i + 25) * 3600000).toISOString(),
        valor_total: (Math.random() * 500 + 50).toFixed(2),
        ativa: 1,
      }))
    ],
  },
  2: {
    nfce: Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      chave_acesso: `3526018888888800018955001${(i + 2001).toString().padStart(9, '0')}1345678901`,
      numero_nfce: i + 2001,
      serie: 1,
      modelo: 65,
      data_emissao: new Date(Date.now() - i * 7200000).toISOString(),
      valor_total: (Math.random() * 300 + 20).toFixed(2),
      ativa: 1,
    })),
  }
};

let auditLogs: any[] = [
  { id: 1, action: "LOGIN", user: "admin", detail: "Autenticação realizada com sucesso", timestamp: new Date(Date.now() - 3600000).toISOString(), type: "info" },
  { id: 2, action: "CONFIG", user: "admin", detail: "Nova unidade vinculada: Matriz São Paulo", timestamp: new Date(Date.now() - 7200000).toISOString(), type: "success" },
];

function addLog(action: string, user: string, detail: string, type: string = "info") {
  auditLogs.unshift({
    id: Date.now(),
    action,
    user,
    detail,
    timestamp: new Date().toISOString(),
    type
  });
  if (auditLogs.length > 100) auditLogs.pop();
}

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
      addLog("LOGIN", "admin", "Autenticação via painel web", "info");
      res.cookie("token", token, { httpOnly: true });
      return res.json({ token, user: { username: "admin", role: "admin" } });
    }
    addLog("LOGIN_FAIL", (username || "unknown"), "Tentativa de acesso negada", "error");
    res.status(401).json({ error: "Invalid credentials" });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  // Logs
  app.get("/api/logs", authenticateToken, (req, res) => {
    res.json(auditLogs);
  });

  // Config / Branches
  app.get("/api/config", authenticateToken, (req, res) => {
    res.json(getConfig());
  });

  app.post("/api/config/filiais", authenticateToken, (req, res) => {
    const config = getConfig();
    config.filiais = req.body;
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    addLog("CONFIG", "admin", `Lista de filiais atualizada (${req.body.length} unidades)`, "success");
    res.json({ success: true });
  });

  // SMTP Proxy/Management
  app.get("/api/smtp", authenticateToken, (req, res) => {
    const config = getConfig();
    res.json(config.smtp ? [config.smtp] : []);
  });

  app.get("/api/smtp/:id", authenticateToken, (req, res) => {
    const config = getConfig();
    // For now we only support one global SMTP config, or we could map by ID
    res.json(config.smtp || null);
  });

  app.post("/api/smtp", authenticateToken, (req, res) => {
    const config = getConfig();
    config.smtp = req.body;
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    addLog("SMTP", "admin", `Configuração de e-mail atualizada (${req.body.host})`, "warning");
    res.json({ success: true, id: req.body.id });
  });

  app.put("/api/smtp/:id", authenticateToken, (req, res) => {
    const config = getConfig();
    config.smtp = req.body;
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    res.json({ success: true });
  });

  app.delete("/api/smtp/:id", authenticateToken, (req, res) => {
    const config = getConfig();
    config.smtp = null;
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

  app.get("/api/filial/:id/faltantes", authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    const notes = mockData[id]?.nfce || [];
    
    if (notes.length === 0) return res.json([]);

    // Logic for finding gaps in sequence per model+serie
    const groups: Record<string, number[]> = {};
    notes.forEach((n: any) => {
      const key = `${n.modelo}_${n.serie}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(n.numero_nfce);
    });

    const faltantes: any[] = [];
    Object.entries(groups).forEach(([key, nums]) => {
      const [modelo, serie] = key.split("_");
      const min = Math.min(...nums);
      const max = Math.max(...nums);
      const gaps: number[] = [];

      for (let i = min; i <= max; i++) {
        if (!nums.includes(i)) {
          gaps.push(i);
        }
      }

      if (gaps.length > 0) {
        faltantes.push({
          modelo,
          serie,
          min,
          max,
          encontradas: nums.length,
          faltantesCount: gaps.length,
          lista: gaps
        });
      }
    });

    res.json(faltantes);
  });

  // Export
  app.post("/api/export", authenticateToken, async (req, res) => {
    const { filialId, period, types } = req.body;
    addLog("EXPORT", "admin", `Geração de pacote fiscal: Unidade ${filialId} - ${period}`, "info");
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
