"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChartData {
  date: string;
  total: number;
}

export default function SalesChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const sevenDaysAgo = subDays(new Date(), 7).toISOString();

      const { data: sales, error } = await supabase
        .from('sales')
        .select('created_at, total_amount')
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Erro ao buscar vendas para gráfico", error);
        return;
      }

      // Processar dados agrupando por dia
      const groupedData: Record<string, number> = {};
      
      // Inicializar os últimos 7 dias com 0
      for (let i = 6; i >= 0; i--) {
        const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
        groupedData[dateStr] = 0;
      }

      sales?.forEach(sale => {
        const dateStr = format(parseISO(sale.created_at), 'yyyy-MM-dd');
        if (groupedData[dateStr] !== undefined) {
          groupedData[dateStr] += Number(sale.total_amount);
        }
      });

      const formattedData = Object.entries(groupedData).map(([date, total]) => ({
        date: format(parseISO(date), 'dd/MMM', { locale: ptBR }),
        total,
      }));

      setData(formattedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[300px] bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse mt-6"></div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm mt-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Receita dos Últimos 7 Dias</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Evolução do volume de vendas</p>
      </div>
      <div className="h-[300px] w-full text-slate-900 dark:text-white">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickFormatter={(value) => `R$ ${value}`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tw-colors-slate-900)' }}
              formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Receita']}
            />
            <Area 
              type="monotone" 
              dataKey="total" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorTotal)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
