import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { username, password });
      localStorage.setItem("token", data.token);
      onLogin();
      toast.success("Acesso autorizado");
      navigate("/");
    } catch (err) {
      toast.error("Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md relative z-10 px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl mb-6 backdrop-blur-sm">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Bem-vindo ao Fiscal Web</h1>
          <p className="text-muted-foreground">Sistema de gestão fiscal inteligente</p>
        </div>

        <Card className="glass-card border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Usuário</label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Seu usuário"
                    className="h-14 bg-white/5 border-white/10 rounded-2xl pl-4 focus:border-primary/50 transition-all text-lg"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Senha</label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="Sua senha secreta"
                    className="h-14 bg-white/5 border-white/10 rounded-2xl pl-4 focus:border-primary/50 transition-all text-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-primary text-white hover:bg-primary/90 rounded-2xl transition-all shadow-lg shadow-primary/20 text-lg font-bold group"
              >
                {loading ? "Autenticando..." : "Entrar no Sistema"}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="mt-8 text-center text-xs text-muted-foreground uppercase tracking-widest opacity-50">
          Versão 2026 • Ambiente Seguro e Local
        </p>
      </div>
    </div>
  );
}
