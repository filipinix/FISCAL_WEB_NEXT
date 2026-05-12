import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";
import { FileText, Ban, AlertTriangle, Activity, ArrowUpRight, Download, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Dashboard() {
  const [filiais, setFiliais] = useState<any[]>([]);
  const [selectedFilial, setSelectedFilial] = useState<string>("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (selectedFilial) {
      loadBranchData();
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

  const loadBranchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/filial/${selectedFilial}/data?type=autorizadas`);
      setData(data);
    } catch (err) {
      toast.error("Erro ao conectar com a filial");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Capturadas", value: data.length, icon: FileText, color: "text-blue-500", trend: "+12%" },
    { label: "Canceladas", value: 2, icon: Ban, color: "text-red-500", trend: "-5%" },
    { label: "Anomalias", value: 5, icon: AlertTriangle, color: "text-amber-500", trend: "0%" },
    { label: "Saúde API", value: "98%", icon: Activity, color: "text-emerald-500", trend: "Estável" },
  ];

  const chartData = data.slice(0, 15).map((d, i) => ({
    name: `${d.numero}`,
    valor: parseFloat(d.valor)
  })).reverse();

  return (
    <div className="p-10 space-y-10 max-w-[1600px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">Dashboard Central</h2>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" /> Monitoramento em tempo real • Todas as unidades online
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 ml-1">Unidade de Controle</span>
            <Select value={selectedFilial} onValueChange={setSelectedFilial}>
              <SelectTrigger className="w-[240px] h-12 bg-card border-white/5 rounded-xl shadow-lg ring-0 focus:ring-1 focus:ring-primary/50">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/10 rounded-xl">
                {filiais.map(f => (
                  <SelectItem key={f.id} value={f.id.toString()} className="focus:bg-primary/10 focus:text-primary transition-colors">
                    {f.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={loadBranchData} 
            disabled={loading} 
            className="h-12 w-12 mt-5 p-0 bg-secondary hover:bg-secondary/80 text-white rounded-xl transition-all active:scale-95"
          >
            <RefreshCcw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="glass-card rounded-3xl border-white/5 group hover:border-primary/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className={`p-3 rounded-2xl bg-white/5 text-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <Badge variant="outline" className="rounded-full border-white/10 font-mono text-[10px]">
                  {stat.trend}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
                  {typeof stat.value === 'number' && <span className="text-xs opacity-40">unid.</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="xl:col-span-2 glass-card rounded-3xl border-white/5 overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Volume de Vendas</CardTitle>
                <p className="text-sm text-muted-foreground mt-1 font-mono uppercase tracking-widest text-[10px]">Últimas 15 operações capturadas</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Ticket Médio</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10}
                  style={{ fontSize: '10px', fontWeight: 'bold' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  dx={-10}
                  style={{ fontSize: '10px', fontWeight: 'bold' }}
                  tickFormatter={(v) => `R$${v}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a',
                    borderRadius: '16px', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="var(--primary)" 
                  strokeWidth={4} 
                  dot={{ r: 0 }}
                  activeDot={{ r: 6, stroke: 'white', strokeWidth: 2, fill: 'var(--primary)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Action Center */}
        <Card className="glass-card rounded-3xl border-white/5 flex flex-col">
          <CardHeader className="p-8">
            <CardTitle className="text-xl">Central de Alertas</CardTitle>
            <p className="text-sm text-muted-foreground">Ocorrências pendentes de revisão</p>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="space-y-1">
              {[
                { title: "Sequência Quebrada", detail: "Notas 1045 a 1050 faltantes", time: "12m", priority: "high" },
                { title: "Protocolo Inválido", detail: "Erro retornado SEFAZ/SP", time: "1h", priority: "medium" },
                { title: "Sync Pendente", detail: "Filial Sul desatualizada", time: "4h", priority: "low" },
                { title: "Backup OK", detail: "Rotina executada as 04:00", time: "16h", priority: "success" },
              ].map((item, i) => (
                <div key={i} className="px-8 py-4 flex items-start justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="flex gap-4">
                    <div className={`mt-1.5 w-2 h-2 rounded-full ${
                      item.priority === 'high' ? 'bg-red-500' : 
                      item.priority === 'medium' ? 'bg-amber-500' :
                      item.priority === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <h4 className="text-sm font-bold group-hover:text-primary transition-colors">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono opacity-40">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <div className="p-8 border-t border-white/5">
            <Button variant="ghost" className="w-full rounded-xl text-xs uppercase tracking-widest font-bold">Ver Log Completo</Button>
          </div>
        </Card>
      </div>

      {/* Docs Table */}
      <Card className="glass-card rounded-3xl border-white/5 overflow-hidden">
        <div className="p-8 flex items-center justify-between border-b border-white/5">
          <h3 className="text-xl font-bold tracking-tight">Últimas NFC-e Capturadas</h3>
          <Button variant="outline" className="rounded-xl border-white/10 h-10 px-6 hover:bg-primary hover:text-white transition-all">
            Exportar XLS
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 uppercase tracking-widest text-[10px] font-bold text-muted-foreground">
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Documento</th>
                <th className="px-8 py-4">Chave de Acesso</th>
                <th className="px-8 py-4">Emissão</th>
                <th className="px-8 py-4 text-right">Valor Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.slice(0, 8).map((row, i) => (
                <tr key={i} className="hover:bg-primary/5 transition-colors group cursor-pointer">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold uppercase">{row.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div>
                      <p className="text-sm font-bold">NFC-e Nº {row.numero}</p>
                      <p className="text-[10px] font-mono opacity-40">Série {row.serie}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-mono text-[10px] opacity-40 group-hover:opacity-100 transition-opacity">
                    {row.chave}
                  </td>
                  <td className="px-8 py-5 text-sm">
                    {new Date(row.emissao).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 text-right font-bold text-emerald-400">
                    R$ {row.valor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
