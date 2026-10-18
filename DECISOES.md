# Decisões de arquitetura

As decisões que vão além do que a especificação já define, com o motivo e o custo aceito. A
stack e as versões seguem o padrão da equipe responsável pelo teste.

Registradas em 17/10/2026.

## Padrões de projeto

| Padrão | Onde | Para quê |
|---|---|---|
| Arquitetura em camadas | `routes` → `controllers` → `services` | Separar o HTTP da regra de negócio |
| Middleware (cadeia de responsabilidade) | Login, perfil e erros | A mesma verificação em várias rotas, sem repetir código |
| Tratamento centralizado de erros | `errors/` e o middleware de erro | Um formato de erro só, em toda a API |
| Validação por schema | `zod`, na entrada de cada rota | Dado inválido para antes de chegar à regra |
| Singleton | Prisma Client, em `lib/` | Um único pool de conexões para a aplicação inteira |
| Transação com atualização condicional | Aprovação e recusa | Tudo ou nada, e nenhuma decisão em dobro |
| Proxy reverso | Caddy, na frente de tudo | Um endereço só para o navegador, sem CORS |

## Arquitetura

### Camadas, sem repository

- **Como:** a rota liga a URL ao controller; o controller cuida do HTTP; o service guarda a
  regra de negócio e fala com o banco.
- **Por quê:** é a separação que a especificação pede. O repository ficou de fora porque o
  Prisma Client já é a camada de acesso aos dados.
- **Custo:** trocar de ORM exigiria mexer nos services.

### Um formato de erro, com o status pelo tipo de problema

- **Como:** um middleware transforma qualquer erro na mesma resposta. A lista completa está
  no [`docs/API.md`](docs/API.md).
- **Por quê:** o frontend trata os erros num lugar só, e cada status diz uma coisa: `400` é
  pedido fora do formato, `422` é formato certo que a regra recusa, `409` é estado que mudou.
- **Custo:** cada regra precisa dizer qual erro lança.

### Validação de entrada com `zod`, e não com o `validator`

- **Por quê:** um schema descreve a entrada inteira, e os erros saem por campo, prontos para
  o `400`. O `validator` confere um texto de cada vez, e a checagem do objeto seria escrita
  à mão em cada rota.
- **Quando o `validator` seria melhor:** em formatos prontos, como o IMEI de um celular e o
  endereço MAC de um equipamento de rede, que o cadastro de hoje não tem.
- **Reavaliar:** se o cadastro passar a incluir celulares ou equipamentos de rede. O
  `validator` pode entrar dentro do schema do `zod`, sem trocar de biblioteca.
- **Custo:** uma dependência a mais, e um schema por rota.

### Caddy na frente do frontend e da API

- **Por quê:** o navegador fala com um endereço só, então não há CORS para configurar nem
  origem para liberar.
- **Custo:** um container a mais.

## Segurança

### Login com JWT, mesmo sendo diferencial

- **Como:** o token leva o id e o perfil do usuário, e toda a `/api` exige login, menos a
  própria rota de login. A senha fica no banco como hash, com `bcryptjs`.
- **Por quê:** sem login, a regra crítica não se sustenta: o perfil viria do corpo da
  requisição, que qualquer um escreve.
- **Custo:** o token não pode ser revogado, vale até expirar. E quem avalia faz login antes
  de testar a API; os usuários do seed estão no `README.md`.

### Só o frontend publica porta na máquina

- **Por quê:** o banco e a API ficam na rede interna do compose, sem acesso de fora. E o
  projeto não disputa a porta 3306 com um MySQL que já esteja rodando na máquina de quem
  avalia.
- **Custo:** para consultar o banco direto, é preciso entrar no container.

### Só o solicitante cria solicitação

- **Por quê:** sem essa regra, um aprovador poderia pedir um equipamento e aprovar o próprio
  pedido. Cada perfil faz o seu papel.
- **Custo:** um aprovador que precise de equipamento usa uma conta de solicitante.

### Solicitação de outro usuário responde `404`

- **Por quê:** um `403` confirmaria que a solicitação existe. Com `404`, quem tenta ids
  aleatórios não descobre nada.
- **Custo:** o erro não diz se a solicitação não existe ou se é de outra pessoa.

### Usuário inativo não faz login

- **Como:** o login de um usuário com `ativo = false` recebe `401`, com a mesma mensagem de
  senha errada.
