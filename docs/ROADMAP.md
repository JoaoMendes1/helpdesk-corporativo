# Roadmap

As etapas do teste técnico, o que já está pronto e o que vem depois.

## Status (17/10/2026)

| Etapa | Status |
|---|---|
| 1 · Repositório e documentação | ✅ Concluída |
| 2 · Banco e infraestrutura | ✅ Concluída |
| 3 · Base da API e login | 🚧 Próxima |
| 4 · Equipamentos e dashboard | 🕐 Planejada |
| 5 · Solicitações | 🕐 Planejada |
| 6 · Frontend: login, equipamentos e dashboard | 🕐 Planejada |
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

## Etapa 3: Base da API e login

- [ ] Formato de erro padronizado em toda a API, com os status HTTP corretos
- [ ] Validação de entrada com `zod`
- [ ] Login com JWT e senha com hash (`optional`, ver "O obrigatório"), recusando usuário
      inativo
- [ ] Login exigido em toda a `/api`, menos na rota de login
- [ ] Middleware que exige um perfil (aprovador ou solicitante)

## Etapa 4: Equipamentos e dashboard

- [ ] `POST /api/novo-equipamento`, só para o aprovador
- [ ] `GET /api/equipamentos`, com filtros por `status` e `tipo`
- [ ] `GET /api/equipamento/:id`, com quem cadastrou e o empréstimo atual
- [ ] Rota do dashboard: totais de equipamentos por status

## Etapa 5: Solicitações

- [ ] Solicitante: criar solicitação, com um equipamento escolhido ou a descrição do que
      precisa; listar as próprias; cancelar enquanto `PENDENTE`
- [ ] Criar solicitação só com o perfil solicitante
- [ ] Solicitação de outro usuário responde `404`
- [ ] Aprovador: listar as pendentes, aprovar e recusar, com justificativa obrigatória na
      recusa
- [ ] Aprovação e recusa numa transação, com `409` se o estado mudou
- [ ] Histórico de cada solicitação, gravado desde a criação e visível só para o dono e para
      os aprovadores

## Etapa 6: Frontend: login, equipamentos e dashboard

- [ ] Decidir onde o token fica guardado (pendente no `DECISOES.md`)
- [ ] Tela de login
- [ ] Lista de equipamentos com filtros, e cadastro só para o aprovador
- [ ] Dashboard com os totais por status
- [ ] Estados de carregamento e erro em todas as telas, e de validação nas que têm formulário

## Etapa 7: Frontend: solicitações e aprovação

- [ ] Solicitante: nova solicitação e minhas solicitações, com status e histórico
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

Nenhuma ainda.

## Ideias, sem compromisso

- **Devolução de equipamento** (`EMPRESTADO` → `DISPONIVEL`). A especificação não pede.
- **Mais campos no cadastro de equipamento**, como número de série, IMEI e endereço MAC. O
  número de série precisaria ser único no banco. Com IMEI ou MAC, a validação é reavaliada,
  como diz o [`DECISOES.md`](../DECISOES.md).
- **Testes automáticos das regras críticas** (`403`, `409`, autoaprovação). A especificação
  não pede; decidir na etapa 5, conforme o tempo.

## Manutenção

### 17/10/2026: projeto criado

Repositório criado com a documentação adaptada ao teste e o fluxo `staging` → `main`.