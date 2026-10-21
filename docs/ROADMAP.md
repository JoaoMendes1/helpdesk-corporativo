# Roadmap

As etapas do teste técnico, o que já está pronto e o que vem depois.

## Status (21/10/2026)

| Etapa | Status |
|---|---|
| 1 · Repositório e documentação | ✅ Concluída |
| 2 · Banco e infraestrutura | ✅ Concluída |
| 3 · Base da API e login | ✅ Concluída |
| 4 · Equipamentos e dashboard | ✅ Concluída |
| 5 · Solicitações | ✅ Concluída |
| 6 · Frontend: login, equipamentos e dashboard | 🚧 Próxima |
| 7 · Frontend: solicitações e aprovação | 🕐 Planejada |
| 8 · Entrega | 🕐 Planejada |
| 9 · Depois da entrega (`optional`) | 🕐 Planejada |

Legenda: ✅ Concluída · 🚧 Em andamento ou próxima · 🕐 Planejada.

## O obrigatório

As etapas 2 a 8 cobrem o que a especificação exige, e a entrega acontece com elas prontas. A
etapa 9 só começa depois, porque a especificação avisa que diferencial inacabado pesa contra.

O login JWT é a exceção: a especificação o chama de diferencial, mas ele entra na etapa 3,
porque sustenta a regra crítica. O motivo está no [`DECISOES.md`](../DECISOES.md).

## Etapa 1: Repositório e documentação

- [x] Labels do catálogo e a label `optional`
- [x] Quadro ligado ao repositório, com as automações
- [x] Documentação adaptada ao teste: `README.md`, `AGENTS.md`, `DECISOES.md` e `docs/`
- [x] Primeiro commit na `main` e branch `staging`

## Etapa 2: Banco e infraestrutura (#1)

- [x] `docker-compose.yml` com MySQL, backend e frontend, funcionando sem `.env`, com valores
      de desenvolvimento fictícios
- [x] MySQL com `healthcheck`, e o backend esperando por ele (`depends_on` com
      `condition: service_healthy`)
- [x] Schema do Prisma a partir do modelo da especificação, com os índices que o modelo
      oficial não tem (em `equipamentos` e para a lista de pendentes)
- [x] Primeira migration, aplicada no boot com `prisma migrate deploy`
- [x] Seed com dados fictícios: usuários dos dois perfis e um inativo, equipamentos variados
      e solicitações com histórico. Só roda com o banco vazio
- [x] Endereço do backend no Caddyfile por variável, para a mesma imagem do frontend rodar
      local e no servidor
- [x] Só a porta do frontend publicada na máquina, configurável pelo `.env`
- [x] `docker compose up` do zero funcionando
- [x] `README.md`: endereço de acesso e usuários de teste

## Etapa 3: Base da API e login (#2)

- [x] Formato de erro padronizado em toda a API, com os status HTTP corretos
- [x] Validação de entrada com `zod`
- [x] Login com JWT e senha com hash (`optional`, ver "O obrigatório"), recusando usuário
      inativo
- [x] Token em cookie `httpOnly`, com `GET /api/me` e `POST /api/logout`
- [x] Login exigido em toda a `/api`, menos nas rotas de login e de saúde (`/api/health`)
- [x] Middleware que exige um perfil (aprovador ou solicitante)

## Etapa 4: Equipamentos e dashboard (#3)

- [x] `POST /api/novo-equipamento`, com o tipo gravado em minúsculas
- [x] `GET /api/equipamentos`, com filtros por `status` e `tipo`
- [x] `GET /api/equipamento/:id`, com quem cadastrou e o empréstimo atual
- [x] `GET /api/equipamentos/totais`: totais de equipamentos por status, para o dashboard
- [x] As quatro rotas só para o aprovador: o solicitante não vê o estoque
- [x] Validação também da query e do `:id`, com o resultado em `req.validado`

## Etapa 5: Solicitações (#4)

- [x] Solicitante: criar solicitação pela descrição do que precisa (tipo e descrição
      obrigatórios; marca e modelo opcionais); listar as próprias; cancelar enquanto
      `PENDENTE`
