import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, Plus, Trash2, Globe, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function Filiais() {
  const [filiais, setFiliais] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFiliais();
  }, []);

  const loadFiliais = async () => {
    try {
      const { data } = await api.get("/config");
      setFiliais(data.filiais);
    } catch (err) {
      toast.error("Erro ao carregar filiais");
    }
  };

  const addFilial = () => {
    const newId = filiais.length > 0 ? Math.max(...filiais.map(f => f.id)) + 1 : 1;
    setFiliais([...filiais, { id: newId, nome: "Nova Unidade", api_url: "http://localhost:3000" }]);
  };

  const removeFilial = (id: number) => {
    setFiliais(filiais.filter(f => f.id !== id));
  };

  const saveConfig = async () => {
    setLoading(true);
    try {
      await api.post("/config/filiais", filiais);
      toast.success("Configurações persistidas");
    } catch (err) {
      toast.error("Falha ao salvar");
    } finally {
      setLoading(false);
    }
  };

  const updateFilial = (id: number, field: string, value: string) => {
    setFiliais(filiais.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  return (
    <div className="p-10 space-y-10 max-w-[1400px] mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">Gerenciar Unidades</h2>
          <p className="text-muted-foreground mt-2 font-mono text-[10px] uppercase tracking-[0.2em]">Configuração de Redes APIs</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={addFilial} variant="outline" className="rounded-2xl border-white/5 bg-card h-12 gap-2 shadow-lg">
            <Plus className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest">Nova Unidade</span>
          </Button>
          <Button onClick={saveConfig} disabled={loading} className="rounded-2xl bg-primary text-white hover:bg-primary/90 h-12 px-8 shadow-xl shadow-primary/20">
            <span className="text-xs font-bold uppercase tracking-widest">{loading ? "Salvando..." : "Salvar Configuração"}</span>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filiais.map((filial) => (
          <Card key={filial.id} className="glass-card rounded-[2rem] border-white/5 relative group p-1 transition-all hover:border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                    <Store className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <input 
                      value={filial.nome} 
                      onChange={(e) => updateFilial(filial.id, "nome", e.target.value)}
                      className="bg-transparent border-none text-xl font-bold focus:outline-none focus:ring-0 w-full hover:bg-white/5 rounded px-1 transition-colors"
                    />
                    <p className="text-[10px] font-mono uppercase tracking-widest opacity-40">Identificador #{filial.id}</p>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeFilial(filial.id)}
                  className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-red-500/20 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Endpoint API Local</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                    <Input 
                      value={filial.api_url} 
                      onChange={(e) => updateFilial(filial.id, "api_url", e.target.value)}
                      className="rounded-2xl border-white/5 bg-white/5 font-mono text-xs h-12 pl-12"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${filial.id % 2 === 0 ? 'bg-red-500' : 'bg-emerald-500'}`} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {filial.id % 2 === 0 ? 'Conexão Offline' : 'Sistema Online'}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" className="h-9 px-4 rounded-xl text-[10px] font-bold uppercase border-white/5 hover:bg-white/5">
                    Check Health
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <button 
          onClick={addFilial}
          className="rounded-[2rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center p-12 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 transition-all group"
        >
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-8 h-8 opacity-40 group-hover:opacity-100 group-hover:text-primary" />
          </div>
          <p className="text-lg font-bold">Vincular Nova Unidade</p>
          <p className="text-xs font-mono uppercase tracking-widest mt-1 opacity-40">Mapear Endereço MySQL Local</p>
        </button>
      </div>
    </div>
  );
}
