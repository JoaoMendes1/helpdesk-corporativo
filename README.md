# HelpDesk Corporativo

Sistema de solicitação e aprovação de equipamentos, feito como teste técnico full-stack. O
solicitante pede equipamentos e acompanha as próprias solicitações; o aprovador cadastra os
equipamentos e decide cada pedido, com justificativa.

**Estado:** 🚧 em desenvolvimento. O andamento por etapa está no
[`docs/ROADMAP.md`](docs/ROADMAP.md).

## Requisitos da especificação

| Requisito | Status | Onde |
|---|---|---|
| Backend em Node.js com Prisma, controllers separados das regras de negócio | 🕐 Planejado | [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) |
| Frontend em React com Vite, com estados de carregamento, erro e validação | 🕐 Planejado | [`docs/PAGES.md`](docs/PAGES.md) |
| MySQL com índices de acordo com os filtros usados | 🕐 Planejado | [`DECISOES.md`](DECISOES.md) |
| Projeto inteiro sobe com `docker compose up` | 🕐 Planejado | [Como rodar](#como-rodar) |
| Perfis de solicitante e de aprovador, com a regra crítica | 🕐 Planejado | [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) |
| `POST /api/novo-equipamento`, `GET /api/equipamentos` e `GET /api/equipamento/:id` | 🕐 Planejado | [`docs/API.md`](docs/API.md) |
| Erros padronizados (`400`, `404`, `409`, `422`) | 🕐 Planejado | [`docs/API.md`](docs/API.md) |
| Variáveis de ambiente e `.env.example` sem senhas | 🚧 Em andamento | [`.env.example`](.env.example) |
| Migrations e seed no primeiro boot, com histórico | 🕐 Planejado | [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) |
| Dashboard com os totais de equipamentos por status | 🕐 Planejado | [`docs/PAGES.md`](docs/PAGES.md) |
| `README.md` com o passo a passo e o uso de IA | 🚧 Em andamento | Este arquivo |
| `DECISOES.md` com as decisões e os padrões de projeto | 🚧 Em andamento | [`DECISOES.md`](DECISOES.md) |
| Diferencial: login com JWT | 🕐 Planejado | [`DECISOES.md`](DECISOES.md) |

## Como rodar

O endereço de acesso, os usuários de teste e o nome da variável de porta entram aqui junto
com o `docker-compose.yml`, na etapa 2.

**Pré-requisitos:** Git e Docker com o Compose (no Windows e no macOS, o Docker Desktop).

1. Clone o repositório e entre na pasta:

```bash
   git clone https://github.com/JoaoMendes1/helpdesk-corporativo.git
   cd helpdesk-corporativo
```

2. Suba o projeto. Não é preciso criar `.env`:

```bash
   docker compose up
```

   No primeiro boot, o backend aplica as migrations e popula o banco com dados fictícios.

3. Abra o endereço no navegador e entre com um dos usuários de teste: há um de cada perfil e
   um inativo, para testar o bloqueio do login.

4. Para testar a API direto, faça login e use o token nas outras rotas. As rotas e os
   formatos estão no [`docs/API.md`](docs/API.md).

5. Para parar:

```bash
   docker compose down      # para os containers e mantém o banco
   docker compose down -v   # para e apaga o banco; o próximo up roda o seed de novo
```

**Porta ocupada:** se a porta do frontend já estiver em uso na sua máquina, copie o
`.env.example` para `.env` e troque a porta lá.

## Uso de IA

**Ferramenta:** Claude (Anthropic), em conversa no chat. Nenhuma ferramenta escreve direto
no editor: o código é implementado por mim, e nada é commitado sem ser testado e sem que eu
entenda o funcionamento. As regras que a IA segue estão no [`AGENTS.md`](AGENTS.md). *Não foi utilizado CLI*

| Onde | Como a IA foi usada | O que foi meu |
|---|---|---|
| Planejamento e documentação | Revisou a especificação, apontou lacunas e alternativas, e redigiu os documentos a partir das decisões | As decisões, os alinhamentos com a equipe e a revisão dos textos |

Cada etapa acrescenta a sua linha nesta tabela.

## Stack

| Camada | O que é |
|---|---|
| **Backend** | Node.js com Express 5, em JavaScript, e Prisma 6 como ORM |
| **Banco** | MySQL, com as migrations e o seed do Prisma |
| **Frontend** | React 19 com Vite, TypeScript, Tailwind e React Router 7 |
| **Autenticação** | JWT, com a senha guardada como hash (`bcryptjs`) |
| **Servidor web** | Caddy: serve o frontend e repassa `/api` para o backend |
| **Local** | Docker Compose: banco, API e frontend sobem com `docker compose up` |
| **Hospedagem** | VPS própria, em container Docker atrás do Caddy (planejado) |

## Documentação

| Arquivo | Para quê |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Regras para quem (pessoa ou IA) mexe neste repositório. Ler antes de tudo |
| [`DECISOES.md`](DECISOES.md) | As decisões de arquitetura, o motivo de cada uma e o custo aceito |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | As etapas do projeto, o que é obrigatório e o que é diferencial |
| [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) | Como o sistema funciona por dentro e onde ele roda |
| [`docs/API.md`](docs/API.md) | As rotas da API: entrada, resposta e erros |
| [`docs/PAGES.md`](docs/PAGES.md) | As telas e o estado de cada uma |
| [`docs/PITFALLS.md`](docs/PITFALLS.md) | Armadilhas conhecidas, com sintoma e conferência |

---

Feito por João Victor Mendes · [joaomendes.dev.br](https://joaomendes.dev.br)