- **Por quê:** o modelo tem o campo `ativo`, e a mensagem igual não revela que o e-mail
  existe.
- **Custo:** quem já tem um token continua com acesso até ele expirar.

### Valores de desenvolvimento no `docker-compose.yml`

- **Como:** o compose traz a senha do banco e o segredo do JWT, fictícios, usados quando não
  há `.env`. O `.env.example` continua sem valores.
- **Por quê:** a especificação pede o sistema pronto para avaliar com um comando só, sem
  configurar nada. Esses valores não servem para nada fora da máquina de quem roda.
- **Custo:** existe uma senha no repositório, mesmo fictícia. Fora do desenvolvimento, o
  `.env` substitui todas.

## Banco

### Prisma 6, e não o 7

- **Por quê:** o modelo de dados da especificação está no formato do 6 (gerador
  `prisma-client-js` e `url` no `datasource`), e o 7 exigiria alterá-lo (arquivo de
  configuração, adaptador de banco e ESM). O 6 também é a versão que a equipe responsável
  pelo teste usa: antes de começar, consultei a equipe para desenvolver na mesma linha de
  versões. Essa escolha é deste projeto, não da especificação, e vale enquanto a versão tiver
  suporte; o Vite é o caso oposto, atualizado porque a versão da equipe já não tem.
- **Custo:** a linha 6 recebe só correções de segurança, até 19/11/2026.
- **Reavaliar:** se o projeto continuar depois dessa data. A migração para o 7 não muda as
  regras de negócio, só a configuração do Prisma.

### Índices que o modelo oficial não tem

- **Como:** em `equipamentos`, para os filtros por `status` e `tipo`; em `solicitacoes`,
  `[status, dtSolicitacao]`, para a lista de pendentes do aprovador.
- **Por quê:** a especificação pede índices de acordo com os filtros usados. O índice oficial
  `[aprovadorId, status]` não serve à lista de pendentes: ele começa pelo aprovador, e a
  solicitação pendente ainda não tem um.
- **Custo:** escrita um pouco mais lenta nas duas tabelas.

## Regras de negócio

### Status escolhido no cadastro, com `DISPONIVEL` como padrão

- **Por quê:** a especificação diz que a rota cria com `DISPONIVEL`, mas também que o
  aprovador informa o status. Confirmado com a equipe responsável pelo teste.
- **Custo:** dá para cadastrar um equipamento já `EMPRESTADO`, sem solicitação ligada.

### Data de cadastro automática

- **Por quê:** o modelo já preenche a data sozinho, e uma data digitada abriria espaço para
  erro. Confirmado com a equipe responsável pelo teste.
- **Custo:** não dá para registrar data retroativa.

### Equipamento escolhido pelo solicitante ou na aprovação

- **Como:** o solicitante escolhe um equipamento `DISPONIVEL` ou descreve o que precisa. Se
  descreveu, o aprovador escolhe ao aprovar.
- **Por quê:** o modelo prevê os dois caminhos: `equipamentoId` opcional e os campos
  `marcaSolicitada`, `modeloSolicitado` e `tipoSolicitado`.
- **Custo:** escolher não reserva. Se o equipamento sair antes, a aprovação recebe `409`.

### Aprovação e recusa numa transação

- **Como:** solicitação, equipamento e histórico mudam de uma vez, e só se a solicitação
  ainda estiver `PENDENTE` e o equipamento ainda estiver `DISPONIVEL`.
- **Por quê:** ou muda tudo, ou nada. A condição impede emprestar o mesmo equipamento duas
  vezes, ou decidir a mesma solicitação duas vezes.
- **Custo:** quem perde a disputa recebe `409`.

### Justificativa obrigatória na recusa

- **Por quê:** a especificação pede o registro das "justificativas cabíveis". Na recusa, o
  solicitante precisa saber o motivo; na aprovação, a justificativa é opcional.
- **Custo:** recusar sem justificativa recebe `400`.

### Cancelamento só enquanto `PENDENTE`

- **Por quê:** depois da decisão do aprovador, cancelar desfaria uma decisão que não é do
  solicitante.
- **Custo:** solicitação aprovada por engano só muda com uma regra nova.

## Decisões pendentes

- **Onde o frontend guarda o token** (memória, `localStorage` ou cookie). Decisão de
  segurança, tomada na etapa 6, junto da tela de login.