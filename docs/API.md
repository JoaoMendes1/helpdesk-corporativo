# API

Rotas da API, com o formato de entrada, de resposta e de erro. Quem usa é o frontend, pelo
mesmo endereço, em `/api`, e quem avalia o projeto, com um cliente HTTP.

**Estado:** ✅ todas as rotas do obrigatório existem: as de autenticação e o formato de erro
desde a etapa 3, as de equipamentos desde a etapa 4 e as de solicitações desde a etapa 5 do
[`ROADMAP.md`](ROADMAP.md).

## Autenticação

- Todas as rotas exigem login, menos `POST /api/login` e `GET /api/health`.
- O login grava o token num cookie `httpOnly` chamado `token`, válido por 8 horas e enviado
  só para `/api`. O navegador o envia sozinho; num cliente HTTP, é preciso guardar o cookie
  (no `curl`, com `-c` e `-b`, como no [`README.md`](../README.md)). O motivo do cookie está
  no [`DECISOES.md`](../DECISOES.md).
- O id e o perfil do usuário vêm do token, nunca do corpo da requisição.
- Usuário inativo não entra: o login responde `401`, com a mesma mensagem de senha errada.
- Sem login, até uma rota que não existe responde `401`, e não `404`: o login é conferido
  antes de a rota ser procurada. Assim, quem não está logado não descobre quais rotas existem.

## Rotas de autenticação

### `POST /api/login`

| Campo do corpo | Tipo | Obrigatório? | O que é |
|---|---|---|---|
| `email` | texto | sim | Espaços nas pontas são removidos, e maiúsculas não importam |
| `senha` | texto | sim | |

Resposta: `200`. Grava o cookie e devolve o usuário:

```json
{
  "usuario": { "id": 1, "nome": "Ana Souza", "perfil": "APROVADOR" }
}
```

Erros: `400` se o corpo estiver fora do formato; `401` se o e-mail ou a senha estiverem
errados, ou se o usuário estiver inativo; `503` se o banco estiver indisponível.

### `GET /api/me`

O usuário do token, no mesmo formato da resposta do login. O frontend consulta esta rota ao
abrir, para saber quem está logado. Resposta: `200`; `401` sem login, ou com token inválido ou
expirado.

### `POST /api/logout`

Apaga o cookie. Resposta: `204`, sem corpo; `401` sem login. O token em si não é invalidado:
uma cópia dele vale até expirar, como registrado no [`DECISOES.md`](../DECISOES.md).

## Rota de saúde

### `GET /api/health`

Responde `200` com `{ "status": "ok" }` quando a API está no ar. É a rota que o `healthcheck`
do compose usa, e não exige login.

## Rotas de equipamentos

**Só o perfil `APROVADOR`.** O solicitante não vê o estoque: pede pela descrição do que
precisa, e o aprovador escolhe o equipamento ao aprovar. O motivo está no
[`DECISOES.md`](../DECISOES.md). Para o solicitante, as quatro rotas respondem `403`.

As três primeiras são as rotas obrigatórias da especificação, com os nomes exatos dela. A
quarta atende ao dashboard.

### `POST /api/novo-equipamento`

Cadastra um equipamento.

| Campo do corpo | Tipo | Obrigatório? | O que é |
|---|---|---|---|
| `marca` | texto | sim | Até 191 caracteres. Espaços nas pontas são removidos |
| `modelo` | texto | sim | Até 191 caracteres. Espaços nas pontas são removidos |
| `tipo` | texto | sim | Ex.: notebook, monitor. Até 191 caracteres, gravado em minúsculas: "Notebook" e "notebook" são o mesmo tipo nos filtros |
| `status` | texto | não | Um de `DISPONIVEL`, `EMPRESTADO`, `MANUTENCAO` ou `INATIVO`. Se não vier, `DISPONIVEL` |

A data de cadastro é preenchida pelo banco, e o criador vem do token: um `criadoPorId` no
corpo é ignorado. Resposta: `201`, com o equipamento criado; `400` com os erros por campo.

```json
{
  "id": 11,
  "marca": "Dell",
  "modelo": "XPS 13",
  "tipo": "notebook",
  "status": "DISPONIVEL",
  "dtCadastro": "2026-10-20T13:00:00.000Z",
  "criadoPorId": 1
}
```

### `GET /api/equipamentos`

Lista os equipamentos, em ordem de id e sem paginação. Filtros pela query string, todos
opcionais:

| Parâmetro | O que filtra |
|---|---|
| `status` | Um dos quatro status do equipamento. Outro valor responde `400` |
| `tipo` | O tipo do equipamento, sem diferenciar maiúsculas. Vazio é ignorado |

