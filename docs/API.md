# API

Rotas da API, com o formato de entrada, de resposta e de erro. Quem usa é o frontend, pelo
mesmo endereço, em `/api`, e quem avalia o projeto, com um cliente HTTP.

**Estado:** 🚧 em andamento. As rotas de autenticação e o formato de erro existem desde a
etapa 3. As de equipamentos e do dashboard entram na etapa 4, e as de solicitações, na etapa 5
do [`ROADMAP.md`](ROADMAP.md).

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

## Rotas obrigatórias

### `POST /api/novo-equipamento`

Cadastra um equipamento. **Só o perfil `APROVADOR`.**

| Campo do corpo | Tipo | Obrigatório? | O que é |
|---|---|---|---|
| `marca` | texto | sim | |
| `modelo` | texto | sim | |
| `tipo` | texto | sim | Ex.: notebook, monitor |
| `status` | texto | não | Um de `DISPONIVEL`, `EMPRESTADO`, `MANUTENCAO` ou `INATIVO`. Se não vier, `DISPONIVEL` |

A data de cadastro é preenchida pelo banco, e o criador vem do token. Resposta: `201`, com o
equipamento criado.

```json
{
  "id": 1,
  "marca": "Dell",
  "modelo": "Latitude 5440",
  "tipo": "notebook",
  "status": "DISPONIVEL",
  "dtCadastro": "2026-10-17T13:00:00.000Z",
  "criadoPorId": 1
}
```

### `GET /api/equipamentos`

Lista os equipamentos. Filtros pela query string, todos opcionais:

| Parâmetro | O que filtra |
|---|---|
| `status` | Um dos quatro status do equipamento |
| `tipo` | O tipo do equipamento |

Resposta: `200`, com a lista no mesmo formato do equipamento acima.

### `GET /api/equipamento/:id`

Os dados detalhados de um equipamento: os mesmos campos da lista, mais quem o cadastrou e,
se estiver emprestado, a solicitação aprovada que o emprestou.

Resposta: `200`; `400` se o id não for um número; `404` se não existir.

```json
{
  "id": 1,
  "marca": "Dell",
  "modelo": "Latitude 5440",
  "tipo": "notebook",
  "status": "EMPRESTADO",
  "dtCadastro": "2026-10-17T13:00:00.000Z",
  "criadoPor": { "id": 1, "nome": "Ana Souza" },
  "emprestimoAtual": {
    "solicitacaoId": 7,
    "solicitante": { "id": 3, "nome": "Bruno Lima" },
    "dtDecisao": "2026-10-18T09:30:00.000Z"
  }
}
```

Quando o equipamento não está emprestado, `emprestimoAtual` vem `null`.

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
| `400` | Corpo ou parâmetros fora do formato: JSON malformado, campo obrigatório faltando (inclusive a justificativa da recusa), tipo errado, id que não é número |
| `401` | Sem login, ou com token inválido ou expirado; e-mail ou senha errados; usuário inativo |
| `403` | Perfil sem permissão para a rota: solicitante cadastrando equipamento, aprovador criando solicitação |
| `404` | Recurso ou rota não encontrados, inclusive solicitação de outro usuário |
| `409` | O estado mudou: solicitação que já não está `PENDENTE`, equipamento que já não está `DISPONIVEL` |
| `422` | Formato certo, mas a regra não aceita: aprovar sem informar o equipamento quando a solicitação não tem um |
| `500` | Erro inesperado no servidor. O detalhe vai só para o log, nunca para a resposta |
| `503` | Banco de dados indisponível. A requisição pode ser repetida em seguida |