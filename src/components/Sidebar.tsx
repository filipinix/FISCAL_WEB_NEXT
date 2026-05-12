import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Store, FileText, Settings, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Store, label: "Filiais", path: "/filiais" },
  { icon: FileText, label: "Relatórios", path: "/relatorios" },
  { icon: Settings, label: "Configurações", path: "/config" },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  return (
    <aside className="w-64 border-r border-white/5 bg-card/50 backdrop-blur-xl flex flex-col h-screen sticky top-0">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Fiscal Web</h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Next Gen Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <item.icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110`} />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sair</span>
        </Button>
      </div>
    </aside>
  );
}
