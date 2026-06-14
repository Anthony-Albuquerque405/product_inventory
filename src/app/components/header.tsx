"use client";

import { Sun, Moon, LogOut, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";

interface HeaderProps {
  view: "register" | "table";
  setView: (view: "register" | "table") => void;
}

export default function Header({ view, setView }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);

  // Verifica e sincroniza o tema no carregamento inicial
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Alterna o tema
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

  // Logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Erro ao deslogar:", err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-colors duration-500">
      <div className="container mx-auto max-w-6xl p-4 flex justify-between items-center">
        
        {/* Logo */}
        <div className="flex items-center gap-2 select-none">
          <div className="p-2 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl text-white shadow-md shadow-blue-500/20">
            <Package size={20} />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-indigo-200 bg-clip-text text-transparent">
            Stockly
          </h1>
        </div>

        {/* Navegação e Controles */}
        <div className="flex items-center gap-4">
          <nav className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            <button
              onClick={() => setView("register")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                view === "register"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Registrar
            </button>
            <button
              onClick={() => setView("table")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                view === "table"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Inventário
            </button>
          </nav>

          <div className="flex items-center gap-2 border-l border-slate-200/60 dark:border-slate-800/60 pl-3">
            {/* Botão de tema */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              aria-label="Alternar tema"
            >
              {isDark ? (
                <Sun className="text-amber-400 animate-pulse-slow" size={18} />
              ) : (
                <Moon className="text-indigo-600" size={18} />
              )}
            </button>

            {/* Botão de Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition cursor-pointer"
              title="Sair"
              aria-label="Fazer logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
        
      </div>
    </header>
  );
}
