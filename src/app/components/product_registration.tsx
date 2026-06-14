"use client";

import { useState } from "react";
import { supabase } from "./lib/supabaseClient";
import {
  PlusCircle,
  Tag,
  Layers,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Loader2,
  FolderPlus,
} from "lucide-react";

export default function ProductRegistration() {
  const [product, setProduct] = useState({
    name: "",
    category: "",
    quantity: 1,
    price: 0,
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const showNotification = (text: string, type: "success" | "error") => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (product.quantity < 0 || product.price < 0) {
      showNotification("Quantidade e preço não podem ser negativos", "error");
      return;
    }

    try {
      setLoading(true);
      setNotification(null);

      // Obter o token do usuário logado
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        showNotification("Sessão expirada. Faça login novamente.", "error");
        return;
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(product),
      });

      const data = await res.json();

      if (res.ok) {
        showNotification("Produto registrado com sucesso!", "success");
        setProduct({ name: "", category: "", quantity: 1, price: 0 });
      } else {
        showNotification(data.error || "Erro ao registrar produto", "error");
      }
    } catch (err) {
      showNotification("Erro inesperado ao conectar com o servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/80 shadow-xl rounded-2xl p-6 md:p-8 mt-6 transition-all duration-300">
      {/* Título da seção */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl mb-3">
          <FolderPlus size={24} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Registrar Produto
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Adicione novos itens ao estoque informando os detalhes abaixo
        </p>
      </div>

      {/* Notificação elegante */}
      {notification && (
        <div
          className={`flex items-center gap-3 p-4 mb-6 text-sm rounded-xl border animate-fade-in ${
            notification.type === "success"
              ? "text-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-900/40"
              : "text-red-800 bg-red-50 dark:bg-red-950/20 dark:text-red-300 border-red-200/50 dark:border-red-900/40"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="shrink-0 text-emerald-500" size={18} />
          ) : (
            <AlertCircle className="shrink-0 text-red-500" size={18} />
          )}
          <span className="font-medium">{notification.text}</span>
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nome do Produto */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Nome do Produto
          </label>
          <div className="relative">
            <Tag
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              size={18}
            />
            <input
              type="text"
              name="name"
              placeholder="Ex: Smartphone Galaxy S24"
              value={product.name}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Categoria */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Categoria
          </label>
          <div className="relative">
            <Layers
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              size={18}
            />
            <select
              name="category"
              value={product.category}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="dark:bg-slate-900">
                Selecione a categoria...
              </option>
              <option value="Eletrônicos" className="dark:bg-slate-900">
                Eletrônicos
              </option>
              <option value="Móveis" className="dark:bg-slate-900">
                Móveis
              </option>
              <option value="Acessórios" className="dark:bg-slate-900">
                Acessórios
              </option>
              <option value="Vestuário" className="dark:bg-slate-900">
                Vestuário
              </option>
              <option value="Alimentos" className="dark:bg-slate-900">
                Alimentos
              </option>
              <option value="Outros" className="dark:bg-slate-900">
                Outros
              </option>
            </select>
            {/* Seta customizada para o select */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quantidade e Preço lado a lado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quantidade */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Quantidade
            </label>
            <div className="relative">
              <PlusCircle
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                size={18}
              />
              <input
                type="number"
                name="quantity"
                placeholder="0"
                value={product.quantity}
                onChange={handleChange}
                min="0"
                required
                className="w-full border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Preço */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Preço Unitário (R$)
            </label>
            <div className="relative">
              <DollarSign
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                size={18}
              />
              <input
                type="number"
                name="price"
                placeholder="0.00"
                value={product.price || ""}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="w-full border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Botão de Enviar */}
        <button
          type="submit"
          disabled={loading}
          className="w-full relative overflow-hidden group bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-4"
        >
          <div className="flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Registrando...</span>
              </>
            ) : (
              <>
                <span>Cadastrar no Estoque</span>
              </>
            )}
          </div>
        </button>
      </form>
    </div>
  );
}
