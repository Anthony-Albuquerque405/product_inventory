"use client";

import { useState } from "react";
import { supabase } from "./lib/supabaseClient";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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

// Schema de validação usando Zod
const productSchema = z.object({
  name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
  category: z.string().min(1, "Selecione uma categoria"),
  quantity: z.number().int().min(0, "A quantidade não pode ser negativa"),
  price: z.number().min(0, "O preço não pode ser negativo"),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductRegistration() {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "",
      quantity: 1,
      price: 0,
    },
  });

  const showNotification = (text: string, type: "success" | "error") => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      setNotification(null);

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
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (res.ok) {
        showNotification("Produto registrado com sucesso!", "success");
        reset();
      } else {
        showNotification(resData.error || "Erro ao registrar produto", "error");
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              placeholder="Ex: Smartphone Galaxy S24"
              {...register("name")}
              className={`w-full border ${errors.name ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500'} rounded-xl pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all`}
            />
          </div>
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
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
              {...register("category")}
              className={`w-full border ${errors.category ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500'} rounded-xl pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer`}
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
          {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
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
                placeholder="0"
                {...register("quantity", { valueAsNumber: true })}
                className={`w-full border ${errors.quantity ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500'} rounded-xl pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all`}
              />
            </div>
            {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity.message}</p>}
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
                step="0.01"
                placeholder="0.00"
                {...register("price", { valueAsNumber: true })}
                className={`w-full border ${errors.price ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500'} rounded-xl pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all`}
              />
            </div>
            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
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
