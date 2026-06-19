"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../components/lib/supabaseClient";
import { createClient } from "@supabase/supabase-js";
import { Loader2, Plus, Users, UserPlus, Check, X, Mail, KeyRound } from "lucide-react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setAdminId(session.user.id);

      // Buscar todos os profiles onde o owner_id é o admin logado E role é cashier
      // O Supabase tem auth.users que não podemos ler diretamente pelo front. 
      // Mas podemos ler da tabela `profiles`.
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('owner_id', session.user.id)
        .eq('role', 'cashier');
        
      if (data) setEmployees(data);
    } catch (err) {
      console.error("Erro ao buscar funcionários:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Preencha email e senha.");
      return;
    }
    if (!adminId) {
      alert("Erro: ID do admin não encontrado. Recarregue a página.");
      return;
    }

    try {
      setIsCreating(true);
      
      // Cria um client temporário para não deslogar o Admin
      const tempClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
      );

      const { data, error } = await tempClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: "cashier",
            owner_id: adminId
          }
        }
      });

      if (error) {
        console.error("SignUp Error:", error);
        alert("Erro ao criar funcionário: " + error.message);
      } else {
        alert("Funcionário criado com sucesso!");
        setShowForm(false);
        setEmail("");
        setPassword("");
        fetchEmployees();
      }
    } catch (err: any) {
      console.error("Catch Error:", err);
      alert("Erro ao conectar: " + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gerenciar Funcionários</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cadastre contas de "Caixa" para seus funcionários acessarem o sistema.
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${showForm ? "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-white" : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20"}`}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Cancelar" : "Novo Caixa"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateEmployee} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-fade-in max-w-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <UserPlus size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Adicionar Novo Caixa</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                E-mail de Acesso
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="funcionario@loja.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Senha Provisória
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Minimo de 6 caracteres"
                  minLength={6}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isCreating}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isCreating ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
            Cadastrar Funcionário
          </button>
        </form>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Users size={48} className="opacity-20 mb-4" />
            <p className="font-semibold text-lg">Nenhum funcionário cadastrado</p>
            <p className="text-sm">Clique em "Novo Caixa" para adicionar membros à sua equipe.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">ID do Perfil</th>
                  <th className="p-4">Cargo</th>
                  <th className="p-4">Data de Criação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="p-4 font-mono text-xs text-slate-500 dark:text-slate-400">{emp.id}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300">
                        Caixa
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(emp.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
