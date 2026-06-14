<div align="center">

# 📦 Stockly

### Sistema de Gerenciamento de Estoque Inteligente

*Controle seu inventário com segurança, elegância e praticidade.*

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.x-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)

<br/>

[🚀 Ver Demonstração](#-começando) · [🐛 Reportar Bug](../../issues) · [💡 Sugerir Feature](../../issues)

</div>

---

## ✨ Sobre o Projeto

**Stockly** é uma aplicação web fullstack de gerenciamento de inventário construída com **Next.js 16**, **TypeScript** e **Supabase**. Projetada com foco em segurança multi-usuário, interface moderna e experiência fluida, é ideal para pequenas e médias empresas que precisam controlar seu estoque de forma eficiente.

---

## 🎯 Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 🔐 **Autenticação Segura** | Login e cadastro com Supabase Auth + JWT |
| 🛡️ **Dados Isolados por Usuário** | Row Level Security (RLS) garante que cada usuário vê apenas o seu estoque |
| 📊 **Dashboard com KPIs** | Cards em tempo real: valor total, unidades, produtos únicos e alertas de baixo estoque |
| 📝 **Cadastro de Produtos** | Formulário com categorias, preço e quantidade — com feedback animado |
| ✏️ **Edição Inline** | Edite qualquer produto diretamente na tabela, sem modais |
| ➖ **Retirada de Quantidade** | Retire unidades do estoque com ajuste de valor e confirmação inteligente |
| 🗑️ **Exclusão com Confirmação** | Diálogo inline elegante antes de remover um item |
| 🔍 **Busca e Filtros** | Pesquise por nome e filtre por categoria em tempo real |
| 🌙 **Tema Dark / Light** | Alternância de tema persistida no `localStorage` |
| 📱 **Design Responsivo** | Interface glassmorphic adaptada para desktop e mobile |

---

## 🛠️ Tecnologias Utilizadas

- **[Next.js 16](https://nextjs.org/)** — Framework React com App Router e API Routes
- **[TypeScript](https://www.typescriptlang.org/)** — Tipagem estática para maior confiabilidade
- **[Supabase](https://supabase.com/)** — Backend as a Service (Auth + PostgreSQL + RLS)
- **[Tailwind CSS 4](https://tailwindcss.com/)** — Estilização utilitária com tema dark/light
- **[Lucide React](https://lucide.dev/)** — Ícones modernos e consistentes
- **[React 19](https://reactjs.org/)** — Interface reativa e performática

---

## 📁 Estrutura do Projeto

```
product_inventory/
├── schema.sql                          # Script SQL para criar tabela e políticas RLS no Supabase
├── .env.example                        # Modelo de variáveis de ambiente
└── src/
    └── app/
        ├── page.tsx                    # Dashboard principal (protegido por auth)
        ├── login/page.tsx              # Página de login
        ├── signup/page.tsx             # Página de cadastro
        ├── api/
        │   ├── login/route.ts          # Endpoint de autenticação
        │   ├── signup/route.ts         # Endpoint de cadastro
        │   └── products/
        │       ├── route.ts            # GET (listar) e POST (criar) produtos
        │       └── [id]/route.ts       # PUT (editar) e DELETE (excluir) produto
        └── components/
            ├── header.tsx              # Cabeçalho com nav, tema e logout
            ├── footer.tsx              # Rodapé com relógio em tempo real
            ├── product_registration.tsx # Formulário de cadastro de produtos
            ├── product_table.tsx       # Tabela com KPIs, filtros e ações CRUD
            └── lib/
                └── supabaseClient.ts   # Cliente Supabase (padrão e autenticado por JWT)
```

## 🔒 Segurança

- Todas as rotas de API validam o **token JWT** no cabeçalho `Authorization: Bearer <token>`
- O banco de dados usa **Row Level Security (RLS)** para garantir isolamento total entre usuários
- Nenhuma chave sensível é exposta no frontend — as `NEXT_PUBLIC_*` são apenas as chaves públicas do Supabase
- O arquivo `.env` está protegido pelo `.gitignore`

---

## 📜 Licença

Distribuído sob a licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes.

---

<div align="center">

Feito com ☕ e muito TypeScript

</div>
