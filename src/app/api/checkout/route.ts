import { NextResponse } from "next/server";
import { getSupabaseUserClient } from "../../components/lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: "No authorization header" }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    // Criar um cliente autenticado com o token do usuário
    const userClient = getSupabaseUserClient(token);

    const { data: { user }, error: authError } = await userClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    /* 
     * PASSO A PASSO FORMAS DE PAGAMENTO (Backend / Recebimento)
     * Pegamos os dados que o frontend enviou, incluindo o `paymentMethod`.
     */
    const { cart, total, paymentMethod } = await request.json();

    if (!cart || cart.length === 0 || !paymentMethod) {
      return NextResponse.json({ error: "Carrinho vazio ou forma de pagamento não informada" }, { status: 400 });
    }

    // 1. Descobrir de qual loja (owner_id) o usuário atual é (pode ser o admin ou caixa)
    const { data: profile } = await userClient
      .from('profiles')
      .select('owner_id')
      .eq('id', user.id)
      .single();

    const owner_id = profile?.owner_id || user.id; // Fallback se não tiver profile

    // 2. Criar a Venda (Sale) no banco de dados
    /* 
     * PASSO A PASSO FORMAS DE PAGAMENTO (Backend / Salvando no Banco)
     * Inserimos a venda na tabela `sales`, gravando o valor que veio do frontend no campo `payment_method`.
     */
    const { data: sale, error: saleError } = await userClient
      .from('sales')
      .insert({
        owner_id: owner_id,
        cashier_id: user.id,
        total_amount: total,
        payment_method: paymentMethod // <-- Aqui salvamos no banco
      })
      .select('id')
      .single();

    if (saleError) throw saleError;

    // 3. Criar os itens da venda e deduzir do estoque
    for (const item of cart) {
      // Inserir item
      await userClient
        .from('sale_items')
        .insert({
          sale_id: sale.id,
          product_id: item.id,
          quantity: item.cartQuantity,
          price_at_time: item.price
        });

      // Atualizar estoque (subtrair)
      // Como a chamada é feita pelo usuário autenticado, RLS de UPDATE é ativada.
      // O uso do RPC previne condições de corrida (Race Conditions).
      const { error: rpcError } = await userClient.rpc('decrement_product_quantity', {
        prod_id: item.id,
        qty: item.cartQuantity
      });
      
      if (rpcError) {
        console.error("Erro ao decrementar estoque:", rpcError);
        throw new Error("Erro ao atualizar o estoque.");
      }
    }

    return NextResponse.json({ success: true, saleId: sale.id });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
