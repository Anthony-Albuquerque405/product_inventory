"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./components/lib/supabaseClient";
import Footer from "./components/footer";
import Header from "./components/header";
import ProductRegistration from "./components/product_registration";
import ProductTable from "./components/product_table";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [view, setView] = useState<"register" | "table">("register");
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão existente ao carregar a página
    const checkAuth = async () => {
      try {
        const { data: { session: activeSession } } = await supabase.auth.getSession();
        if (!activeSession) {
          router.push("/login");
        } else {
          setSession(activeSession);
        }
      } catch (err) {
        console.error("Erro ao verificar autenticação:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Escutar mudanças no estado de autenticação (ex: logout, expiração)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!currentSession) {
        setSession(null);
        router.push("/login");
      } else {
        setSession(currentSession);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading || !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
        <Loader2 className="animate-spin text-blue-600 dark:text-blue-400 h-10 w-10 mb-4" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Verificando credenciais...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-50 transition-colors duration-500">
      {/* Header com navegação e controle de tema */}
      <Header view={view} setView={setView} />

      {/* Conteúdo principal */}
      <main className="grow container mx-auto p-4 md:p-6 max-w-6xl animate-fade-in">
        {view === "register" ? <ProductRegistration /> : <ProductTable />}
      </main>

      {/* Footer fixo no rodapé */}
      <Footer />
    </div>
  );
}
