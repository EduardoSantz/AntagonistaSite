# AntagonistaSite

🖤 **Antagonista Merchstore**

---

## Autores

- Eduardo Santos  
- Nícolas André  
- *Victor Martins

---

## Descrição e Objetivo do Projeto

O Antagonista Merchstore é um e-commerce especializado em roupas e acessórios do universo alternativo, com foco em bandas de metal e cultura dark. O projeto visa oferecer uma experiência de compra única para fãs de estilos não convencionais, combinando design diferenciado e uma navegação intuitiva.

---

## Funcionalidades Principais

- **Catálogo de Produtos:** Filtros por categoria e busca otimizada.
- **Autenticação Segura:** Sistema completo de login e registro com hash de senhas.
- **Carrinho de Compras:** Funcionalidade completa para adicionar, remover e atualizar produtos.
- **Detalhes dos Produtos:** Páginas com informações detalhadas sobre cada item.
- **Área Administrativa:** Gestão de produtos, usuários, pedidos e categorias.  
  *A estrutura de backend foi organizada da seguinte forma:*

### Controllers (Controles da Área Administrativa)

- **AdminRoleController.js:**  
  Gerencia os papéis e permissões dos administradores, definindo quais funções cada administrador pode executar no sistema.

- **addressController.js:**  
  Responsável pelo gerenciamento dos endereços associados aos usuários ou clientes, incluindo operações de cadastro, atualização e remoção.

- **adminController.js:**  
  Administra os perfis dos administradores, realizando operações como cadastro, edição, remoção e listagem.

- **authController.js:**  
  Gerencia o processo de autenticação, incluindo login, logout e validação de tokens ou sessões para garantir acesso seguro.

- **categoryController.js:**  
  Controla a criação, edição, listagem e exclusão de categorias, mantendo o catálogo de produtos organizado.

- **globalController.js:**  
  Fornece funções e utilitários de uso geral, como tratamento centralizado de erros e formatação de respostas.

- **orderController.js:**  
  Administra os pedidos realizados pelos clientes, possibilitando a visualização, atualização do status e acompanhamento dos detalhes das transações.

- **productController.js:**  
  Gerencia os produtos da loja, incluindo operações de cadastro, atualização, remoção e listagem, além do controle de detalhes como preços, descrições e imagens.

- **userController.js:**  
  Cuida da gestão dos usuários finais, realizando operações de listagem, atualização, exclusão e manutenção das informações pessoais.

---

## Rotas e Suas Funcionalidades

A arquitetura de rotas segue o padrão REST e está organizada em arquivos específicos para facilitar a manutenção e a escalabilidade do sistema:

- **adminRoutes.js:**  
  Define as rotas para as operações administrativas relacionadas à gestão de administradores e suas permissões.  
  _Funcionalidades:_ Cadastro, edição, remoção e listagem dos administradores, bem como o gerenciamento de roles e permissões.

- **adress Router.js:**  
  Gerencia as rotas destinadas ao cadastro, atualização e remoção de endereços dos usuários.  
  _Funcionalidades:_ Endpoints para criar, editar e excluir endereços, assegurando que os dados de localização estejam sempre atualizados.

- **authRoutes.js:**  
  Contém as rotas para autenticação, como login, logout e verificação de tokens.  
  _Funcionalidades:_ Autenticação segura de usuários e administradores, permitindo acesso controlado às áreas protegidas do sistema.

- **globalRoutes.js:**  
  Agrega rotas de funcionalidades globais e utilitárias que podem ser utilizadas em diversas partes da aplicação.  
  _Funcionalidades:_ Endpoints para tratamento de erros, informações gerais e outras operações comuns.

- **orderRoutes.js:**  
  Define as rotas para o gerenciamento dos pedidos realizados no e-commerce.  
  _Funcionalidades:_ Criação, atualização e consulta de pedidos, permitindo o acompanhamento do status e dos detalhes de cada transação.

- **userRoutes.js:**  
  Organiza as rotas relacionadas à gestão dos usuários finais.  
  _Funcionalidades:_ Cadastro, atualização, exclusão e listagem de usuários, além de operações para gerenciamento das informações pessoais.

- **Server.js:**  
  Arquivo principal que inicializa o servidor, integra as rotas e configura a aplicação para receber e responder às requisições.

---

## Tecnologias Utilizadas

### Frontend

- **HTML5:** Estrutura semântica da aplicação.
- **CSS3:** Estilização com design dark/alternativo.
- **JavaScript:** Interatividade e validações.
- **Bootstrap Icons:** Ícones modernos.

### Backend

- **JavaScript** (ES6+)
- **Node.js**
- **Express:** Framework para criação de APIs REST.
- **Prisma:** ORM moderno para interagir com o banco de dados.
- **PostgreSQL:** Banco de dados relacional gerenciado via Railway Online.

---

## Ferramentas e Infraestrutura

- **Git:** Controle de versão.
- **VS Code:** Ambiente de desenvolvimento.
- **Railway:** Hospedagem e gerenciamento do banco de dados PostgreSQL.
- **Vercel:** Hospedagem do backend e deploy contínuo.

---

## Destaques Técnicos

- **Segurança:** Sistema de autenticação com hash de senhas.
- **Design Responsivo:** Interface otimizada para dispositivos móveis e desktops.
- **Arquitetura MVC:** Organização clara entre controllers, models e rotas.
- **URLs Amigáveis:** Estrutura de rotas bem definida para melhor experiência do usuário.
- **Integração com Meios de Pagamento:** Em desenvolvimento.

---

## Créditos e Fontes de Referência

- [Curso Eccomerce Front-end](https://www.youtube.com/watch?v=yQimoqo0-7g&list=PLjwm_8O3suyM_2Lo9aAIw3HqjOPor8j9g)
- MDN Web Docs
- Bootstrap Icons
- W3Schools PHP Tutorial

---

## Como Executar o Projeto

1. **Clone o Repositório:**

   ```bash
   git clone https://github.com/EduardoSantz/AntagonistaSite.git
   ```

2. **Configure o Ambiente:**

   - **Servidor Node.js com Express**
   - **Banco de Dados PostgreSQL** (Configure a conexão via Railway Online)

3. **Instale as Dependências:**

   ```bash
   cd AntagonistaSite
   npm install
   ```

4. **Configure as Variáveis de Ambiente:**

   - Crie um arquivo `.env` e configure as credenciais de conexão do PostgreSQL, por exemplo:

     ```env
     DATABASE_URL="postgresql://<usuario>:<senha>@<host>:<porta>/<banco>?schema=public"
     PORT=3000
     ```

5. **Execute as Migrações do Prisma:**

   ```bash
   npx prisma migrate dev
   ```

6. **Inicie o Servidor:**

   ```bash
   npm start
   ```

7. **Acesse o Projeto:**

   - Em desenvolvimento: `http://localhost:3000`
   - Em produção (Vercel): o domínio configurado no deploy

---

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE) – sinta-se à vontade para usar e modificar conforme desejar!

---

## Contribuição

Contribuições são bem-vindas! Abra uma issue ou envie um pull request com suas melhorias.

---

### Mensagem Final

🛒 **Visite nossa loja e encontre seu estilo único!**  
"Seja autêntico, vista Antagonista!"

---