- [x] Criar solicitação só com o perfil solicitante
- [x] Solicitação de outro usuário responde `404`
- [x] Aprovador: listar as pendentes, aprovar escolhendo o equipamento e recusar, com
      justificativa obrigatória na recusa
- [x] Aprovação e recusa numa transação, com `409` se o estado mudou
- [x] Histórico de cada solicitação, gravado desde a criação e visível só para o dono e para
      os aprovadores
- [x] Seed coerente com a regra: as solicitações #1 e #4 como pedidos descritos, e a data de
      cadastro dos usuários e dos equipamentos anterior à das solicitações

## Etapa 6: Frontend: login, equipamentos e dashboard

- [x] Decidir onde o token fica guardado: cookie `httpOnly`, decidido antes, porque a
      etapa 3 já dependia da resposta
- [ ] Tela de login, levando o solicitante direto às suas solicitações
- [ ] Lista de equipamentos com filtros e cadastro, só para o aprovador
- [ ] Dashboard do aprovador com os totais por status
- [ ] Estados de carregamento e erro em todas as telas, e de validação nas que têm formulário

## Etapa 7: Frontend: solicitações e aprovação

- [ ] Solicitante: nova solicitação, pela descrição, e minhas solicitações, com status e
      histórico
- [ ] Aprovador: solicitações pendentes, com aprovar e recusar
- [ ] Estados de carregamento, erro e validação

## Etapa 8: Entrega

- [ ] `README.md` com o passo a passo conferido e o uso de IA de todas as etapas
- [ ] Tabela de requisitos do `README.md` toda em ✅
- [ ] `DECISOES.md` sem decisão pendente que afete a entrega
- [ ] Teste em clone limpo: `git clone` numa pasta nova e `docker compose up` do zero
- [ ] Revisão final dos documentos

## Etapa 9: Depois da entrega (`optional`)

- [ ] CI na `staging`
- [ ] Deploy na VPS, com as duas imagens (backend e frontend)
- [ ] Estudo de caso no portfólio

## Dívida técnica conhecida

- **Login sem limite de tentativas.** Nada impede testar senhas em sequência (força bruta).
  A especificação não pede essa proteção; a correção, um limite de tentativas por IP ou por
  e-mail, fica para depois da entrega.

## Ideias, sem compromisso

- **Devolução de equipamento** (`EMPRESTADO` → `DISPONIVEL`). A especificação não pede.
- **Mais campos no cadastro de equipamento**, como número de série, IMEI e endereço MAC. O
  número de série precisaria ser único no banco. Com IMEI ou MAC, a validação é reavaliada,
  como diz o [`DECISOES.md`](../DECISOES.md).
- **Testes automáticos das regras críticas** (`403`, `409`, autoaprovação). A especificação
  não pede; reavaliar na etapa 8, se sobrar tempo. Até lá, as regras são provadas com `curl`,
  fora do Docker e com o sistema rodando.

## Manutenção

### 21/10/2026: solicitações, aprovação e recusa (#4)

As seis rotas de solicitação, com o perfil exigido em cada uma, e a aprovação, a recusa e o
cancelamento em transação, com atualização condicional. Conferidas fora do Docker, inclusive
nos caminhos de erro, e com `docker compose up` do zero e os dados do seed, inclusive o `404`
da solicitação de outro usuário, os `409` e o `422`.

### 20/10/2026: equipamentos e totais por status (#3)

As três rotas obrigatórias e os totais, só para o aprovador, com validação do corpo, da query
e do `:id`. Conferidas fora do Docker, inclusive nos caminhos de erro, e com `docker compose
up` do zero e os dados do seed.

### 18/10/2026: base da API e login (#2)

Formato de erro, validação com `zod` e login com JWT em cookie `httpOnly`, conferidos fora do
Docker, inclusive nos caminhos de erro, e com `docker compose up` do zero.

### 17/10/2026: projeto criado

Repositório criado com a documentação adaptada ao teste e o fluxo `staging` → `main`.
