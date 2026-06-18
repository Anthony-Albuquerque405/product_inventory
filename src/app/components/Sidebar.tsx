"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Package, 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  LogOut, 
  Sun, 
  Moon,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { supabase } from "./lib/supabaseClient";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [role, setRole] = useState<"admin" | "cashier" | null>(null);

  useEffect(() => {
    // Sincronizar tema
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }

    // Buscar profile role
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (data) setRole(data.role);
      }
    };
    fetchProfile();
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard / Estoque", href: "/", icon: LayoutDashboard, roles: ["admin", "cashier"] },
    { name: "Ponto de Venda (PDV)", href: "/pdv", icon: ShoppingCart, roles: ["admin", "cashier"] },
    { name: "Histórico de Vendas", href: "/sales", icon: Package, roles: ["admin", "cashier"] },
    { name: "Funcionários", href: "/employees", icon: Users, roles: ["admin"] },
  ];

  const filteredNavItems = navItems.filter(item => !role || item.roles.includes(role));

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl text-white">
            <Package size={20} />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-indigo-200 bg-clip-text text-transparent">
            Stockly
          </h1>
        </div>
        <button onClick={() => setIsMobileOpen(true)} className="p-2 text-slate-500 dark:text-slate-400">
          <Menu size={24} />
        </button>
      </div>

      {/* Overlay Mobile */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-50 h-screen bg-white dark:bg-slate-900 
        border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col transition-all duration-300
        ${isCollapsed ? "w-20" : "w-64"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Logo Section */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-slate-100 dark:border-slate-800/50">
          <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
            <div className="p-1.5 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-lg text-white">
              <Package size={18} />
            </div>
            <span className="font-bold text-lg dark:text-white whitespace-nowrap">Stockly</span>
          </div>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          
          <button 
            onClick={() => setIsMobileOpen(false)} 
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group
                  ${isActive 
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"}
                `}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon size={20} className={`shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
                <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? "hidden" : "block"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 space-y-2">
          {role && (
            <div className={`px-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800/50 ${isCollapsed ? "hidden" : "block"}`}>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {role === 'admin' ? 'Administrador' : 'Caixa'}
              </span>
            </div>
          )}
          
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isCollapsed ? "justify-center" : ""}`}
            title="Alternar Tema"
          >
            {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
            <span className={`whitespace-nowrap ${isCollapsed ? "hidden" : "block"}`}>
              {isDark ? "Modo Claro" : "Modo Escuro"}
            </span>
          </button>
          
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${isCollapsed ? "justify-center" : ""}`}
            title="Sair"
          >
            <LogOut size={20} />
            <span className={`whitespace-nowrap ${isCollapsed ? "hidden" : "block"}`}>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
