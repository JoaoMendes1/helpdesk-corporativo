# Decisões de arquitetura

O que a especificação exige (stack, rotas obrigatórias, modelo de dados) não está aqui. Este
arquivo reúne as escolhas que ela deixa em aberto, com o motivo e o custo aceito. As escolhas
são minhas; a coluna **Alinhada com a equipe** marca as que confirmei com a equipe responsável
pelo teste antes de implementar. As versões seguem as linhas que essa equipe usa.

Registradas em 17/10/2026 · atualizadas em 20/10/2026.

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

| Decisão | Alinhada com a equipe | Por quê | Custo aceito |
|---|---|---|---|
| Camadas, sem repository | Não | A especificação pede controllers separados das regras de negócio. O Prisma Client já é a camada de acesso aos dados | Trocar de ORM exige mexer nos services |
| Um formato de erro, com o status pelo tipo de problema | Não | O frontend trata os erros num lugar só. `400` é pedido fora do formato, `422` é formato certo que a regra recusa, `409` é estado que mudou. A lista está no [`docs/API.md`](docs/API.md) | Cada regra precisa dizer qual erro lança |
| Validação com `zod`, e não com o `validator` | Não | Um schema descreve a entrada inteira e devolve os erros por campo, prontos para o `400`. O `validator` confere um texto de cada vez | Uma dependência a mais. Reavaliar se o cadastro ganhar IMEI ou MAC: o `validator` entra dentro do schema, sem trocar de biblioteca |
| Caddy na frente do frontend e da API | Não | O navegador fala com um endereço só: não há CORS para configurar nem origem para liberar | Um container a mais |

## Segurança

| Decisão | Alinhada com a equipe | Por quê | Custo aceito |
|---|---|---|---|
| Login com JWT, mesmo sendo diferencial | Não | Sem login, a regra crítica não se sustenta: o perfil viria do corpo da requisição. O token leva o id e o perfil, toda a `/api` exige login (menos o login e a rota de saúde, `/api/health`) e a senha fica no banco como hash, com `bcryptjs` | O token não pode ser revogado: vale até expirar. Quem avalia faz login antes de testar a API; os usuários estão no `README.md` |
| Token em cookie `httpOnly`, com `SameSite=Strict` | Não | O JavaScript não lê o cookie, então um script injetado (XSS) não leva o token. Com o Caddy, tudo fica na mesma origem e o navegador manda o cookie sozinho. O `SameSite` impede outro site de usá-lo. Descartados: `localStorage` (um XSS leva o token) e memória (o F5 desloga) | Duas rotas a mais: logout, porque só a API apaga o cookie, e `/api/me`, que o frontend consulta ao abrir para saber quem está logado. Testar com `curl` exige guardar o cookie (`-c` e `-b`) |
| Só o frontend publica porta na máquina | Não | O banco e a API ficam na rede interna do compose, sem acesso de fora, e o projeto não disputa a porta 3306 com um MySQL local | Consultar o banco direto exige entrar no container |
| Só o solicitante cria solicitação | Não | Sem isso, um aprovador pediria um equipamento e aprovaria o próprio pedido | Um aprovador que precise de equipamento usa uma conta de solicitante |
| Solicitação de outro usuário responde `404` | Não | Um `403` confirmaria que a solicitação existe; com `404`, quem tenta ids aleatórios não descobre nada | O erro não diz se a solicitação não existe ou se é de outra pessoa |
| Usuário inativo não faz login | Não | O modelo tem o campo `ativo`. A resposta é `401`, com a mesma mensagem de senha errada, para não revelar que o e-mail existe | Quem já tem um token mantém o acesso até ele expirar |
| Valores de desenvolvimento no `docker-compose.yml` | Não | A especificação pede o sistema pronto para avaliar com um comando só. Os valores são fictícios, e o `.env.example` continua sem valores | Existe senha no repositório, mesmo fictícia. Fora do desenvolvimento, o `.env` substitui todas |

## Banco

| Decisão | Alinhada com a equipe | Por quê | Custo aceito |
|---|---|---|---|
| Prisma 6, e não o 7 | Sim | O modelo da especificação está no formato do 6, e o 7 exigiria alterá-lo (arquivo de configuração, adaptador de banco e ESM). É a linha que a equipe usa, consultada antes de começar, e vale enquanto tiver suporte: o Vite foi atualizado porque a versão da equipe já não tem | A linha 6 recebe só correções de segurança, até 19/11/2026. Reavaliar se o projeto continuar depois: a migração muda a configuração do Prisma, não as regras |
| Índices que o modelo oficial não tem | Não | A especificação pede índices de acordo com os filtros. Em `equipamentos`, `[status, tipo]` e `[tipo]`, para os filtros da listagem. Em `solicitacoes`, `[status, dtSolicitacao]`, para a lista de pendentes: o `[aprovadorId, status]` oficial não serve, porque a pendente ainda não tem aprovador | Escrita um pouco mais lenta nas duas tabelas |

## Regras de negócio

| Decisão | Alinhada com a equipe | Por quê | Custo aceito |
|---|---|---|---|
| Status escolhido no cadastro, com `DISPONIVEL` como padrão | Sim | A especificação diz que a rota cria com `DISPONIVEL`, mas também que o aprovador informa o status | Dá para cadastrar um equipamento já `EMPRESTADO`, sem solicitação ligada |
| Data de cadastro automática | Sim | O banco já preenche a data, e uma data digitada abriria espaço para erro | Não dá para registrar data retroativa |
| O solicitante não vê o estoque: pede pela descrição, e o aprovador escolhe o equipamento ao aprovar | Não | Segue o fluxo real de gestão de ativos: quem pede descreve a necessidade, e quem cuida do estoque decide qual unidade entregar. O modelo já prevê o pedido descrito (`marcaSolicitada`, `modeloSolicitado`, `tipoSolicitado`). As rotas de equipamentos e os totais ficam só para o aprovador | O solicitante não sabe se há equipamento antes de pedir, e um pedido sem estoque termina em recusa, com justificativa |
| Aprovação e recusa numa transação, com condição | Não | Solicitação, equipamento e histórico mudam juntos, e só se a solicitação ainda estiver `PENDENTE` e o equipamento `DISPONIVEL`. Assim nada é emprestado ou decidido duas vezes | Quem perde a disputa recebe `409` |
| Justificativa obrigatória na recusa | Não | A especificação pede o registro das "justificativas cabíveis". Na recusa, o solicitante precisa saber o motivo; na aprovação, é opcional | Recusar sem justificativa recebe `400` |
| Cancelamento só pelo dono, e só enquanto `PENDENTE` | Não | Depois da decisão do aprovador, cancelar desfaria uma decisão que não é do solicitante | Solicitação aprovada por engano só muda com uma regra nova |