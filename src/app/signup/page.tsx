"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/components/lib/supabaseClient";
import { Mail, Lock, UserPlus, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Se o usuário já estiver logado, redireciona para o dashboard
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
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

    // Validação básica de tamanho de senha
    if (credentials.password.length < 6) {
      setErrorMsg("A senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(
          "Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta."
        );
        setCredentials({ email: "", password: "" });
        
        // Se a conta for auto-confirmada e tiver sessão ativa, salva e redireciona
        if (data.session) {
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
          setTimeout(() => {
            router.push("/");
          }, 2000);
        }
      } else {
        setErrorMsg(data.error || "Erro ao realizar o cadastro.");
      }
    } catch (err) {
      setErrorMsg("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-4 transition-colors duration-500">
      
      {/* Círculos de luz decorativos de fundo */}
      <div className="absolute top-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-600/10"></div>
      <div className="absolute bottom-1/4 left-1/4 -z-10 h-80 w-80 rounded-full bg-purple-400/20 blur-3xl dark:bg-purple-600/10"></div>

      <div className="w-full max-w-md bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/80 shadow-2xl rounded-2xl p-8 transition-all duration-300 transform hover:scale-[1.01]">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/25 mb-4 text-white">
            <UserPlus size={28} />
          </div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-white dark:to-indigo-200">
            Crie sua conta
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Cadastre-se para começar a organizar seu estoque
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
          <div className="flex items-start gap-3 p-4 mb-6 text-sm text-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/50 rounded-xl animate-fade-in">
            <CheckCircle2 className="shrink-0 text-emerald-500 mt-0.5" size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="email"
                name="email"
                placeholder="exemplo@email.com"
                value={credentials.email}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="password"
                name="password"
                placeholder="Mínimo 6 caracteres"
                value={credentials.password}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full relative overflow-hidden group bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none mt-2 cursor-pointer"
          >
            <div className="flex items-center justify-center gap-2">
              <span>{loading ? "Cadastrando..." : "Criar Conta"}</span>
              {!loading && <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />}
            </div>
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-slate-500 dark:text-slate-400">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline hover:text-blue-700">
            Faça Login
          </Link>
        </p>
      </div>
    </div>
  );
}
