# Sistema de Gerenciamento - Escritório de Advocacia

Sistema moderno de gerenciamento para escritório de advocacia, desenvolvido com React, TypeScript e Firebase.

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca para construção de interfaces
- **TypeScript** - Linguagem tipada para JavaScript
- **Vite** - Build tool e dev server
- **React Router** - Roteamento da aplicação
- **React Bootstrap** - Componentes UI
- **Firebase** - Backend e autenticação
- **Chart.js** - Gráficos e visualizações
- **FontAwesome** - Ícones

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   └── Layout/         # Componentes de layout
├── contexts/           # Contextos React (Auth, etc.)
├── hooks/              # Hooks customizados
├── pages/              # Páginas da aplicação
├── services/           # Serviços de API e Firebase
├── styles/             # Estilos globais
├── types/              # Definições de tipos TypeScript
└── utils/              # Utilitários

public/
├── images/             # Imagens estáticas
└── index.html          # HTML principal
```

## 🛠️ Instalação e Configuração

### Pré-requisitos

- Node.js 16+ 
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd escritorio
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o Firebase:
   - Crie um projeto no Firebase Console
   - Ative Authentication e Firestore
   - Copie as credenciais para `src/services/firebase.ts`

4. Execute o projeto:
```bash
npm run dev
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa o linter
- `npm run type-check` - Verifica tipos TypeScript

## 🏗️ Arquitetura

### Componentes Principais

- **AuthContext**: Gerencia autenticação de usuários
- **Layout**: Estrutura principal com sidebar
- **Sidebar**: Menu de navegação
- **Dashboard**: Página principal com estatísticas

### Serviços

- **Firebase Service**: Configuração do Firebase
- **Atendimento Service**: CRUD de atendimentos
- **Beneficio Service**: CRUD de benefícios
- **Ponto Service**: Controle de ponto

### Hooks Customizados

- **useAuth**: Gerenciamento de autenticação
- **useAtendimentos**: Gerenciamento de atendimentos
- **useBeneficios**: Gerenciamento de benefícios

## 📊 Funcionalidades

### Dashboard
- Estatísticas em tempo real
- Gráficos de atendimentos e benefícios
- Lista de clientes aguardando
- Alertas de ponto

### Autenticação
- Login/Logout
- Controle de acesso por roles
- Proteção de rotas

### Atendimentos
- Cadastro de atendimentos
- Controle de status
- Filtros e busca

### Benefícios
- Cadastro de benefícios
- Controle de status
- Relatórios

### Ponto
- Registro de entrada/saída
- Controle de horas
- Relatórios

## 🔒 Segurança

- Autenticação via Firebase Auth
- Controle de acesso por roles
- Validação de dados
- Proteção de rotas

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop
- Tablet
- Mobile

## 🎨 Design

- Interface moderna e limpa
- Bootstrap 5 para componentes
- Ícones FontAwesome
- Gráficos interativos

## 🚀 Deploy

### Firebase Hosting

1. Instale o Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Faça login:
```bash
firebase login
```

3. Configure o projeto:
```bash
firebase init hosting
```

4. Build e deploy:
```bash
npm run build
firebase deploy
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request


## 👨‍💼 Desenvolvido por

Larissa Souza do Nascimento

---

**Versão**: 2.0.0  
**Última atualização**: Agosto 2025