Exemplo: `/api/equipamentos?status=DISPONIVEL&tipo=monitor`.

Resposta: `200`, com a lista no mesmo formato do equipamento acima. Sem resultado, a lista
vem vazia.

### `GET /api/equipamento/:id`

Os dados detalhados de um equipamento: os campos da lista, com quem o cadastrou no lugar do
`criadoPorId`, e o empréstimo atual.

Resposta: `200`; `400` se o id não for um número inteiro de 1 a 2147483647, o maior valor da
coluna; `404` se não existir.

```json
{
  "id": 1,
  "marca": "Lenovo",
  "modelo": "ThinkPad E14",
  "tipo": "notebook",
  "status": "EMPRESTADO",
  "dtCadastro": "2026-10-01T13:00:00.000Z",
  "criadoPor": { "id": 1, "nome": "Ana Souza" },
  "emprestimoAtual": {
    "solicitacaoId": 1,
    "solicitante": { "id": 2, "nome": "Bruno Lima" },
    "dtDecisao": "2026-10-10T09:30:00.000Z"
  }
}
```

`emprestimoAtual` é a solicitação aprovada mais recente do equipamento. Vem `null` quando o
equipamento não está emprestado, ou quando foi cadastrado já como `EMPRESTADO`, sem
solicitação ligada.

### `GET /api/equipamentos/totais`

Os totais de equipamentos por status, para o dashboard. Traz sempre os quatro status,
inclusive os que têm zero. Resposta: `200`.

```json
{
  "total": 10,
  "porStatus": { "DISPONIVEL": 6, "EMPRESTADO": 1, "MANUTENCAO": 2, "INATIVO": 1 }
}
```

## Rotas de solicitações

Cada rota é de um perfil só: a do solicitante responde `403` para o aprovador, e a do
aprovador responde `403` para o solicitante. O dono da solicitação e o aprovador vêm do token:
um `solicitanteId`, `aprovadorId` ou `status` no corpo é ignorado.

Os caminhos seguem o padrão REST: substantivo no caminho e ação no método. A aprovação, a
recusa e o cancelamento são `POST` em `/aprovacao`, `/recusa` e `/cancelamento` porque cada um
cria um registro novo, a linha do histórico.

### Formato da solicitação

As seis rotas devolvem a solicitação neste formato, sozinha ou em lista:

```json
{
  "id": 4,
  "solicitanteId": 3,
  "equipamentoId": 2,
  "descricao": "Notebook para um treinamento externo.",
  "marcaSolicitada": null,
  "modeloSolicitado": null,
  "tipoSolicitado": "notebook",
  "status": "APROVADA",
  "observacao": "Retirar com o suporte.",
  "dtSolicitacao": "2026-10-19T13:00:00.000Z",
  "dtDecisao": "2026-10-21T13:00:00.000Z",
  "aprovadorId": 1,
  "solicitante": { "id": 3, "nome": "Cristina Rocha" },
  "aprovador": { "id": 1, "nome": "Ana Souza" },
  "equipamento": { "id": 2, "marca": "Dell", "modelo": "Latitude 5440", "tipo": "notebook" },
  "historicos": [
    {
      "id": 7,
      "statusAnterior": null,
      "statusNovo": "PENDENTE",
      "observacao": null,
      "dtRegistro": "2026-10-19T13:00:00.000Z",
      "usuario": { "id": 3, "nome": "Cristina Rocha" }
    },
    {
      "id": 9,
      "statusAnterior": "PENDENTE",
      "statusNovo": "APROVADA",
      "observacao": "Retirar com o suporte.",
      "dtRegistro": "2026-10-21T13:00:00.000Z",
      "usuario": { "id": 1, "nome": "Ana Souza" }
    }
  ]
}
```

- `equipamento` só existe na aprovação: na solicitação pendente, recusada ou cancelada, vem
  `null`.
- `aprovador` e `dtDecisao` vêm `null` até a aprovação ou a recusa. O cancelamento não é uma
  decisão do aprovador e não os preenche.
- `observacao` é a observação da aprovação ou a justificativa da recusa.
- `historicos` tem uma linha por mudança de status, da mais antiga para a mais recente,
  inclusive a criação, com `statusAnterior` em `null`.

### `POST /api/solicitacoes`

**Só o perfil `SOLICITANTE`.** Cria uma solicitação `PENDENTE`, pela descrição do que o
solicitante precisa.

| Campo do corpo | Tipo | Obrigatório? | O que é |
|---|---|---|---|
| `tipoSolicitado` | texto | sim | Ex.: notebook, monitor. Até 191 caracteres, gravado em minúsculas, como o `tipo` do equipamento |
| `descricao` | texto | sim | Para que o equipamento é necessário. Até 191 caracteres |
| `marcaSolicitada` | texto | não | Até 191 caracteres. Vazio vira `null` |
| `modeloSolicitado` | texto | não | Até 191 caracteres. Vazio vira `null` |

