import { NextResponse } from "next/server";
import { getSupabaseUserClient } from "@/app/components/lib/supabaseClient";

// Rota para criar um novo produto no banco de dados
export async function POST(req: Request) {
  try {
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
        { error: "Todos os campos (nome, categoria, quantidade, preço) são obrigatórios" },
        { status: 400 }
      );
    }

    const { error } = await userClient
      .from("products")
      .insert([{ 
        name, 
        category, 
        quantity: Number(quantity), 
        price: Number(price), 
        user_id: user.id 
      }]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Produto registrado com sucesso!" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Buscar produtos vinculados ao usuário autenticado
export async function GET(req: Request) {
  try {
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

    const { data, error } = await userClient
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
