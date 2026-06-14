"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import { 
  Loader2, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  DollarSign, 
  Package, 
  AlertTriangle,
  TrendingUp,
  Inbox,
  AlertCircle,
  MinusCircle,
  Plus,
  Minus
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
}

export default function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Estados de busca e filtro
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Estados de Edição Inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Product | null>(null);

  // Estado de Deleção (confirmação personalizada)
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Estado de Retirada de Quantidade
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeAmount, setRemoveAmount] = useState<number>(1);
  const [zeroStockConfirm, setZeroStockConfirm] = useState(false);

  // Categorias únicas do inventário para preencher os filtros
  const categories = ["Eletrônicos", "Móveis", "Acessórios", "Vestuário", "Alimentos", "Outros"];

  const showNotification = (text: string, type: "success" | "error") => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        showNotification("Sessão expirada. Faça login novamente.", "error");
        return;
      }

      const res = await fetch("/api/products", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      const data = await res.json();

      if (res.ok) {
        setProducts(data);
      } else {
        showNotification(data.error || "Erro ao carregar produtos", "error");
      }
    } catch (err) {
      showNotification("Erro de conexão ao buscar produtos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handler para iniciar edição
  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm({ ...product });
  };

  // Handler para cancelar edição
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  // Handler para salvar edição
  const saveEdit = async () => {
    if (!editForm) return;

    if (editForm.quantity < 0 || editForm.price < 0) {
      showNotification("Valores de quantidade e preço não podem ser negativos.", "error");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        showNotification("Sessão expirada.", "error");
        return;
      }

      const res = await fetch(`/api/products/${editForm.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (res.ok) {
        showNotification("Produto atualizado com sucesso!", "success");
        setProducts(products.map(p => p.id === editForm.id ? data.data : p));
        cancelEdit();
      } else {
        showNotification(data.error || "Erro ao atualizar produto", "error");
      }
    } catch (err) {
      showNotification("Erro de conexão ao salvar alterações", "error");
    }
  };

  // Handler para retirar quantidade do estoque
  const startRemove = (product: Product) => {
    setRemovingId(product.id);
    setRemoveAmount(1);
    setZeroStockConfirm(false);
  };

  const cancelRemove = () => {
    setRemovingId(null);
    setRemoveAmount(1);
    setZeroStockConfirm(false);
  };

  const confirmRemove = async (product: Product) => {
    const newQty = Number(product.quantity) - removeAmount;

    if (newQty <= 0) {
      // Sinaliza para o usuário confirmar a exclusão do produto
      setZeroStockConfirm(true);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { showNotification("Sessão expirada.", "error"); return; }

      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ...product, quantity: newQty }),
      });

      const data = await res.json();
      if (res.ok) {
        showNotification(`${removeAmount} unidade(s) retirada(s) do estoque!`, "success");
        setProducts(products.map(p => p.id === product.id ? { ...p, quantity: newQty } : p));
        cancelRemove();
      } else {
        showNotification(data.error || "Erro ao atualizar quantidade", "error");
      }
    } catch {
      showNotification("Erro de conexão ao atualizar quantidade", "error");
    }
  };

  // Handler para deletar produto
  const deleteProduct = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        showNotification("Sessão expirada.", "error");
        return;
      }

      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        showNotification("Produto excluído com sucesso!", "success");
        setProducts(products.filter(p => p.id !== id));
        setDeletingId(null);
      } else {
        showNotification(data.error || "Erro ao deletar produto", "error");
      }
    } catch (err) {
      showNotification("Erro de conexão ao deletar produto", "error");
    }
  };

  // Métricas
  const totalProducts = products.length;
  const totalQuantity = products.reduce((sum, p) => sum + Number(p.quantity), 0);
  const totalValue = products.reduce((sum, p) => sum + (Number(p.quantity) * Number(p.price)), 0);
  const lowStockCount = products.filter(p => Number(p.quantity) < 5).length;

  // Filtragem
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
        <Loader2 className="animate-spin text-blue-600 dark:text-blue-400 h-8 w-8 mb-2" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Carregando dados do inventário...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Notificação flutuante ou topo */}
      {notification && (
        <div 
          className={`flex items-center gap-3 p-4 mb-2 text-sm rounded-xl border animate-fade-in ${
            notification.type === "success" 
              ? "text-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-900/40"
              : "text-red-800 bg-red-50 dark:bg-red-950/20 dark:text-red-300 border-red-200/50 dark:border-red-900/40"
          }`}
        >
          {notification.type === "success" ? (
            <Check className="text-emerald-500 shrink-0" size={18} />
          ) : (
            <AlertCircle className="text-red-500 shrink-0" size={18} />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Painel de Métricas (Dashboard) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Valor Total */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Valor Total Estocado
            </p>
            <h3 className="text-2xl font-bold text-slate-950 dark:text-white mt-1">
              R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <DollarSign size={22} />
          </div>
        </div>

        {/* Card 2: Total de Itens */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Produtos Únicos
            </p>
            <h3 className="text-2xl font-bold text-slate-950 dark:text-white mt-1">
              {totalProducts}
            </h3>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <Package size={22} />
          </div>
        </div>

        {/* Card 3: Quantidade Total em Estoque */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total de Unidades
            </p>
            <h3 className="text-2xl font-bold text-slate-950 dark:text-white mt-1">
              {totalQuantity}
            </h3>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-xl">
            <TrendingUp size={22} />
          </div>
        </div>

        {/* Card 4: Alerta de Baixo Estoque */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Itens com Baixo Estoque
            </p>
            <h3 className="text-2xl font-bold text-slate-950 dark:text-white mt-1">
              {lowStockCount}
            </h3>
          </div>
          <div className={`p-3 rounded-xl ${
            lowStockCount > 0 
              ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 animate-pulse-slow" 
              : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
          }`}>
            <AlertTriangle size={22} />
          </div>
        </div>

      </div>

      {/* Controles de Busca e Filtro */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Busca por Nome */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Buscar produtos por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>

        {/* Filtro de Categoria */}
        <div className="relative w-full md:w-60">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm cursor-pointer appearance-none"
          >
            <option value="">Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>

      </div>

      {/* Lista de Produtos (Tabela / Grid responsivo) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500 dark:text-slate-400">
            <Inbox className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
            <p className="font-semibold text-lg">Nenhum produto encontrado</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              Tente redefinir seus filtros ou cadastre um novo produto.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/50 dark:border-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Nome</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Quantidade</th>
                  <th className="p-4">Preço (R$)</th>
                  <th className="p-4">Valor Total (R$)</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                {filteredProducts.map((p) => {
                  const isEditing = editingId === p.id;
                  const isDeleting = deletingId === p.id;
                  const isLowStock = Number(p.quantity) < 5;

                  return (
                    <tr 
                      key={p.id} 
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${
                        isLowStock ? "bg-amber-500/[0.02] dark:bg-amber-400/[0.01]" : ""
                      }`}
                    >
                      {/* Nome */}
                      <td className="p-4 font-medium text-slate-900 dark:text-white">
                        {isEditing && editForm ? (
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        ) : (
                          p.name
                        )}
                      </td>

                      {/* Categoria */}
                      <td className="p-4 text-slate-500 dark:text-slate-400">
                        {isEditing && editForm ? (
                          <select
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          >
                            {categories.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                            {p.category}
                          </span>
                        )}
                      </td>

                      {/* Quantidade */}
                      <td className="p-4">
                        {isEditing && editForm ? (
                          <input
                            type="number"
                            value={editForm.quantity}
                            onChange={(e) => setEditForm({ ...editForm, quantity: Number(e.target.value) })}
                            className="w-20 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            min="0"
                          />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {p.quantity}
                            </span>
                            {isLowStock && (
                              <span 
                                className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-1.5 py-0.5 rounded flex items-center gap-0.5"
                                title="Estoque abaixo do limite mínimo (5 unidades)"
                              >
                                <AlertTriangle size={10} />
                                Baixo
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Preço */}
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-mono">
                        {isEditing && editForm ? (
                          <input
                            type="number"
                            value={editForm.price}
                            onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                            className="w-24 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            min="0"
                            step="0.01"
                          />
                        ) : (
                          `R$ ${Number(p.price).toFixed(2)}`
                        )}
                      </td>

                      {/* Valor total */}
                      <td className="p-4 text-slate-900 dark:text-slate-100 font-semibold font-mono">
                        R$ {(Number(p.quantity) * Number(p.price)).toFixed(2)}
                      </td>

                      {/* Ações */}
                      <td className="p-4 text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={saveEdit}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition"
                              title="Salvar alterações"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                              title="Cancelar edição"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : isDeleting ? (
                          <div className="flex justify-end items-center gap-2">
                            <span className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                              Excluir?
                            </span>
                            <button
                              onClick={() => deleteProduct(p.id)}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold transition"
                            >
                              Sim
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[11px] font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                            >
                              Não
                            </button>
                          </div>
                        ) : removingId === p.id ? (
                          // Painel de retirada de quantidade
                          <div className="flex justify-end items-center gap-1.5 animate-fade-in">
                            {zeroStockConfirm ? (
                              // Confirmação de exclusão por estoque zerado
                              <>
                                <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 whitespace-nowrap">
                                  Estoque vai zerar. Excluir?
                                </span>
                                <button
                                  onClick={() => deleteProduct(p.id)}
                                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold transition"
                                >
                                  Sim
                                </button>
                                <button
                                  onClick={() => setZeroStockConfirm(false)}
                                  className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[11px] font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                                >
                                  Não
                                </button>
                              </>
                            ) : (
                              // Input de retirada
                              <>
                                <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 whitespace-nowrap">
                                  Retirar:
                                </span>
                                <button
                                  onClick={() => setRemoveAmount(Math.max(1, removeAmount - 1))}
                                  className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
                                  title="Diminuir"
                                >
                                  <Minus size={13} />
                                </button>
                                <input
                                  type="number"
                                  value={removeAmount}
                                  min={1}
                                  max={p.quantity}
                                  onChange={(e) => setRemoveAmount(Math.max(1, Number(e.target.value)))}
                                  className="w-12 text-center border border-slate-200 dark:border-slate-700 rounded-lg px-1 py-1 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400"
                                />
                                <button
                                  onClick={() => setRemoveAmount(Math.min(p.quantity, removeAmount + 1))}
                                  className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
                                  title="Aumentar"
                                >
                                  <Plus size={13} />
                                </button>
                                <button
                                  onClick={() => confirmRemove(p)}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition"
                                  title="Confirmar retirada"
                                >
                                  <Check size={15} />
                                </button>
                                <button
                                  onClick={cancelRemove}
                                  className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                                  title="Cancelar"
                                >
                                  <X size={15} />
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startRemove(p)}
                              disabled={deletingId !== null || editingId !== null}
                              className="p-1.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg transition disabled:opacity-40"
                              title="Retirar quantidade do estoque"
                            >
                              <MinusCircle size={16} />
                            </button>
                            <button
                              onClick={() => startEdit(p)}
                              disabled={deletingId !== null || removingId !== null}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition disabled:opacity-40"
                              title="Editar produto"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => setDeletingId(p.id)}
                              disabled={deletingId !== null || removingId !== null}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition disabled:opacity-40"
                              title="Excluir produto"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
