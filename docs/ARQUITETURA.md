# Arquitetura

Como o sistema funciona por dentro. O motivo de cada escolha está no
[`DECISOES.md`](../DECISOES.md).

**Estado:** 🚧 em construção. Já existem os três containers, o banco com as migrations e o
seed, e a base da API: formato de erro, validação de entrada e autenticação. As outras seções
passam a descrever o que existe à medida que as etapas do [`ROADMAP.md`](ROADMAP.md) ficam
prontas.

## Visão geral

Três containers, ligados pela rede interna do compose:

```
navegador ──> frontend (Caddy) ──/api──> backend (Express) ──> mysql
              serve o build do React
```

| Container | O que faz |
|---|---|
| `frontend` | O Caddy serve o build do React e repassa para o backend tudo o que começa com `/api`. É o único ponto de entrada |
| `backend` | API em Express 5 com Prisma 6. No boot: aplica as migrations, roda o seed se o banco estiver vazio e sobe o servidor |
| `mysql` | Banco de dados. Só o backend fala com ele |

**Ordem de subida.** Cada container só sobe quando o anterior passa no seu teste de saúde
(`healthcheck`), por causa do `depends_on` com `condition: service_healthy`:

1. `mysql` fica saudável quando responde pela rede.
2. `backend` aplica as migrations, roda o seed e sobe a API; fica saudável quando
   `/api/health` responde.
3. `frontend` sobe e passa a atender na porta publicada.

## Backend

As requisições passam pelas camadas sempre na mesma ordem:

```
rota ──> middlewares ──> controller ──> service ──> Prisma ──> MySQL
```

| Pasta em `backend/src/` | O que fica nela |
|---|---|
| `routes/` | Liga cada URL aos middlewares e ao controller. Não tem regra nenhuma |
| `middlewares/` | `autenticar` (exige login), `exigirPerfil` (exige o perfil da rota), `validar` (confere o corpo, a query ou os parâmetros com um schema e guarda o resultado em `req.validado`) e `tratarErros` (transforma qualquer erro na resposta padronizada) |
| `schemas/` | Os schemas do `zod` que descrevem a entrada de cada rota |
| `controllers/` | Lê os dados validados (`req.validado`) e o usuário do token (`req.usuario`), e monta a resposta HTTP. Não lê `req.body`, `req.query` nem `req.params` direto. No Express 5, `req.query` nem aceita atribuição: o valor novo é descartado sem erro |
| `services/` | A regra de negócio. É a única camada que fala com o Prisma |
| `errors/` | O `ErroApp`: o erro previsto pela aplicação, com o status HTTP e, no `400`, os erros por campo |
| `config/` | Leitura das variáveis de ambiente. Variável obrigatória faltando derruba o boot |
| `lib/` | Instâncias e funções compartilhadas: o Prisma Client e o `token.js`, que gera e confere o JWT |

O `app.js` monta o Express (middlewares globais e rotas) e o `server.js` só o coloca para
ouvir a porta. Separados, o app pode ser testado sem subir o servidor.

### Ordem no `app.js`

A ordem das linhas é o mecanismo de proteção das rotas:

```
express.json → cookie-parser → /api/health → rotas de autenticação → autenticar → rotas protegidas → 404 → tratarErros
```

- Tudo o que vem antes do `autenticar` é público. O `/me` e o logout ficam no router de
  autenticação, mas recebem o `autenticar` na própria rota.
- Toda rota nova entra depois do `autenticar` e nasce protegida.
- O `404` e o `tratarErros` ficam sempre por último.

### Erros

- O service lança um `ErroApp` com o status e a mensagem. Não há `try/catch` nos
  controllers: no Express 5, o erro de uma função `async` chega sozinho ao `tratarErros`.
- O `tratarErros` responde no formato padrão, descrito no [`API.md`](API.md).
- JSON malformado no corpo vira `400`. Banco inacessível ou conexão perdida viram `503`.
  Qualquer outro erro vira `500`, com o detalhe só no log.

## Autenticação

- O usuário entra com e-mail e senha. A senha fica no banco só como hash (`bcryptjs`).
- Usuário inativo (`ativo = false`) não entra.
- No login, a API grava um JWT num cookie `httpOnly`. O token leva o id, o nome e o perfil, e
  vale 8 horas, como o cookie. O navegador o envia sozinho em toda requisição, e o JavaScript
  do frontend não consegue lê-lo.
- Quando o e-mail não existe, a senha é comparada mesmo assim, com um hash falso. A resposta
  leva o mesmo tempo de uma senha errada, e o tempo não revela quais e-mails estão
  cadastrados.
