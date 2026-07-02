"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../components/lib/supabaseClient";
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  Smartphone,
  CheckCircle2,
  Loader2
} from "lucide-react";
import ProductAvatar from "../../components/ProductAvatar";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number; // Estoque disponível
}

interface CartItem extends Product {
  cartQuantity: number;
}

export default function PDVPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Estado do Carrinho
  const [cart, setCart] = useState<CartItem[]>([]);
  
  /* 
   * PASSO A PASSO FORMAS DE PAGAMENTO (Frontend)
   * 1. Criamos um estado para guardar a forma de pagamento selecionada.
   *    Iniciamos vazio ou com um padrão (ex: 'Dinheiro').
   * 2. O usuário clica em um dos botões e atualiza este estado.
   * 3. Na hora de finalizar a venda, validamos se algo foi selecionado.
   * 4. Enviamos o valor ('Pix', 'Cartão', 'Dinheiro') junto com a requisição de venda para a API.
   */
  const [paymentMethod, setPaymentMethod] = useState<"Pix" | "Cartão" | "Dinheiro" | "">("");
  const [amountGiven, setAmountGiven] = useState<string>("");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/products", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) && p.quantity > 0
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.cartQuantity >= product.quantity) return prev; // Não permite adicionar mais que o estoque
        return prev.map(item => 
          item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
        );
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const updateCartItem = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.cartQuantity + delta;
        if (newQty <= 0) return item; // Será removido por outro botão se quiser
        if (newQty > item.quantity) return item; // Limite de estoque
        return { ...item, cartQuantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    /* 
     * PASSO A PASSO FORMAS DE PAGAMENTO (Validação)
     * Verificamos se o estado do método de pagamento foi preenchido.
     * Se não, exibimos um alerta e travamos a função para o usuário não finalizar sem escolher.
     */
    if (!paymentMethod) {
      toast.error("Por favor, selecione uma forma de pagamento!");
      return;
    }

    if (paymentMethod === "Dinheiro") {
      const given = Number(amountGiven);
      if (!amountGiven || given < total) {
        toast.error("O valor recebido não pode ser menor que o total da venda!");
        return;
      }
    }

    try {
      setIsProcessing(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      /* 
       * PASSO A PASSO FORMAS DE PAGAMENTO (Envio)
       * Montamos o "payload" da venda. Nele, mandamos a lista do carrinho, 
       * o total, e a FORMA DE PAGAMENTO que o usuário escolheu.
       */
      const payload = {
        cart,
        total,
        paymentMethod
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}` 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess(true);
        setCart([]);
        setPaymentMethod("");
        setAmountGiven("");
        toast.success("Venda finalizada com sucesso!");
        fetchProducts(); // Atualiza o estoque na tela
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errData = await res.json();
        toast.error("Erro ao finalizar venda: " + errData.error);
      }
    } catch (err) {
      toast.error("Erro de conexão ao finalizar venda.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-100px)] animate-pulse">
        <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-2xl h-[500px] lg:h-full"></div>
        <div className="w-full lg:w-96 bg-slate-200 dark:bg-slate-800 rounded-2xl h-[500px] lg:h-full shrink-0"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-100px)] min-h-0">
      
      {/* Coluna Esquerda: Produtos */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden h-[500px] lg:h-full">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Catálogo de Produtos</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar produto por nome..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 gap-4 content-start">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="flex flex-col text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all bg-slate-50 dark:bg-slate-950 group"
            >
              <div className="flex flex-col items-center mb-3">
                <ProductAvatar name={product.name} size="lg" />
              </div>
              <div className="flex-1 mb-2 text-center w-full">
                <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2">{product.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Estoque: {product.quantity}</p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-blue-600 dark:text-blue-400">R$ {Number(product.price).toFixed(2)}</span>
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus size={16} />
                </div>
              </div>
            </button>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-8 text-slate-500">
              Nenhum produto em estoque encontrado.
            </div>
          )}
        </div>
      </div>

      {/* Coluna Direita: Carrinho e Checkout */}
      <div className="w-full lg:w-96 flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 h-[500px] lg:h-full">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-blue-600 dark:text-blue-400" size={20} />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Carrinho</h2>
          </div>
          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 py-0.5 px-2.5 rounded-full text-xs font-bold">
            {cart.length} itens
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
              <ShoppingCart size={40} className="opacity-20" />
              <p className="text-sm text-center">O carrinho está vazio.<br/>Adicione produtos para começar.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                <ProductAvatar name={item.name} size="sm" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{item.name}</h4>
                  <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">
                    R$ {(item.price * item.cartQuantity).toFixed(2)}
                  </div>
                </div>
                
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                  <div className="flex items-center gap-2 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
                    <button onClick={() => updateCartItem(item.id, -1)} className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                      <Minus size={14} />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.cartQuantity}</span>
                    <button onClick={() => updateCartItem(item.id, 1)} className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          
          {/* Seção de Métodos de Pagamento */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Forma de Pagamento</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod("Pix")}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${paymentMethod === "Pix" ? "bg-teal-50 border-teal-500 text-teal-700 dark:bg-teal-900/30 dark:border-teal-400 dark:text-teal-300" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400"}`}
              >
                <Smartphone size={20} className="mb-1" />
                <span className="text-xs font-semibold">Pix</span>
              </button>
              
              <button
                onClick={() => setPaymentMethod("Cartão")}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${paymentMethod === "Cartão" ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-300" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400"}`}
              >
                <CreditCard size={20} className="mb-1" />
                <span className="text-xs font-semibold">Cartão</span>
              </button>

              <button
                onClick={() => setPaymentMethod("Dinheiro")}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${paymentMethod === "Dinheiro" ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-400 dark:text-emerald-300" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400"}`}
              >
                <Banknote size={20} className="mb-1" />
                <span className="text-xs font-semibold">Dinheiro</span>
              </button>
            </div>
            
            {paymentMethod === "Dinheiro" && (
              <div className="mt-4 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl animate-fade-in">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Valor Recebido (R$)
                </label>
                <input
                  type="number"
                  min={total}
                  step="0.01"
                  value={amountGiven}
                  onChange={(e) => setAmountGiven(e.target.value)}
                  placeholder="Ex: 50.00"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                
                {Number(amountGiven) >= total && Number(amountGiven) > 0 && (
                  <div className="mt-2 flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Troco:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      R$ {(Number(amountGiven) - total).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Total</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              R$ {total.toFixed(2)}
            </span>
          </div>

          {success ? (
            <div className="w-full bg-emerald-500 text-white py-3 rounded-xl flex justify-center items-center gap-2 font-bold animate-fade-in">
              <CheckCircle2 size={20} />
              Venda Finalizada!
            </div>
          ) : (
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0 || isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={20} /> : "Finalizar Venda"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
