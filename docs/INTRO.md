# Labpoint Frontend

Documentação básica para orientar o desenvolvimento do frontend do Labpoint.

## Pré-requisitos

- Node.js instalado
- npm instalado
- API do Labpoint disponível quando a aplicação precisar acessar dados do backend

## Executando o projeto

Instale as dependências e inicie o servidor de desenvolvimento:

```bash
npm install
npm run dev
```

A aplicação será disponibilizada em `http://localhost:3000`.

Comandos úteis:

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera a versão de produção |
| `npm run preview` | Executa localmente a versão de produção |
| `npm run check` | Executa as verificações do Biome |
| `npm run format` | Formata os arquivos com o Biome |
| `npm run lint` | Executa o lint do projeto |
| `npm run generate-routes` | Regenera a árvore de rotas do TanStack Router |
| `npm run generate:types` | Gera tipos TypeScript a partir da documentação OpenAPI da API |

## Estrutura principal

```text
src/
├── routes/                         # Páginas e configuração de rotas
│   ├── __root.tsx                  # Layout raiz da aplicação
│   ├── _public/                    # Rotas acessíveis sem login
│   │   ├── route.tsx
│   │   ├── index.tsx               # Página inicial pública
│   │   ├── sign-up.tsx             # Cadastro
│   │   └── forget-password.tsx     # Recuperação de senha
│   └── _private/                   # Rotas que exigem usuário autenticado
│       ├── route.tsx               # Proteção/layout das rotas privadas
│       ├── home.tsx                # Página inicial após o login
│       ├── history.tsx             # Histórico de reservas
│       └── admin/                  # Funcionalidades administrativas
│           ├── route.tsx
│           ├── manage-reserves.tsx
│           ├── manage-spaces.tsx
│           ├── manage-users.tsx
│           └── report.tsx
│
├── components/                    # Componentes reutilizáveis da aplicação
│   ├── AppSideBar.tsx
│   ├── SignInForm.tsx
│   ├── SignUpForm.tsx
│   ├── ForgetPasswordForm.tsx
│   ├── ThemeToggle.tsx
│   ├── history/                    # Componentes do histórico
│   │   ├── HistoryCard.tsx
│   │   ├── HistoryEditModal.tsx
│   │   ├── MonthYearGrid.tsx
│   │   ├── MonthYearPicker.tsx
│   │   └── MonthYearRangePicker.tsx
│   ├── home/                       # Componentes da página inicial
│   │   ├── SpaceCard.tsx
│   │   ├── SpaceReserveModal.tsx
│   │   └── SpaceSearchBar.tsx
│   ├── manage-reserve/             # Componentes de gestão de reservas
│   │   ├── ManageReserveSearchBar.tsx
│   │   └── ManageReserveTableRow.tsx
│   ├── manage-space/               # Componentes de gestão de espaços
│   │   ├── ManageSpaceCard.tsx
│   │   └── ManageSpaceSearchBar.tsx
│   ├── manage-user/                # Componentes de gestão de usuários
│   │   ├── ManageUserSearchBar.tsx
│   │   └── ManageUserTableRow.tsx
│   └── ui/                         # Componentes prontos do shadcn/ui
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       └── ...
│
└── lib/                            # Funções utilitárias e integrações
	├── service.ts                  # Serviços usados pela aplicação
	├── utils.ts                    # Utilitários gerais
	├── server/                     # Código executado no contexto do servidor
	│   ├── sign-in.server..ts
	│   └── theme.ts
	└── utils/                      # Utilitários por domínio
		├── api.ts
		├── month-year.ts
		└── restapi.ts
```

## Como organizar novas funcionalidades

### Rotas

- Coloque páginas sem autenticação em `src/routes/_public`.
- Coloque páginas que exigem login em `src/routes/_private`.
- Coloque páginas exclusivas da administração em `src/routes/_private/admin`.
- Após criar ou mover uma rota, execute `npm run generate-routes` quando a árvore de rotas precisar ser atualizada.

Os arquivos `route.tsx` funcionam como pontos de configuração e layout dos grupos de rotas. O prefixo `_` nos nomes de `_public` e `_private` é uma convenção do TanStack Router para agrupar rotas sem adicionar esse nome ao caminho da URL.

### Componentes

- Use `src/components` para componentes específicos da aplicação que possam ser reutilizados entre páginas.
- Organize componentes relacionados por domínio, como `history`, `home` e `manage-user`.
- Use `src/components/ui` para os componentes base de interface fornecidos pelo shadcn/ui. Prefira reutilizar e configurar esses componentes antes de criar um novo componente visual genérico.

### Funções utilitárias

- Use `src/lib` para funções, serviços e integrações que não pertencem diretamente a uma página ou componente visual.
- Coloque funções genéricas em `src/lib/utils.ts`.
- Coloque lógica relacionada à API em `src/lib/utils/api.ts` ou `src/lib/utils/restapi.ts`.
- Coloque funções específicas de datas em `src/lib/utils/month-year.ts`.
- Mantenha código que depende do servidor dentro de `src/lib/server`.

## Fluxo recomendado

1. Crie ou atualize a rota no grupo de acesso correto.
2. Extraia a interface para `src/components` quando ela for reutilizável.
3. Reutilize os componentes de `src/components/ui` para manter a consistência visual.
4. Mova lógica compartilhada ou integração com a API para `src/lib`.
5. Execute `npm run generate-routes` e `npm run check` antes de finalizar a alteração.