Espaços nas pontas são removidos em todos os campos. Resposta: `201`, com a solicitação criada
e a primeira linha do histórico; `400` com os erros por campo.

### `GET /api/solicitacoes/minhas`

**Só o perfil `SOLICITANTE`.** As solicitações do usuário logado, e só as dele, da mais recente
para a mais antiga, sem paginação. Resposta: `200`, com a lista. Sem solicitações, a lista vem
vazia.

### `GET /api/solicitacoes/pendentes`

**Só o perfil `APROVADOR`.** As solicitações `PENDENTE` de todos os solicitantes, da mais
antiga para a mais recente, sem paginação. Resposta: `200`, com a lista.

### `POST /api/solicitacoes/:id/cancelamento`

**Só o perfil `SOLICITANTE`, e só o dono.** Cancela a solicitação enquanto ela está
`PENDENTE`. Não tem corpo.

Resposta: `200`, com a solicitação `CANCELADA`. Erros: `400` se o id for inválido; `404` se a
solicitação não existir ou for de outro usuário; `409` se ela já não estiver `PENDENTE`.

### `POST /api/solicitacoes/:id/aprovacao`

**Só o perfil `APROVADOR`.** Aprova a solicitação e empresta o equipamento escolhido.

| Campo do corpo | Tipo | Obrigatório? | O que é |
|---|---|---|---|
| `equipamentoId` | número inteiro | sim | O equipamento a emprestar. Precisa estar `DISPONIVEL` |
| `observacao` | texto | não | Até 1000 caracteres. Vazio é ignorado |

Resposta: `200`, com a solicitação `APROVADA`. O equipamento passa a `EMPRESTADO` e aparece no
`emprestimoAtual` de `GET /api/equipamento/:id`.

Erros:

| Código | Quando |
|---|---|
| `400` | Id inválido, `equipamentoId` faltando ou que não é número inteiro, observação acima de 1000 caracteres |
| `404` | A solicitação não existe |
| `422` | O equipamento não existe |
| `409` | A solicitação já não está `PENDENTE` (`'A solicitação já não está pendente.'`) ou o equipamento já não está `DISPONIVEL` (`'O equipamento escolhido já não está disponível.'`) |

A aprovação acontece numa transação: com o `409`, nada é gravado, e a solicitação continua
`PENDENTE`. O mecanismo está no [`ARQUITETURA.md`](ARQUITETURA.md).

### `POST /api/solicitacoes/:id/recusa`

**Só o perfil `APROVADOR`.** Recusa a solicitação, com justificativa. O equipamento não muda.

| Campo do corpo | Tipo | Obrigatório? | O que é |
|---|---|---|---|
| `observacao` | texto | sim | A justificativa da recusa, que o solicitante vê no histórico. Até 1000 caracteres |

Resposta: `200`, com a solicitação `RECUSADA`. Erros: `400` se o id for inválido ou a
justificativa estiver faltando ou acima de 1000 caracteres; `404` se a solicitação não existir;
`409` se ela já não estiver `PENDENTE`.

## Erros

Toda resposta de erro segue o mesmo formato:

```json
{
  "erro": "Dados inválidos.",
  "campos": {
    "email": ["Informe um e-mail válido."]
  }
}
```

- `erro`: a mensagem para mostrar na tela.
- `campos`: só no `400` de validação, com as mensagens de cada campo.

O critério de cada status está no [`DECISOES.md`](../DECISOES.md).

| Código | Quando |
|---|---|
| `400` | Corpo ou parâmetros fora do formato: JSON malformado, campo obrigatório faltando (inclusive a justificativa da recusa e o equipamento da aprovação), tipo errado, texto acima do limite, id que não é número, filtro de `status` desconhecido |
| `401` | Sem login, ou com token inválido ou expirado; e-mail ou senha errados; usuário inativo |
| `403` | Perfil sem permissão para a rota: solicitante nas rotas de equipamentos, nas pendentes, na aprovação e na recusa; aprovador criando, listando "minhas" ou cancelando solicitação |
| `404` | Recurso ou rota não encontrados, inclusive solicitação de outro usuário |
| `409` | O estado mudou: solicitação que já não está `PENDENTE`, equipamento que já não está `DISPONIVEL` |
| `422` | Formato certo, mas a regra não aceita: aprovar com um equipamento que não existe |
| `500` | Erro inesperado no servidor. O detalhe vai só para o log, nunca para a resposta |
| `503` | Banco de dados indisponível. A requisição pode ser repetida em seguida |
