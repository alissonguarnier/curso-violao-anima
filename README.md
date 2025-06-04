# Curso de Violão - Ânima

## Descrição

O "Curso de Violão - Ânima" é uma plataforma web simples projetada para hospedar e gerenciar um curso de violão online. O site permite que alunos visualizem videoaulas organizadas em módulos e baixem materiais complementares. Administradores têm acesso a um painel para gerenciar o conteúdo do curso, incluindo a adição, edição e remoção de módulos e aulas.

O projeto utiliza HTML, CSS (Tailwind CSS via CDN) e JavaScript puro no frontend, com o Firebase como backend para autenticação de usuários, armazenamento de dados do curso (Firestore) e hospedagem do site.

## Funcionalidades

### Para Alunos (Usuários Autenticados):

- **Login e Cadastro:** Alunos podem criar uma conta e fazer login para acessar o conteúdo do curso.
- **Navegação por Módulos:** Visualizar a lista de módulos disponíveis.
- **Visualização de Aulas:** Dentro de cada módulo, os alunos podem ver a lista de aulas.
- **Player de Vídeo:** Assistir às videoaulas incorporadas diretamente do YouTube.
- **Download de Anexos:** Baixar materiais complementares para cada aula, disponibilizados via link do Google Drive.
- **Logout:** Encerrar a sessão de forma segura.

### Para Administradores:

- **Login de Administrador:** Acesso a uma área de gerenciamento com credenciais específicas.
- **Gerenciamento de Módulos:**
  - Adicionar novos módulos (com nome e ordem de exibição).
  - Editar módulos existentes (nome e ordem).
  - Remover módulos (o que também remove todas as aulas associadas a ele).
- **Gerenciamento de Aulas:**
  - Adicionar novas aulas a um módulo existente (título, ID ou URL do vídeo do YouTube, link do anexo do Google Drive e ordem de exibição).
  - Editar aulas existentes.
  - Remover aulas.
- **Painel de Administrador Minimizável:** O painel pode ser minimizado para não atrapalhar a visualização do conteúdo do curso.
- **Logout de Administrador:** Encerrar a sessão de administrador.

## Tecnologias Utilizadas

- **Frontend:**
  - HTML5
  - CSS3 (com Tailwind CSS via CDN para estilização rápida)
  - JavaScript (Vanilla JS, ES6+ Modules)
- **Backend & Hospedagem:**
  - **Firebase Authentication:** Para login/cadastro de usuários e administradores.
  - **Firebase Firestore:** Banco de dados NoSQL para armazenar informações sobre módulos e aulas.
  - **Firebase Hosting:** Para hospedar o site estático.
- **Outros:**
  - **YouTube:** Para hospedar e incorporar as videoaulas.
  - **Google Drive:** Para disponibilizar os materiais complementares para download.

## Estrutura dos Arquivos

O projeto está organizado da seguinte forma:

- `index.html`: Arquivo principal HTML que contém a estrutura de todas as páginas (login, conteúdo do curso, modais).
- `style.css`: Arquivo CSS que contém os estilos personalizados adicionais, além do Tailwind CSS.
- `main.js`: Arquivo JavaScript que contém toda a lógica da aplicação, incluindo interações com o Firebase, manipulação do DOM, e funcionalidades dos painéis.

## Configuração do Projeto

### 1. Firebase

Siga os passos abaixo para configurar o projeto no Firebase:

