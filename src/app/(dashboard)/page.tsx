"use client";

import { useState, useEffect } from "react";
import ProductTable from "../components/product_table";
import ProductRegistration from "../components/product_registration";
import { Plus, List } from "lucide-react";
import { supabase } from "../components/lib/supabaseClient";

export default function DashboardPage() {
  const [view, setView] = useState<"table" | "register">("table");
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (data) setRole(data.role);
      }
    };
    fetchRole();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {view === "table" ? "Dashboard e Estoque" : "Novo Produto"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {view === "table" 
              ? "Acompanhe suas métricas e gerencie seu inventário." 
              : "Cadastre novos produtos no seu inventário."}
          </p>
        </div>
        
        <div className="flex gap-2">
          {view === "table" ? (
            role === "admin" && (
              <button
                onClick={() => setView("register")}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm shadow-blue-500/20"
              >
                <Plus size={16} />
                Novo Produto
              </button>
            )
          ) : (
            <button
              onClick={() => setView("table")}
              className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
            >
              <List size={16} />
              Voltar ao Estoque
            </button>
          )}
        </div>
      </div>

      {view === "table" ? <ProductTable /> : <ProductRegistration />}
    </div>
  );
}
