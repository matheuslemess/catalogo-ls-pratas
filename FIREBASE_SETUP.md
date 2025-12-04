# 🚀 Guia de Deploy: GitHub & Vercel

Este guia detalha o passo a passo para colocar seu projeto **LS Pratas** online usando **GitHub** para armazenar o código e **Vercel** para hospedar o site.

## 📋 Pré-requisitos

1.  **Conta no GitHub:** [Crie aqui](https://github.com/) se não tiver.
2.  **Conta na Vercel:** [Crie aqui](https://vercel.com/) (pode usar sua conta do GitHub para entrar).
3.  **Git Instalado:** Certifique-se de ter o Git instalado no seu computador.

---

## Passo 1: Subir o Código para o GitHub

1.  **Inicializar o Git (se ainda não fez):**
    Abra o terminal na pasta do seu projeto (`catalogo-cliente`) e execute:
    ```bash
    git init
    ```

2.  **Adicionar os arquivos:**
    ```bash
    git add .
    ```

3.  **Salvar as alterações (Commit):**
    ```bash
    git commit -m "Versão inicial do Catálogo LS Pratas"
    ```

4.  **Criar um Repositório no GitHub:**
    - Vá para [github.com/new](https://github.com/new).
    - Nome do repositório: `catalogo-ls-pratas` (ou o nome que preferir).
    - Visibilidade: **Public** ou **Private** (Private é recomendado se tiver dados sensíveis hardcoded, mas como usamos variáveis de ambiente, Public é ok).
    - Clique em **Create repository**.

5.  **Conectar e Enviar o Código:**
    Copie os comandos que o GitHub mostra na seção "...or push an existing repository from the command line" e cole no seu terminal. Geralmente são:
    ```bash
    git branch -M main
    git remote add origin https://github.com/SEU_USUARIO/catalogo-ls-pratas.git
    git push -u origin main
    ```
    *(Substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub)*

---

## Passo 2: Publicar na Vercel

1.  **Acessar a Vercel:**
    Vá para o [Dashboard da Vercel](https://vercel.com/dashboard).

2.  **Novo Projeto:**
    - Clique em **"Add New..."** e selecione **"Project"**.
    - Na lista "Import Git Repository", encontre seu projeto `catalogo-ls-pratas` e clique em **"Import"**.

3.  **Configurar o Projeto:**
    - **Framework Preset:** Deve detectar automaticamente como `Next.js`.
    - **Root Directory:** Deixe como `./` (padrão).

4.  **⚠️ IMPORTANTE: Variáveis de Ambiente:**
    Você precisa configurar as chaves do Firebase para que o site funcione online.
    - Expanda a seção **"Environment Variables"**.
    - Abra seu arquivo `.env.local` no VS Code.
    - Copie cada variável e valor e adicione na Vercel:

    | Nome (Key) | Valor (Value) |
    | :--- | :--- |
    | `NEXT_PUBLIC_FIREBASE_API_KEY` | *(copie do seu .env.local)* |
    | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | *(copie do seu .env.local)* |
    | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | *(copie do seu .env.local)* |
    | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | *(copie do seu .env.local)* |
    | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | *(copie do seu .env.local)* |
    | `NEXT_PUBLIC_FIREBASE_APP_ID` | *(copie do seu .env.local)* |

    *Dica: Você pode copiar todo o conteúdo do `.env.local` e colar na primeira caixa da Vercel, ela geralmente formata automaticamente.*

5.  **Deploy:**
    - Clique no botão **"Deploy"**.
    - Aguarde alguns instantes enquanto a Vercel constrói seu site.
    - Quando terminar, você verá uma tela de "Congratulations!" com a imagem do seu site.

---

## Passo 3: Configuração Final no Firebase

Para que o login funcione no seu site publicado, você precisa autorizar o domínio da Vercel no Firebase.

1.  Acesse o [Console do Firebase](https://console.firebase.google.com/).
2.  Vá em **Authentication** > **Settings** > **Authorized domains**.
3.  Clique em **"Add domain"**.
4.  Cole o domínio que a Vercel gerou para você (ex: `catalogo-ls-pratas.vercel.app`).
5.  Clique em **Add**.

---

## 🎉 Pronto!

Seu catálogo está online!
- **Link Público:** Compartilhe o link `.vercel.app` com seus clientes.
- **Painel Admin:** Acesse `/admin` no final do link para gerenciar seus produtos.

### Como atualizar o site depois?
Sempre que você fizer alterações no código:
1.  `git add .`
2.  `git commit -m "Descrição da mudança"`
3.  `git push`
A Vercel detectará a mudança automaticamente e atualizará o site em minutos!
