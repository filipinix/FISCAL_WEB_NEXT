import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ClipboardList, Search, RefreshCcw, 
  Info, AlertCircle, CheckCircle2, ShieldAlert
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/logs");
      setLogs(data);
    } catch (err) {
      toast.error("Erro ao carregar logs");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.detail.toLowerCase().includes(filter.toLowerCase()) ||
    log.action.toLowerCase().includes(filter.toLowerCase()) ||
    log.user.toLowerCase().includes(filter.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "error": return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case "warning": return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="p-10 space-y-10 max-w-[1200px] mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">Audit Log</h2>
          <p className="text-muted-foreground mt-2 font-mono text-[10px] uppercase tracking-[0.2em]">Rastreabilidade e Segurança do Sistema</p>
        </div>
        <Button onClick={loadLogs} disabled={loading} variant="outline" className="rounded-2xl border-white/5 bg-card h-12 gap-2 shadow-lg">
          <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span className="text-xs font-bold uppercase tracking-widest">Atualizar</span>
        </Button>
      </header>

      <Card className="glass-card rounded-[2rem] border-white/5 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <Input 
              placeholder="Filtrar por ação, usuário ou detalhe..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-12 pl-12 rounded-2xl border-white/5 bg-white/5 focus:ring-1 focus:ring-primary/50 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Total de Eventos:</span>
            <span className="text-xs font-bold">{filteredLogs.length}</span>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-6 hover:bg-white/5 transition-colors group flex items-center gap-6">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5`}>
                   {getIcon(log.type)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                    {log.action}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">por <span className="text-foreground font-bold">{log.user}</span></span>
                </div>
                <p className="text-sm font-medium truncate opacity-80">{log.detail}</p>
              </div>

              <div className="text-right">
                <p className="text-xs font-mono font-bold opacity-40">{new Date(log.timestamp).toLocaleDateString()}</p>
                <p className="text-[10px] font-mono opacity-20">{new Date(log.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="p-20 text-center opacity-20 flex flex-col items-center">
              <ClipboardList className="w-12 h-12 mb-4" />
              <p className="font-bold text-xl uppercase tracking-widest italic">Nenhum Registro</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
