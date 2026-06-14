import { NextResponse } from "next/server";
import { getSupabaseUserClient } from "@/app/components/lib/supabaseClient";

// Rota para atualizar um produto específico
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (!token) {
      return NextResponse.json(
        { error: "Acesso não autorizado: Token não fornecido" },
        { status: 401 }
      );
    }

    const userClient = getSupabaseUserClient(token);
    const { data: { user }, error: authError } = await userClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Sessão inválida ou expirada" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, category, quantity, price } = body;

    if (!name || !category || quantity === undefined || price === undefined) {
      return NextResponse.json(
        { error: "Todos os campos (nome, categoria, quantidade, preço) são obrigatórios para atualizar" },
        { status: 400 }
      );
    }

    // O RLS garante que o usuário só consiga atualizar se o produto pertencer a ele (user_id = user.id)
    const { data, error } = await userClient
      .from("products")
      .update({
        name,
        category,
        quantity: Number(quantity),
        price: Number(price),
      })
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Produto não encontrado ou você não tem permissão para editá-lo" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Produto atualizado com sucesso!", data: data[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Rota para deletar um produto específico
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (!token) {
      return NextResponse.json(
        { error: "Acesso não autorizado: Token não fornecido" },
        { status: 401 }
      );
    }

    const userClient = getSupabaseUserClient(token);
    const { data: { user }, error: authError } = await userClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Sessão inválida ou expirada" },
        { status: 401 }
      );
    }

    // O RLS garante que o usuário só consiga deletar se o produto pertencer a ele (user_id = user.id)
    const { error, count } = await userClient
      .from("products")
      .delete({ count: "exact" })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Produto excluído com sucesso!" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
