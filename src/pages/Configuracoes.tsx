import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Save, RefreshCcw, ShieldCheck, Server, Key } from "lucide-react";
import { toast } from "sonner";

export default function Configuracoes() {
  const [loading, setLoading] = useState(false);
  const [smtp, setSmtp] = useState({
    id: 1,
    host: "",
    port: 587,
    user: "",
    pass_: "",
    tls: 1,
    from_email: "",
    to_email: ""
  });

  useEffect(() => {
    fetchSmtp();
  }, []);

  const fetchSmtp = async () => {
    setLoading(true);
    try {
      // Trying to get ID 1 by default as per the API simulation
      const { data } = await api.get("/api/smtp/1");
      if (data) setSmtp(prev => ({ ...prev, ...data }));
    } catch (err) {
      console.error("Erro ao carregar SMTP:", err);
      // If it fails (maybe 404), we keep the default state for creation
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // First try to update
      try {
        await api.put(`/api/smtp/${smtp.id}`, smtp);
        toast.success("Configurações SMTP salvas!");
      } catch (err) {
        // If update fails, try to create (the API might not have it yet)
        await api.post("/api/smtp", smtp);
        toast.success("Configurações SMTP criadas!");
      }
    } catch (err) {
      toast.error("Falha ao salvar SMTP");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          <ShieldCheck className="w-10 h-10 text-primary" />
          CONFIGURAÇÕES
        </h1>
        <p className="text-muted-foreground font-medium">Gerencie as configurações globais do sistema e integrações.</p>
      </div>

      <Card className="bg-card/50 border-white/5 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Mail className="w-6 h-6 text-primary" />
                Configuração de E-mail (SMTP)
              </CardTitle>
              <CardDescription>Defina o servidor de saída para alertas e envios de XML.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={fetchSmtp} disabled={loading} className="rounded-full">
              <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="host" className="text-xs font-bold uppercase opacity-60">Host do Servidor</Label>
                <div className="relative group">
                  <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="host"
                    placeholder="smtp.exemplo.com"
                    className="pl-10 h-12 bg-white/5 border-white/5 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                    value={smtp.host || ""}
                    onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="port" className="text-xs font-bold uppercase opacity-60">Porta</Label>
                <Input 
                  id="port"
                  type="number"
                  placeholder="587"
                  className="h-12 bg-white/5 border-white/5 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                  value={smtp.port || ""}
                  onChange={(e) => setSmtp({ ...smtp, port: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user" className="text-xs font-bold uppercase opacity-60">Usuário</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="user"
                    placeholder="exemplo@gmail.com"
                    className="pl-10 h-12 bg-white/5 border-white/5 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                    value={smtp.user || ""}
                    onChange={(e) => setSmtp({ ...smtp, user: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pass" className="text-xs font-bold uppercase opacity-60">Senha / App Key</Label>
                <div className="relative group">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="pass"
                    type="password"
                    className="pl-10 h-12 bg-white/5 border-white/5 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                    value={smtp.pass_ || ""}
                    onChange={(e) => setSmtp({ ...smtp, pass_: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="from" className="text-xs font-bold uppercase opacity-60">E-mail de Origem</Label>
                <Input 
                  id="from"
                  placeholder="no-reply@empresa.com"
                  className="h-12 bg-white/5 border-white/5 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                  value={smtp.from_email || ""}
                  onChange={(e) => setSmtp({ ...smtp, from_email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="to" className="text-xs font-bold uppercase opacity-60">E-mail Padrão para Redirecionamento</Label>
                <Input 
                  id="to"
                  placeholder="fiscal@empresa.com"
                  className="h-12 bg-white/5 border-white/5 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                  value={smtp.to_email || ""}
                  onChange={(e) => setSmtp({ ...smtp, to_email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input 
                type="checkbox" 
                id="tls" 
                checked={smtp.tls === 1}
                onChange={(e) => setSmtp({ ...smtp, tls: e.target.checked ? 1 : 0 })}
                className="w-4 h-4 accent-primary" 
              />
              <Label htmlFor="tls" className="text-sm font-medium">Usar conexão segura (TLS)</Label>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full md:w-auto h-14 px-8 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Salvando...' : 'SALVAR CONFIGURAÇÕES'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