- A conferência do token aceita só o algoritmo `HS256`: o próprio token não define como é
  verificado.
- Ao abrir, o frontend consulta `GET /api/me` para saber quem está logado. O logout também
  passa pela API, que apaga o cookie.
- O middleware valida o token e coloca o usuário na requisição. **O id e o perfil usados nas
  regras vêm sempre daí, nunca do corpo, da URL ou da query string.** O middleware não
  consulta o banco: um usuário desativado mantém o acesso até o token vencer.
- Todas as rotas da `/api` exigem login, menos a de login e a de saúde (`/api/health`).
- As rotas de equipamentos (cadastro, lista, detalhe e totais) e as de decisão sobre
  solicitação exigem também o perfil `APROVADOR`; a de criar solicitação, o perfil
  `SOLICITANTE`.
- O perfil é exigido em cada rota, nunca com `router.use`. Num router montado em `/api`, o
  `router.use` vale para toda requisição que passa por ele: o solicitante receberia `403` nas
  rotas de outros routers e até em rotas inexistentes.

## Banco

O modelo de dados é o da especificação, com quatro tabelas:

| Tabela | Para que serve |
|---|---|
| `usuarios` | Quem usa o sistema, com o perfil (`SOLICITANTE` ou `APROVADOR`) |
| `equipamentos` | Os equipamentos cadastrados pelo aprovador, com o status (`DISPONIVEL`, `EMPRESTADO`, `MANUTENCAO` ou `INATIVO`) |
| `solicitacoes` | Os pedidos do solicitante, com o status (`PENDENTE`, `APROVADA`, `RECUSADA` ou `CANCELADA`) e a decisão do aprovador |
| `historico_solicitacoes` | Uma linha por mudança de status, inclusive a criação: status anterior (vazio na criação), status novo, observação e quem mudou |

- **Isolamento:** as consultas do solicitante filtram pelo id que vem do token. É isso que
  garante que ele veja só as próprias solicitações. A de outro usuário responde `404`.
- **Índices:** além dos do modelo oficial, `equipamentos` ganha índices para os filtros da
  listagem (`status` e `tipo`), e `solicitacoes` ganha `[status, dtSolicitacao]`, para a
  lista de pendentes. Todos entram na primeira migration.
- **Schema versionado** nas migrations do Prisma, em `backend/prisma/migrations/`.

## Rotas

O contrato de cada rota (corpo, resposta e erros) está no [`API.md`](API.md).

## Integrações externas

Nenhuma. O sistema não depende de serviço de terceiro.

## Variáveis de ambiente

Os nomes estão no [`.env.example`](../.env.example). O `docker-compose.yml` traz valores de
desenvolvimento fictícios, então o `.env` só é necessário para trocar algum deles.

- `JWT_SECRET` é obrigatória e precisa ter pelo menos 32 caracteres; sem ela, o backend não
  sobe.
- `COOKIE_SECURE` faz o cookie ser enviado só por HTTPS: `false` no local, que roda em HTTP,
  e `true` no servidor.

## Onde o projeto roda

O projeto roda de duas formas, com as mesmas duas imagens: a do `backend/Dockerfile` e a do
`frontend/Dockerfile`. Mudança nelas vale para os dois lados.

| | Local | Servidor |
|---|---|---|
| **Para quê** | Desenvolver e avaliar | Versão publicada (depois da entrega) |
| **Compose** | O `docker-compose.yml` deste repositório | O do repositório privado `infra` |
| **Como sobe** | `docker compose up` | Pelo deploy, descrito abaixo |
| **Containers** | `frontend`, `backend` e `mysql` | `frontend` e `backend` deste projeto, e um MySQL próprio no compose do `infra` |
| **Portas** | Só o `frontend` publica porta na máquina | Nenhuma: o Caddy do servidor alcança o `frontend` pela rede interna |
| **Variáveis** | Valores de desenvolvimento no compose, ou um `.env` copiado do `.env.example` | O `.env` do servidor, com `COOKIE_SECURE=true` |

O nome do serviço do backend muda de um lado para o outro. Por isso o Caddyfile do frontend
lê o endereço do backend de uma variável, e a mesma imagem funciona nos dois.

### Deploy

Desligado: o projeto ainda não roda no servidor. Quando for ligado, o push na `main` dispara
o `.github/workflows/deploy.yml`, que atualiza o código no servidor, reconstrói as duas
imagens e recria os dois containers.