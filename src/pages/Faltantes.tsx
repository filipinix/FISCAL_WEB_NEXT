import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertTriangle, Search, RefreshCcw, 
  ArrowRight, Hash, Layers, LayoutPanelLeft,
  ChevronDown, ChevronUp
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function Faltantes() {
  const [filiais, setFiliais] = useState<any[]>([]);
  const [selectedFilial, setSelectedFilial] = useState<string>("");
  const [faltantes, setFaltantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (selectedFilial) {
      loadFaltantes();
    }
  }, [selectedFilial]);

  const loadConfig = async () => {
    try {
      const { data } = await api.get("/config");
      setFiliais(data.filiais);
      if (data.filiais.length > 0) {
        setSelectedFilial(data.filiais[0].id.toString());
      }
    } catch (err) {
      toast.error("Erro ao carregar configurações");
    }
  };

  const loadFaltantes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/filial/${selectedFilial}/faltantes`);
      setFaltantes(data);
    } catch (err) {
      toast.error("Erro ao buscar quebras de sequência");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-10 space-y-10 max-w-[1200px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">Quebras de Sequência</h2>
          <p className="text-muted-foreground mt-2 font-mono text-[10px] uppercase tracking-[0.2em]">Auditoria de Numeração Fiscal Faltante</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 ml-1">Unidade</span>
            <Select value={selectedFilial} onValueChange={setSelectedFilial}>
              <SelectTrigger className="w-[200px] h-12 bg-card border-white/5 rounded-xl">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/10 rounded-2xl">
                {filiais.map(f => (
                  <SelectItem key={f.id} value={f.id.toString()}>{f.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={loadFaltantes} disabled={loading} className="h-12 w-12 mt-5 p-0 bg-secondary hover:bg-secondary/80 text-white rounded-xl transition-all">
            <RefreshCcw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </header>

      {faltantes.length > 0 ? (
        <div className="grid gap-8">
          {faltantes.map((item, idx) => {
            const key = `${item.modelo}-${item.serie}`;
            return (
              <Card key={key} className="glass-card rounded-[2rem] border-white/5 overflow-hidden">
                <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <AlertTriangle className="w-8 h-8 text-amber-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <Badge className="bg-primary/20 text-primary border-primary/20 rounded-lg px-2">Mod {item.modelo}</Badge>
                        <Badge variant="outline" className="rounded-lg px-2 border-white/10 uppercase text-[10px] font-bold tracking-widest opacity-60">Série {item.serie}</Badge>
                      </div>
                      <h3 className="text-2xl font-bold tracking-tight">
                        {item.faltantesCount} Documentos Faltantes
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        Faixa Detectada: <span className="font-mono font-bold text-foreground">{item.min}</span> <ArrowRight className="w-3 h-3" /> <span className="font-mono font-bold text-foreground">{item.max}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Capturadas</p>
                      <p className="text-xl font-bold font-mono">{item.encontradas}</p>
                    </div>
                    <div className="w-px h-10 bg-white/5" />
                    <Button 
                      onClick={() => toggleExpand(key)}
                      variant="outline" 
                      className="rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 h-14 px-6 gap-3 group"
                    >
                      <span className="font-bold text-xs uppercase tracking-widest">Ver Numerações</span>
                      {expanded[key] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {expanded[key] && (
                  <div className="bg-black/20 p-8 border-t border-white/5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                      {item.lista.map((num: number) => (
                        <div key={num} className="bg-white/5 border border-white/5 rounded-xl p-3 text-center group hover:border-amber-500/30 transition-all">
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Nota Nº</p>
                          <p className="text-sm font-mono font-bold text-amber-500">{num}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : !loading && (
        <Card className="glass-card rounded-[2rem] border-white/5 p-20 flex flex-col items-center text-center opacity-40">
          <Layers className="w-16 h-16 mb-6" />
          <h3 className="text-2xl font-bold uppercase tracking-widest">Nenhuma quebra encontrada</h3>
          <p className="mt-2 text-sm max-w-md mx-auto">Todas as numerações na faixa capturada para esta unidade estão sequencialmente corretas no banco de dados.</p>
        </Card>
      )}
    </div>
  );
}
