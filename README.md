# HelpDesk Corporativo

Sistema de solicitação e aprovação de equipamentos, feito como teste técnico full-stack. O
solicitante pede equipamentos e acompanha as próprias solicitações; o aprovador cadastra os
equipamentos e decide cada pedido, com justificativa.

**Estado:** ✅ pronto para avaliação: todos os requisitos da especificação estão implementados. O
histórico por etapa está no [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Requisitos da especificação

| Requisito | Status | Onde |
|---|---|---|
| Backend em Node.js com Prisma, controllers separados das regras de negócio | ✅ Pronto | [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) |
| Frontend em React com Vite, com estados de carregamento, erro e validação | ✅ Pronto | [`docs/PAGES.md`](docs/PAGES.md) |
| MySQL com índices de acordo com os filtros usados | ✅ Pronto | [`DECISOES.md`](DECISOES.md) |
| Projeto inteiro sobe com `docker compose up` | ✅ Pronto | [Como rodar](#como-rodar) |
| Perfis de solicitante e de aprovador, com a regra crítica | ✅ Pronto | [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) |
| `POST /api/novo-equipamento`, `GET /api/equipamentos` e `GET /api/equipamento/:id` | ✅ Pronto | [`docs/API.md`](docs/API.md) |
| Erros padronizados (`400`, `404`, `409`, `422`) | ✅ Pronto | [`docs/API.md`](docs/API.md) |
| Variáveis de ambiente e `.env.example` sem senhas | ✅ Pronto | [`.env.example`](.env.example) |
| Migrations e seed no primeiro boot, com histórico | ✅ Pronto | [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) |
| Dashboard com os totais de equipamentos por status | ✅ Pronto | [`docs/PAGES.md`](docs/PAGES.md) |
| `README.md` com o passo a passo e o uso de IA | ✅ Pronto | Este arquivo |
| `DECISOES.md` com as decisões e os padrões de projeto | ✅ Pronto | [`DECISOES.md`](DECISOES.md) |
| Diferencial: login com JWT | ✅ Pronto | [`DECISOES.md`](DECISOES.md) |

## Como rodar

**Estado atual:** o `docker compose up` sobe o banco já com os dados de teste, a API completa
(login, rota de saúde, equipamentos e solicitações) e o frontend com todas as telas dos dois
perfis.

**Pré-requisitos:** Git e Docker com o Compose (no Windows e no macOS, o Docker Desktop).

**1. Clone o repositório e entre na pasta:**

```bash
git clone https://github.com/JoaoMendes1/helpdesk-corporativo.git
cd helpdesk-corporativo
```

**2. Suba o projeto.** Não é preciso criar `.env`:

```bash
docker compose up
```

Na primeira vez, o Docker baixa as imagens e instala as dependências, o que pode levar alguns
minutos. Depois, o backend aplica as migrations e popula o banco com dados fictícios. Está
pronto quando o log mostrar `API ouvindo na porta 3000`.

**3. Abra `http://localhost:8080` no navegador.** Usuários de teste, todos com a senha
`Senha@123`:

| E-mail | Perfil | Para testar |
|---|---|---|
| `aprovador@example.com` | Aprovador | Cadastro de equipamento e decisão sobre solicitações |
| `solicitante@example.com` | Solicitante | Criação e acompanhamento das próprias solicitações |
| `cristina@example.com` | Solicitante | Que um solicitante não vê as solicitações do outro |
| `inativo@example.com` | Solicitante, inativo | O bloqueio do login de usuário inativo |

**4. Para testar a API direto,** faça login guardando o cookie num arquivo (`-c`) e envie o
mesmo arquivo nas outras rotas (`-b`). Toda rota, menos o login e a de saúde, exige o cookie:

```bash
curl -c /tmp/helpdesk-cookies.txt -X POST localhost:8080/api/login -H 'Content-Type: application/json' -d '{"email":"aprovador@example.com","senha":"Senha@123"}'
curl -b /tmp/helpdesk-cookies.txt localhost:8080/api/me
```

No Windows, use o Git Bash, ou um cliente como Postman ou Insomnia, que guardam o cookie
sozinhos. As rotas e os formatos estão no [`docs/API.md`](docs/API.md).

**5. Para parar:**

```bash
docker compose down      # para os containers e mantém o banco
docker compose down -v   # para e apaga o banco; o próximo up roda o seed de novo
```

**Porta ocupada:** se a porta 8080 já estiver em uso na sua máquina, copie o `.env.example`
para `.env` e preencha `FRONTEND_PORT` com outra porta.

## Uso de IA

**Ferramenta:** Claude (Anthropic), em conversa no chat. Nenhuma ferramenta escreve direto
no editor: o código é implementado por mim, e nada é commitado sem ser testado e sem que eu
entenda o funcionamento. As regras que a IA segue estão no [`AGENTS.md`](AGENTS.md). Nenhuma ferramenta de IA de linha de comando foi usada.

| Onde | Como a IA foi usada | O que foi meu |
|---|---|---|
| Planejamento e documentação | Revisou a especificação, apontou lacunas e alternativas, e redigiu os documentos a partir das decisões | As decisões, os alinhamentos com a equipe e a revisão dos textos |
| Banco e infraestrutura | Propôs o schema com os índices, o seed, os Dockerfiles e o compose, e explicou cada escolha | A implementação, a correção dos erros que apareceram no boot e a conferência com o sistema rodando |
| Base da API e login | Comparou as formas de guardar o token, propôs o formato de erro, a validação e o login, e montou os testes de cada caminho de erro | A escolha do cookie, a implementação, a revisão dos comentários e a conferência fora do Docker e com o sistema rodando |
| Protótipo das telas | Analisou o protótipo contra a especificação e as decisões, e aplicou as mudanças decididas na revisão | A primeira versão, as regras de cada tela (como a de o solicitante não ver o estoque) e a conferência nos dois perfis |
| Equipamentos e dashboard | Propôs as rotas, a validação da query e do id e os totais por status, e testou cada caminho de erro num ambiente separado antes de mandar o código | A regra de o solicitante não ver o estoque, a partir do fluxo real de gestão de ativos; o escopo só no obrigatório; a implementação e a conferência |
| Solicitações | Propôs as rotas, a transação com atualização condicional e os códigos `409` e `422`, e montou os testes de cada caminho de erro | As regras de quem cria o pedido, do cancelamento e da justificativa na recusa; a implementação e a conferência com os dados do seed |
| Frontend: login, equipamentos e painel | Propôs os componentes e o tratamento de carregamento, erro e validação, e testou cada passo com testes automáticos descartáveis, fora do repositório | O Tipo como lista, o modo escuro para depois da entrega, a implementação e o teste manual, que achou o defeito do Enter |
| Frontend: solicitações e aprovação | Propôs as telas e os diálogos, testou teclado, conflito (`409`) e tela de celular num navegador, e conferiu cada commit antes da promoção | O escopo da etapa, a implementação e os testes manuais, inclusive com dois aprovadores ao mesmo tempo |

## Stack

| Camada | O que é |
|---|---|
| **Backend** | Node.js com Express 5, em JavaScript, Prisma 6 como ORM e `zod` na validação de entrada |
| **Banco** | MySQL, com as migrations e o seed do Prisma |
| **Frontend** | React 19 com Vite, TypeScript, Tailwind e React Router 7 |
| **Autenticação** | JWT em cookie `httpOnly`, com a senha guardada como hash (`bcryptjs`) |
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
| [`docs/prototipo/`](docs/prototipo/) | O protótipo navegável das telas, com dados fictícios |
| [`docs/PITFALLS.md`](docs/PITFALLS.md) | Falhas silenciosas que já aconteceram, com sintoma e conferência |

---

Feito por João Victor Mendes · [joaomendes.dev.br](https://joaomendes.dev.br)