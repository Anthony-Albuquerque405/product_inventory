-- Script de Banco de Dados para o Inventário de Produtos no Supabase
-- Execute este script no painel SQL Editor do seu projeto Supabase.

-- 1. Criação da tabela 'products'
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Ativar Row Level Security (RLS) para garantir a segurança dos dados
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. Criar Políticas de Acesso (Policies)

-- Permissão para Selecionar (Visualizar) apenas os próprios produtos
CREATE POLICY "Users can view their own products" 
ON public.products 
FOR SELECT 
USING (auth.uid() = user_id);

-- Permissão para Inserir (Cadastrar) produtos associados ao seu próprio user_id
CREATE POLICY "Users can insert their own products" 
ON public.products 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Permissão para Atualizar (Editar) apenas os próprios produtos
CREATE POLICY "Users can update their own products" 
ON public.products 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Permissão para Deletar apenas os próprios produtos
CREATE POLICY "Users can delete their own products" 
ON public.products 
FOR DELETE 
USING (auth.uid() = user_id);
