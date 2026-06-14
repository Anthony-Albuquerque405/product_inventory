"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/components/lib/supabaseClient";
import { Mail, Lock, LogIn, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Se o usuário já estiver logado, redireciona para o dashboard
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push("/");
      }
    };
    checkSession();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Login realizado com sucesso! Redirecionando...");

        // Salva a sessão no cliente e redireciona
        await supabase.auth.setSession({
          access_token: data.session?.access_token || "",
          refresh_token: data.session?.refresh_token || "",
        });

        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1500);
      } else {
        setErrorMsg(data.error || "Ocorreu um erro ao fazer login.");
      }
    } catch (err) {
      setErrorMsg("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-slate-100 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-4 transition-colors duration-500">
      {/* Círculos de luz decorativos de fundo */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-600/10"></div>
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-80 w-80 rounded-full bg-purple-400/20 blur-3xl dark:bg-purple-600/10"></div>

      <div className="w-full max-w-md bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/80 shadow-2xl rounded-2xl p-8 transition-all duration-300 transform hover:scale-[1.01]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-linear-to-tr from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/25 mb-4 text-white">
            <LogIn size={28} />
          </div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-slate-900 to-indigo-950 dark:from-white dark:to-indigo-200">
            Bem-vindo de volta
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Gerencie seu estoque de forma simples e elegante
          </p>
        </div>

        {/* Banners de status estilizados */}
        {errorMsg && (
          <div className="flex items-center gap-3 p-4 mb-6 text-sm text-red-800 bg-red-50 dark:bg-red-950/30 dark:text-red-300 border border-red-200/50 dark:border-red-900/50 rounded-xl animate-shake">
            <AlertCircle className="shrink-0" size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-3 p-4 mb-6 text-sm text-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/50 rounded-xl animate-fade-in">
            <AlertCircle className="shrink-0 text-emerald-500" size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              E-mail
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                size={18}
              />
              <input
                type="email"
                name="email"
                placeholder="exemplo@email.com"
                value={credentials.email}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Senha
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                size={18}
              />
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={credentials.password}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full relative overflow-hidden group bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none mt-2 cursor-pointer"
          >
            <div className="flex items-center justify-center gap-2">
              <span>{loading ? "Entrando..." : "Acessar Conta"}</span>
              {!loading && (
                <ArrowRight
                  className="group-hover:translate-x-1 transition-transform"
                  size={18}
                />
              )}
            </div>
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-slate-500 dark:text-slate-400">
          Não tem uma conta?{" "}
          <Link
            href="/signup"
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline hover:text-blue-700"
          >
            Cadastre-se grátis
          </Link>
        </p>
      </div>
    </div>
  );
}
