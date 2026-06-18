"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../components/lib/supabaseClient";
import { Loader2, PackageOpen, Calendar, Clock, CreditCard, User, ChevronDown, ChevronUp } from "lucide-react";

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSale, setExpandedSale] = useState<string | null>(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            quantity,
            price_at_time,
            products (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (data) {
        setSales(data);
      } else if (error) {
        console.error("Erro ao buscar vendas", error);
      }
    } catch (err) {
      console.error("Erro na conexão", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedSale(prev => prev === id ? null : id);
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Histórico de Vendas</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Acompanhe todas as vendas realizadas na sua loja.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <PackageOpen size={48} className="opacity-20 mb-4" />
            <p className="font-semibold text-lg">Nenhuma venda registrada</p>
            <p className="text-sm">As vendas feitas no PDV aparecerão aqui.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {sales.map(sale => {
              const isExpanded = expandedSale === sale.id;
              const date = new Date(sale.created_at);
              
              return (
                <div key={sale.id} className="group">
                  {/* Linha principal da Venda */}
                  <div 
                    onClick={() => toggleExpand(sale.id)}
                    className="flex flex-wrap md:flex-nowrap items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-[200px]">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                        <PackageOpen size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          R$ {Number(sale.total_amount).toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <CreditCard size={12} /> {sale.payment_method}
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:flex flex-col items-start gap-1 w-48">
                      <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Calendar size={13} /> {date.toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Clock size={13} /> {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                      <User size={13} />
                      <span className="truncate max-w-[100px]" title={sale.cashier_id}>
                        {sale.cashier_id.substring(0, 8)}...
                      </span>
                    </div>

                    <div className="text-slate-400 group-hover:text-blue-500 transition-colors">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {/* Detalhes da Venda (Itens) */}
                  {isExpanded && (
                    <div className="bg-slate-50 dark:bg-slate-950/50 p-4 border-t border-slate-100 dark:border-slate-800/50 animate-fade-in">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Itens da Venda</h4>
                      <div className="space-y-2">
                        {sale.sale_items?.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-sm">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-slate-900 dark:text-white">{item.products?.name || "Produto Excluído"}</span>
                              <span className="text-slate-500">x{item.quantity}</span>
                            </div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              R$ {(item.price_at_time * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
