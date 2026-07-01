-- Script de Banco de Dados para o Inventário de Produtos e PDV no Supabase
-- Execute este script no painel SQL Editor do seu projeto Supabase.

-- ==========================================
-- 1. Criação da Tabela de Perfis (Profiles)
-- ==========================================
-- Armazena se o usuário é dono (admin) ou funcionário (cashier)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'cashier')),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Admins podem ver/editar perfis da sua loja. Caixas podem ver seu próprio perfil.
CREATE POLICY "Admins manage profiles of their store" ON public.profiles
FOR ALL USING (auth.uid() = id OR auth.uid() = owner_id);

-- Trigger para criar profile automaticamente ao se cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
DECLARE
  v_role TEXT := 'admin';
  v_owner_id UUID := new.id;
BEGIN
  IF new.raw_user_meta_data->>'role' = 'cashier' THEN
    v_role := 'cashier';
    v_owner_id := (new.raw_user_meta_data->>'owner_id')::uuid;
  END IF;

  INSERT INTO public.profiles (id, role, owner_id)
  VALUES (new.id, v_role, v_owner_id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insere profile 'admin' para usuários já existentes
INSERT INTO public.profiles (id, role, owner_id)
SELECT id, 'admin', id FROM auth.users
ON CONFLICT (id) DO NOTHING;


-- ==========================================
-- 2. Criação da Tabela de Produtos
-- ==========================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Este é o owner_id
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Todo usuário (Admin e Caixa) pode visualizar produtos da loja
CREATE POLICY "Users can view store products" ON public.products FOR SELECT 
USING (
    user_id = auth.uid() OR 
    user_id = (SELECT owner_id FROM public.profiles WHERE id = auth.uid())
);

-- Somente admins inserem e deletam
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT 
WITH CHECK (
    user_id = auth.uid() AND 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can delete products" ON public.products FOR DELETE 
USING (
    user_id = auth.uid() AND 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Admins e Caixas podem atualizar (caixas atualizam estoque na venda)
CREATE POLICY "Users can update products" ON public.products FOR UPDATE 
USING (
    user_id = auth.uid() OR 
    user_id = (SELECT owner_id FROM public.profiles WHERE id = auth.uid())
);


-- ==========================================
-- 3. Criação da Tabela de Vendas (Sales)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cashier_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_method TEXT NOT NULL, -- Ex: 'Pix', 'Cartão', 'Dinheiro'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Admins e Caixas veem as vendas da loja
CREATE POLICY "Users can view store sales" ON public.sales FOR SELECT
USING (
    owner_id = auth.uid() OR 
    owner_id = (SELECT owner_id FROM public.profiles WHERE id = auth.uid())
);

-- Admins e Caixas podem inserir vendas
CREATE POLICY "Users can insert sales" ON public.sales FOR INSERT
WITH CHECK (
    owner_id = auth.uid() OR 
    owner_id = (SELECT owner_id FROM public.profiles WHERE id = auth.uid())
);


-- ==========================================
-- 4. Criação da Tabela de Itens da Venda
-- ==========================================
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price_at_time NUMERIC(10, 2) NOT NULL
);

ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- Mesmas permissões baseadas no sale_id
CREATE POLICY "Users can view store sale items" ON public.sale_items FOR SELECT
USING (
    sale_id IN (SELECT id FROM public.sales WHERE owner_id = auth.uid() OR owner_id = (SELECT owner_id FROM public.profiles WHERE id = auth.uid()))
);

CREATE POLICY "Users can insert sale items" ON public.sale_items FOR INSERT
WITH CHECK (
    sale_id IN (SELECT id FROM public.sales WHERE owner_id = auth.uid() OR owner_id = (SELECT owner_id FROM public.profiles WHERE id = auth.uid()))
);


-- ==========================================
-- 5. Funções Auxiliares (RPC)
-- ==========================================
-- Esta função é chamada pela API para dar baixa no estoque de forma segura
-- prevenindo erros se duas pessoas venderem o mesmo produto ao mesmo tempo (Race Conditions)
CREATE OR REPLACE FUNCTION public.decrement_product_quantity(prod_id UUID, qty INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.products
  SET quantity = quantity - qty
  WHERE id = prod_id AND quantity >= qty;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 6. Triggers Auxiliares
-- ==========================================
-- Função para atualizar a coluna updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_product_updated ON public.products;
CREATE TRIGGER on_product_updated
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
