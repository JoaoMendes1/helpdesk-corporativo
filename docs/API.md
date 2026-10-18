# API

Rotas da API, com o formato de entrada, de resposta e de erro. Quem usa é o frontend, pelo
mesmo endereço, em `/api`, e quem avalia o projeto, com um cliente HTTP.

**Estado:** 🕐 planejado. As rotas ainda não existem em código. As de login, de solicitações
e do dashboard entram aqui nas etapas 3 a 5 do [`ROADMAP.md`](ROADMAP.md).

## Autenticação

- Todas as rotas exigem login, menos a de login e a de saúde. Sem token, ou com token
  inválido, a resposta é `401`.
- O id e o perfil do usuário vêm do token, nunca do corpo da requisição.
- Usuário inativo não entra: o login responde `401`, com a mesma mensagem de senha errada.
- O token vai num cookie `httpOnly`, que o navegador envia sozinho em toda requisição. O
  motivo está no [`DECISOES.md`](../DECISOES.md).

## Rota de saúde

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

Toda resposta de erro segue o mesmo formato, definido na etapa 3. O critério de cada status
está no [`DECISOES.md`](../DECISOES.md).

| Código | Quando |
|---|---|
| `400` | Corpo ou parâmetros fora do formato: campo obrigatório faltando (inclusive a justificativa da recusa), tipo errado, id que não é número. A resposta lista o erro de cada campo |
| `401` | Token ausente, inválido ou expirado; login de usuário inativo |
| `403` | Perfil sem permissão para a rota: solicitante cadastrando equipamento, aprovador criando solicitação |
| `404` | Recurso não encontrado, inclusive solicitação de outro usuário |
| `409` | O estado mudou: solicitação que já não está `PENDENTE`, equipamento que já não está `DISPONIVEL` |
| `422` | Formato certo, mas a regra não aceita: aprovar sem informar o equipamento quando a solicitação não tem um |