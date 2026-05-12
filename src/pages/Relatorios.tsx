import { useState, useEffect } from "react";
import api from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { 
  Download, Send, RefreshCcw, 
  FileDown, Search, FileJson, FileSpreadsheet,
  ShieldCheck, Mail, Activity
} from "lucide-react";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "../components/ui/select";
import { toast } from "sonner";

export default function Relatorios() {
  const [filiais, setFiliais] = useState<any[]>([]);
  const [selectedFilial, setSelectedFilial] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<any[]>([
    { id: 1, nome: "Fechamento Mensal - Maio 2026", data: "2026-05-12T10:00:00Z", status: "success" },
    { id: 2, nome: "XML Consolidados - Unidade Sul", data: "2026-05-11T14:30:00Z", status: "success" },
    { id: 3, nome: "Relatório de Inconsistências", data: "2026-05-10T09:15:00Z", status: "processing" },
  ]);

  const months = [
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  useEffect(() => {
    loadConfig();
  }, []);

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

  const generateReport = async () => {
    if (!selectedFilial) return toast.error("Selecione uma unidade");
    setLoading(true);
    try {
      const monthLabel = months.find(m => m.value === selectedMonth)?.label;
      const period = `${monthLabel}/${selectedYear}`;
      
      const { data } = await api.post("/export", {
        filialId: parseInt(selectedFilial),
        period: period,
        types: ["xml", "pdf"]
      });

      toast.success("Processamento concluído");
      
      // Open download link
      if (data.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
      }

      setReports(prev => [{
        id: Date.now(),
        nome: `Lote ${filiais.find(f => f.id.toString() === selectedFilial)?.nome} - Ref ${period}`,
        data: new Date().toISOString(),
        status: "success",
        downloadUrl: data.downloadUrl
      }, ...prev]);
    } catch (err) {
      toast.error("Falha ao gerar relatório");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 space-y-10 max-w-[1200px] mx-auto">
      <header>
        <h2 className="text-4xl font-bold tracking-tight">Centro de Exportação</h2>
        <p className="text-muted-foreground mt-2 font-mono text-[10px] uppercase tracking-[0.2em]">Processamento e Consolidação Fiscal</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-1 glass-card rounded-[2rem] border-white/5 p-4">
          <CardHeader className="p-6">
            <CardTitle className="text-xl">Nova Exportação</CardTitle>
            <CardDescription>Configure os parâmetros para extração</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Unidade Origem</label>
                <Select value={selectedFilial} onValueChange={setSelectedFilial}>
                  <SelectTrigger className="h-12 bg-white/5 border-white/5 rounded-2xl">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/10 rounded-2xl">
                    {filiais.map(f => (
                      <SelectItem key={f.id} value={f.id.toString()}>{f.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Mês Fiscal</label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="h-12 bg-white/5 border-white/5 rounded-2xl">
                      <SelectValue placeholder="Mês" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/10 rounded-2xl">
                      {months.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Ano</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="h-12 bg-white/5 border-white/5 rounded-2xl">
                      <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/10 rounded-2xl">
                      {years.map(y => (
                        <SelectItem key={y} value={y}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Formato de Saída</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="rounded-xl border-white/5 bg-white/5 h-20 flex-col gap-2 group hover:border-primary/40">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileJson className="w-4 h-4 text-orange-500" />
                    </div>
                    <span className="text-[10px] font-bold">XML / ZIP</span>
                  </Button>
                  <Button variant="outline" className="rounded-xl border-white/5 bg-white/5 h-20 flex-col gap-2 group hover:border-primary/40">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-bold">EXCEL / CSV</span>
                  </Button>
                </div>
              </div>
            </div>

            <Button 
              onClick={generateReport} 
              disabled={loading} 
              className="w-full h-14 bg-primary text-white hover:bg-primary/90 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
            >
              {loading ? (
                <span className="flex items-center gap-2"><RefreshCcw className="w-4 h-4 animate-spin" /> Processando</span>
              ) : (
                <span className="flex items-center gap-2"><Download className="w-4 h-4" /> Gerar Pacote</span>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 glass-card rounded-[2rem] border-white/5">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Histórico de Sessões</CardTitle>
                <p className="text-sm text-muted-foreground">Últimos 10 processamentos realizados</p>
              </div>
              <Activity className="w-6 h-6 text-primary opacity-20" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {reports.map((report) => (
                <div key={report.id} className="p-8 flex items-center justify-between hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      report.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {report.status === 'success' ? <ShieldCheck className="w-6 h-6" /> : <RefreshCcw className="w-6 h-6 animate-spin" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{report.nome}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                         <span className="font-mono text-xs opacity-60">{new Date(report.data).toLocaleString()}</span>
                         <span className="w-1 h-1 rounded-full bg-white/20" />
                         <span className="text-[10px] font-bold uppercase tracking-widest">{report.status}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" className="h-10 px-4 rounded-xl text-xs font-bold uppercase gap-2 hover:bg-primary/20 hover:text-primary transition-all">
                      <Mail className="w-4 h-4" /> Enviar
                    </Button>
                    {report.downloadUrl && (
                      <Button 
                        onClick={() => window.open(report.downloadUrl, "_blank")}
                        className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {reports.length === 0 && (
                <div className="p-20 text-center opacity-20 flex flex-col items-center">
                  <Search className="w-12 h-12 mb-4" />
                  <p className="font-bold text-xl uppercase tracking-widest italic">Sem Atividade</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
