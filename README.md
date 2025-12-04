# LS Pratas - Catálogo e Gestão

Este é um projeto [Next.js](https://nextjs.org) desenvolvido para a **LS Pratas**, oferecendo um catálogo digital elegante para clientes e um painel administrativo completo para gestão de estoque e vendas.

## Funcionalidades

### 🛍️ Catálogo Público
- **Vitrine Virtual:** Exibição de produtos com design premium e responsivo.
- **Detalhes do Produto:** Visualização de imagens com zoom (lightbox) e informações detalhadas.
- **Carrinho de Compras:** Adição de produtos à sacola.
- **Integração com WhatsApp:** Envio do pedido diretamente para o WhatsApp da loja com a lista de produtos selecionados.

### 🔐 Painel Administrativo
- **Autenticação Segura:** Login protegido via Firebase Authentication.
- **Dashboard:** Visão geral com estatísticas de produtos, valor total em estoque e faturamento.
- **Gestão de Estoque:**
  - Listagem completa de produtos com filtros e ordenação.
  - Indicadores visuais de estoque baixo e esgotado.
  - Edição rápida de estoque (+/-).
- **Fluxo de Vitrine:** Controle de quais produtos aparecem no catálogo público (`inShowcase`).
- **Gestão de Vendas:**
  - Registro de vendas com baixa automática no estoque.
  - Histórico completo de vendas com data, produto e valor.
- **Cadastro de Produtos:** Upload de imagens, definição de preços e estoque inicial.

## Tecnologias Utilizadas

- **Frontend:** [Next.js 14](https://nextjs.org/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/).
- **Backend / Database:** [Firebase](https://firebase.google.com/) (Firestore, Authentication, Storage).
- **Design:** UI moderna com Glassmorphism, animações suaves e design responsivo (Mobile-First).

## Configuração e Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/catalogo-cliente.git
   cd catalogo-cliente
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env.local` na raiz do projeto com as credenciais do seu projeto Firebase:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_bucket.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
   ```

4. **Execute o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse:**
   - Catálogo: [http://localhost:3000](http://localhost:3000)
   - Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

## Estrutura do Projeto

- `/src/app`: Páginas e rotas do Next.js.
- `/src/components`: Componentes reutilizáveis (Modais, Botões, Seções).
- `/src/context`: Contexto de Autenticação.
- `/src/lib`: Configuração do Firebase.

---
Desenvolvido com ❤️ para LS Pratas.
