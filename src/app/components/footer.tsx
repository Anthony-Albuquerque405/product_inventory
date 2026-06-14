"use client";

import { useState, useEffect } from "react";

export default function Footer() {
  const [dateTime, setDateTime] = useState<Date | null>(null);

  useEffect(() => {
    setDateTime(new Date());
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="w-full bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 text-center p-4 mt-8 transition-colors duration-500">
      <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <p className="font-medium">
          &copy; {dateTime ? dateTime.getFullYear() : new Date().getFullYear()} Stockly. Todos os direitos reservados.
        </p>
        
        {dateTime && (
          <p className="font-mono bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
            {dateTime.toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}{" "}
            • {dateTime.toLocaleTimeString("pt-BR")}
          </p>
        )}
      </div>
    </footer>
  );
}