- **Crie um Projeto no Firebase Console:**
  - Acesse [console.firebase.google.com](https://console.firebase.google.com).
  - Crie um novo projeto (ex: `curso-violao-anima`).
- **Adicione um Aplicativo Web:**
  - No painel do projeto, clique em `</>` para adicionar um app da Web.
  - Dê um apelido e marque a opção para configurar o Firebase Hosting.
  - Copie o objeto `firebaseConfig` fornecido.
- **Cole o `firebaseConfig` no `main.js`:**
  - Abra o arquivo `main.js`.
  - Substitua o objeto `firebaseConfig` de exemplo pelo que você copiou do console.
- **Configure o Firebase Authentication:**
  - No menu do Firebase Console, vá para "Authentication".
  - Na aba "Sign-in method", habilite o provedor "E-mail/senha".
  - Na aba "Users", adicione o usuário administrador. **O e-mail deste usuário deve ser o mesmo definido na constante `ADMIN_EMAIL` no arquivo `main.js`** (ex: `alissondfla@gmail.com`).
- **Configure o Firestore Database:**
  - Vá para "Firestore Database" e clique em "Criar banco de dados".
  - Inicie no **modo de produção**.
  - Escolha a localização do servidor (ex: `southamerica-east1 (São Paulo)` para usuários no Brasil).
  - Vá para a aba "Regras" e substitua o conteúdo pelas seguintes regras, **lembrando de substituir `"SEU_EMAIL_DE_ADMIN_AQUI"` pelo e-mail real do administrador**:
    ```text
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /artifacts/{appId}/public/data/modules/{moduleId}/{document=**} {
          allow read: if request.auth != null;
          allow write: if request.auth != null && request.auth.token.email == "SEU_EMAIL_DE_ADMIN_AQUI";
        }
        match /artifacts/{appId}/public/data/modules/{moduleId} {
          allow read: if request.auth != null;
          allow write: if request.auth != null && request.auth.token.email == "SEU_EMAIL_DE_ADMIN_AQUI";
        }
      }
    }
    ```
  - Publique as regras.
- **Configure a Constante `ADMIN_EMAIL` no `main.js`:**
  - No arquivo `main.js`, certifique-se de que a constante `ADMIN_EMAIL` está definida com o e-mail correto do administrador:
    ```javascript
    const ADMIN_EMAIL = "alissondfla@gmail.com"; // Substitua se necessário
    ```

### 2. Firebase CLI (Command Line Interface)

- **Instale a Firebase CLI:** Se ainda não tiver, instale globalmente via npm:
  ```bash
  npm install -g firebase-tools
  ```
- **Faça Login:**
  ```bash
  firebase login
  ```
- **Inicie o Firebase na Pasta do Projeto:**
  - Navegue até a pasta raiz do seu projeto (onde estão `index.html`, `main.js`, `style.css`).
  - Execute:
    ```bash
    firebase init hosting
    ```
  - Siga as instruções:
    - Selecione "Use an existing project" e escolha seu projeto Firebase.
    - Para "public directory", digite `.` (ponto), pois seus arquivos estão na raiz.
    - Responda "N" (Não) para "Configure as a single-page app".
    - Responda "N" (Não) para "Set up automatic builds and deploys with GitHub" (por enquanto).
  - Isso criará os arquivos `firebase.json` e `.firebaserc`. Certifique-se de que no `firebase.json`, a configuração de `hosting.public` esteja como `"."`. Se o Firebase tentar sobrescrever seu `index.html`, responda "N" (Não).

## Como Executar e Fazer Deploy

1.  **Testar Localmente:**

    - No terminal, na pasta do projeto, execute:
      ```bash
      firebase serve --only hosting
      ```
    - Abra o endereço fornecido (geralmente `http://localhost:5000`) no seu navegador.

2.  **Fazer Deploy (Publicar):**
    - Após testar e garantir que tudo está funcionando, execute no terminal:
      ```bash
      firebase deploy --only hosting
      ```
    - O CLI fornecerá a URL onde seu site está hospedado (ex: `https://seu-projeto-id.web.app`).

## Próximos Passos e Melhorias Sugeridas

- **Validação de Formulários mais Robusta:** Adicionar validações mais detalhadas nos campos de entrada.
- **Feedback Visual:** Melhorar o feedback visual para o usuário após ações (ex: "Módulo adicionado com sucesso!").
- **Segurança do Administrador:** Para produção, considerar o uso de "Custom Claims" do Firebase Authentication para uma identificação mais segura do administrador, em vez de apenas comparar o e-mail.
- **Remover Tailwind CDN em Produção:** Para otimizar o carregamento, instalar o Tailwind CSS como uma dependência do projeto (via npm) e usá-lo com PostCSS ou Tailwind CLI, conforme recomendado na documentação do Tailwind.
- **Paginação:** Se o número de módulos ou aulas crescer muito.
- **Testes:** Implementar testes unitários e de integração.
