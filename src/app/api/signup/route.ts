import { NextResponse } from "next/server";
import { supabase } from "@/app/components/lib/supabaseClient";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    message:
      "Cadastro realizado com sucesso! Verifique seu email para confirmar.",
    user: data.user,
    session: data.session,
  });
}
