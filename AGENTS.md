# AGENTS.md

> Instruções para quem for trabalhar neste repositório, pessoa ou IA. Ferramentas agentic
> (Claude Code, Cursor, Codex CLI etc.) leem este arquivo antes de qualquer tarefa. Em um
> chat que não lê arquivos sozinho, ele é colado como primeira mensagem.

## Como trabalhar neste repositório

- **Explique o porquê**, não só o quê. Escolha técnica que não é óbvia é explicada antes de
  ser implementada.
- **Prefira a solução simples e defensável** à mais abstrata. Todo código daqui precisa
  poder ser explicado, linha por linha, por quem o mantém.
- **Aponte o erro em vez de concordar.** Uma correção vale mais que uma concordância por
  educação.
- **Pergunte antes de pular etapa.** Se o pedido supõe algo que não está claro, a pergunta
  vem antes do código.
- **Conversa natural.** As regras abaixo são de processo (como o código chega ao
  repositório), não de tom.

## Este repositório

**HelpDesk Corporativo** é um teste técnico full-stack: um sistema de solicitação e
aprovação de equipamentos, com dois perfis de acesso (solicitante e aprovador).

- **Endereço:** ainda não está no ar. A entrega é avaliada localmente, com
  `docker compose up`.
- **Stack:** Node.js com Express 5 (JavaScript) e Prisma 6 · MySQL · React 19 com Vite,
  TypeScript e Tailwind · Caddy servindo o frontend e repassando `/api` para o backend ·
  Docker Compose.
- **Documentação:** na raiz ficam este `AGENTS.md`, que as ferramentas de IA procuram ali, o
  `README.md`, que é a porta de entrada, e o `DECISOES.md`, que a especificação do teste
  exige com esse nome. O resto fica em `docs/`.
- **Repositório público.** Nada de IP, nome de usuário do servidor, conteúdo de `.env`, regra
  de firewall ou porta aberta para a internet entra aqui, nem em documentação, nem em
  comentário. As portas internas dos containers podem aparecer: elas só existem dentro da
  rede do compose.
- **A infraestrutura do servidor já está configurada e é mantida em outro repositório.** O
  compose de produção e a configuração do proxy ficam no repositório privado `infra`; DNS,
  backup e as variáveis de ambiente do servidor também são configurados fora deste
  repositório. Não proponha criar nada disso aqui. Quando uma mudança neste projeto exigir
  mudança no servidor (serviço novo no compose, subdomínio, variável nova), indique o que
  precisa mudar lá.
- **Duas formas de rodar, com as mesmas imagens.** O `docker-compose.yml` deste repositório
  serve para rodar localmente (`docker compose up`), que é como o projeto é avaliado; no
  servidor, o projeto roda pelo compose do `infra`. O backend e o frontend têm cada um o seu
  `Dockerfile`, e ele é o mesmo nos dois lados. Os detalhes estão no `docs/ARQUITETURA.md`,
  em "Onde o projeto roda".

## Regras deste projeto

Valem só aqui. Cada uma tem o motivo, para não ser quebrada sem saber o custo.

- **As rotas obrigatórias são exatamente as da especificação:** `POST /api/novo-equipamento`,
  `GET /api/equipamentos` e `GET /api/equipamento/:id`. Fogem do padrão REST (verbo no
  caminho, singular e plural misturados), mas é por esses nomes que o projeto é avaliado.
- **Prisma 6, não o 7.** O modelo de dados da especificação está no formato do 6
  (`prisma-client-js`, `url = env("DATABASE_URL")`). O 7 exige `prisma.config.ts`, adaptador
  de banco e ESM, e obrigaria a reescrever o modelo entregue.
  - **É uma exceção consciente à regra 6:** a linha 6 recebe só correções de segurança, até
    19/11/2026. O motivo e o custo estão no `DECISOES.md`.
  - **Não aceite as sugestões de atualizar para o 7 ou o 8:** nem a caixa "Update available"
    da CLI, nem o `npm audit fix --force` (a falha que o `npm audit` aponta é da CLI do
    Prisma, não do código da aplicação), nem o Quick Fix da extensão do VS Code, que deve
    ficar fixada no 6 com o comando "Prisma: Pin to Prisma 6".
- **As bibliotecas seguem as linhas que a equipe responsável pelo teste usa** (Express 5,
  Prisma 6, React 19, React Router 7), sempre na versão mais recente de cada linha. A
  verificação de dependências (regra 6) vale dentro dessas linhas: o React Router fica no 7,
  mesmo com o 8 disponível.
- **No container, as migrations são aplicadas com `prisma migrate deploy`, nunca com
  `migrate dev`.** O `migrate dev` é interativo, compara o schema com o banco e pode pedir
  para apagá-lo. O seed só popula o banco vazio, para que subir de novo não duplique dados.
- **`docker compose up` funciona sem `.env`.** O compose traz valores de desenvolvimento como
  padrão, e o `.env.example` documenta o que pode ser trocado. Quem avalia não deve precisar
  configurar nada para ver o sistema rodando.
- **Localmente, só o frontend publica porta.** O MySQL e a API ficam na rede interna do
  compose. Além de seguir a lição das portas (abaixo), isso evita conflito com um MySQL que
  já esteja rodando na máquina de quem avalia.
- **Teste final em clone limpo:** antes da entrega, `git clone` numa pasta nova e
  `docker compose up` do zero. É o único jeito de provar que nada depende de um arquivo que
  só existe na máquina de quem desenvolveu.
- **Código novo roda fora do Docker antes do `docker compose up`, inclusive o caminho de
  erro.** Linha que só roda em erro (validação, `catch`, middleware de erro) precisa rodar ao
  menos uma vez no teste. Fora do Docker, rode `npx prisma generate` na pasta `backend` depois
  de clonar ou de mudar o schema: sem o client gerado, os erros do Prisma não são reconhecidos.
- **Obrigatório antes de opcional.** A especificação avisa que diferencial inacabado pesa
  contra. A label `optional` marca o que vai além do obrigatório (login JWT, CI, deploy), e
  issue com ela só começa com o obrigatório pronto. **Exceção: o login JWT.** A
  especificação o chama de opcional, mas sem ele a regra crítica (só o aprovador cadastra
  equipamento e decide solicitação) não tem como ser garantida: o perfil viria do corpo da
  requisição. Por isso ele entra na etapa 3, antes das rotas de equipamento, e mantém a
  label.
- **`DECISOES.md` na raiz, e não em `docs/` com nome em inglês, como nos outros projetos.**
  A especificação pede o arquivo com esse nome. Ter os dois quebraria o "um fato, um lugar".
- **Nenhuma referência à empresa, ao cliente ou a sistema interno de quem avalia o teste**,
  em código, documentação, commit ou issue. O repositório é público.
- **Enquanto o CI estiver desligado, a promoção para a `main` depende de conferência local:**
  `docker compose up` sobe e o que mudou funciona. O CI entra depois do obrigatório pronto,
  e esta regra sai junto.

## Lições de outros projetos que valem aqui

Cada uma já custou caro em outro repositório. Não precisam ser redescobertas.

- **Erro de serviço de terceiro é `503`, nunca `500`.** `500` diz "o meu código quebrou";
  `503` diz "um serviço do qual eu dependo está fora". O motivo vai no corpo da resposta.
- **Variável de ambiente obrigatória faltando derruba o boot**, com o nome dela no log. Falha
  tardia, no meio de uma requisição, esconde que a causa era configuração.
- **Identidade vem do token.** O id e o perfil do usuário saem sempre do token validado,
  nunca do corpo, da URL ou da query string. Senão um usuário lê ou altera o dado de outro.
- **Schema do banco é versionado em migrations** (`backend/prisma/migrations/`), e migration
  aplicada nunca é editada: correção é migration nova. Nunca `CREATE TABLE IF NOT EXISTS` no
  boot: ele cria, mas nunca altera, e esconde a diferença entre o código e o banco.
- **No servidor, nenhum container publica porta com `ports`.** O proxy alcança a aplicação
  pela rede interna do compose (`expose`). Porta publicada fica aberta para a internet mesmo
  sem regra no firewall. Rodando localmente, só o ponto de entrada (proxy ou front) publica
  porta, e essa exceção fica documentada no `docs/ARQUITETURA.md`.
- **Fim de linha LF em todos os arquivos**, garantido pelo `.gitattributes`. O Git do Windows
  troca para CRLF, e script com CRLF quebra no container Linux com um erro que não aponta a
  causa.
- **Texto do usuário nunca vira HTML sem escape.** No React, isso quer dizer nunca usar
  `dangerouslySetInnerHTML` com dado do usuário. HTML permitido só por lista fechada, com
  biblioteca de sanitização, nunca com regex própria.
- **Segredo fica no servidor** (chave de API, segredo do JWT). O que vai para o navegador,
  qualquer visitante lê: as variáveis `VITE_*` entram no build do frontend e são públicas.

## Fluxo de trabalho obrigatório

1. **Toda alteração com decisão nasce de uma issue**, escrita **antes** do código. O GitHub
   já abre o formulário no formato certo (`.github/ISSUE_TEMPLATE/`): **Funcionalidade** ou
   **Bug**.

   A issue é obrigatória quando a alteração:
   - mexe em **schema, dado de usuário, autenticação ou regra de negócio**;
   - é **correção de bug**, de qualquer tamanho: bug pequeno costuma ter causa interessante,
     e é ela que some se não for escrita;
   - envolve **escolha estrutural**: biblioteca nova, padrão de componente, navegação;
   - muda **como o projeto sobe ou é publicado**: `docker-compose.yml`, `Dockerfile`, CI e
     deploy, mesmo parecendo configuração.

   Dispensam issue: texto de interface, ajuste visual dentro do padrão existente,
   documentação, configuração do repositório (labels, quadro, `.gitignore`,
   `.gitattributes`), refatoração sem mudança de comportamento e atualização de dependência
   sem mudança de código (`chore(deps)`).

   **Na dúvida, o teste:** daqui a três meses, alguém (inclusive quem escreveu) vai
   perguntar "por que foi feito assim?". Se sim, abre issue.

2. **Toda alteração é feita primeiro na branch `staging`**, nunca direto na `main`. O CI roda
   a cada push na `staging`. A `main` é a versão publicada: com o deploy ligado, é o push
   nela que publica.

3. **Commits seguem este padrão:** `tipo(escopo): descrição curta (closes #NN)`.

   Tipos: `feat`, `fix`, `refactor`, `docs`, `chore`. O escopo é a área, com o mesmo nome da
   label de área (`backend`, `frontend`, `database`...). Documentação e configuração que não
   pertencem a uma área de código usam `infra`. O `closes #NN` só fecha a issue quando o
   commit chega à `main`.

### Labels

O catálogo de labels é mantido no repositório `modelo-projeto`, com nome em inglês e
descrição em português. Este repositório recebe o catálogo com o comando `gh label clone`, e
as labels padrão do GitHub que não fazem parte dele são apagadas.

| Grupo            | Labels                                                                                        |
| ---------------- | --------------------------------------------------------------------------------------------- |
| Tipo             | `feature`, `enhancement`, `bug`, `security`, `refactor`, `documentation`, `chore`, `decision` |
| Área             | `backend`, `frontend`, `database`, `auth`, `infra`, `integration`, `ai`, `mobile`, `ui/ux`    |
| Só deste projeto | `optional`                                                                                    |

- **Toda issue recebe um tipo e uma ou mais áreas.**
- **Os modelos de issue aplicam `feature` e `bug` pelo nome exato.** Renomear uma dessas
  labels faz o modelo deixar de aplicá-la, sem erro nenhum.
- **Label que só faz sentido num projeto** é criada só nele, com descrição, e listada em
  "Regras deste projeto". Se passar a servir a outros projetos, entra também no catálogo do
  modelo.

### Milestones

Opcionais. Valem quando o projeto tem prazo ou uma fase com muitas issues: nesses casos, a
fase do `docs/ROADMAP.md` vira um milestone com o mesmo nome, e a data, se houver, vai nele.
Este projeto não usa.

### Quadro

O GitHub Projects **HelpDesk Corporativo** acompanha as issues em quatro colunas:
**Todo → In Progress → Staging Done → Done**, com nome em inglês e descrição em português,
como as labels.

- A issue nova entra sozinha em **Todo**, pelo workflow de auto-add.
- A issue fechada vai sozinha para **Done**, quando o `closes #NN` chega à `main`.
- A passagem para **Staging Done** é manual: o `closes` só age na `main`, então o GitHub não
  tem como saber que o commit chegou à `staging`.
- **Nunca arraste um cartão para Done à mão.** O workflow de auto-close fecha a issue nesse
  momento, antes de o código chegar à `main`.

### Sequência de comandos

```bash
# 1. Garantir que a staging local está atualizada
git checkout staging
git pull origin staging

# 2. Preparar e conferir, numa passada só, o que vai entrar no commit
git add -A && git status && git --no-pager diff --cached -M

# 3. Commitar no padrão e subir para a staging (dispara o CI)
git commit -m "tipo(escopo): descrição curta (closes #NN)"
git push origin staging

# 4. Só com o CI verde: promover para a main
git checkout main
git pull origin main
git merge staging --no-edit
git push origin main
git checkout staging
```

- `--no-edit` evita que o merge abra o Vim pedindo mensagem.
- O último `checkout staging` devolve para a branch de trabalho.
- **Revert sempre pelo código do commit** (`git revert a1b2c3d`), nunca por `HEAD`: depois de
  um merge, `HEAD` pode não ser o commit que você pensa.
- **Verde na Action não garante código novo.** Ela reporta sucesso mesmo quando o `git pull`
  do servidor não trouxe nada. Antes de acusar o deploy, confira se o commit esperado está na
  `main` do GitHub e no `git log --oneline -3` do servidor.
- **Em mais de uma máquina:** push antes de sair de uma, pull antes de começar na outra.

## Regras de código

4. **Comentários explicam o quê e o porquê**, em tom formal e impessoal, numa linha sempre
   que possível. Número de issue (`#43`) não entra no código: fica na issue e no commit.

5. **Segurança não é uma fase separada.** Funcionalidade que lida com entrada de usuário,
   autenticação ou dado sensível já nasce com validação. Não se deixa para depois.

6. **Verificação de dependências (anti-legado).** Antes de propor qualquer pacote, SDK, API
   ou versão de Action, confira se é a versão atual e mantida. Não confie em dado de
   treinamento: pacote obsoleto (deprecated) ou em fim de vida não entra. Sem certeza, avise
   ou pesquise antes de gerar o código.

7. **Suspeita não é achado.** Não aponte problema sem o arquivo na mão. Levantar cinco
   hipóteses de uma vez transfere para quem revisa o trabalho de verificar todas. Peça o
   arquivo, ou o `grep` que localiza os pontos de uso, e só então conclua.

8. **Revisão antes do commit, quando vale a pena.** Mudança não trivial (feature nova,
   autenticação, dado sensível) passa por revisão da saída de `git diff --cached` antes do
   commit. Ajuste pequeno não precisa parar o fluxo.

## Regras de documentação

9. **Um fato, um lugar.** Nada é copiado de um documento para outro; um aponta para o outro.

   | Arquivo                      | O que fica nele                                                                                                                                                                           |
   | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `docs/ROADMAP.md`            | Escopo: as etapas do teste, o que é obrigatório e o que é `optional`, dívidas, ideias. A cada entrega, no mesmo push: itens marcados com `[x]` e a issue, e a tabela de status atualizada |
   | `DECISOES.md`                | Decisões estruturais (arquitetura, banco, auth, framework), com o motivo e o custo aceito. Não é log de commit                                                                            |
   | `docs/PITFALLS.md`           | Armadilhas que já aconteceram. Corrigida é marcada, nunca apagada                                                                                                                         |
   | `docs/ARQUITETURA.md`        | Como o sistema funciona hoje. Mudou o funcionamento, muda o arquivo no mesmo commit                                                                                                       |
   | `docs/PAGES.md`              | Estado de cada tela                                                                                                                                                                       |
   | `docs/API.md`                | O contrato da API com quem a consome: o frontend e quem avalia. Mudança no contrato muda o arquivo no mesmo commit                                                                        |
   | `backend/prisma/migrations/` | Schema versionado. Migration aplicada nunca é editada                                                                                                                                     |

10. **Fase nova não vai para o fim da fila.** Se uma fase revela dívida ou requisito novo, a
    correção vira fase intermediária (ex.: 3.5), entre as duas que a originaram.

11. **Armadilha conhecida tem pergunta obrigatória.** Se a tarefa toca a área de uma
    armadilha do `docs/PITFALLS.md`, responda a pergunta dela explicitamente, com o arquivo
    real na mão, não de memória.

## Como propor alterações

12. **Arquivo inteiro** quando a mudança passa de três pontos do mesmo arquivo.

13. **Edição por trecho (Ctrl+F)** para mudança pequena num arquivo que já existe:
    - informar o arquivo e se o passo é no **editor** ou no **terminal**;
    - mostrar o **trecho atual completo**, copiado do arquivo, para ser localizado com Ctrl+F:
      nunca número de linha, e nunca um fragmento que apareça mais de uma vez;
    - mostrar o **trecho novo completo**, que substitui o anterior;
    - se for inserção, dizer se entra **antes** ou **depois** do trecho localizado.

    Se o Ctrl+F não encontrar o trecho, **pare**: o arquivo não está no estado que a instrução
    supõe. Sem a versão atual do arquivo, peça antes.

14. **Código e arquivos de texto vão no chat, em bloco de código.** Nunca arquivo para baixar
    e nunca zip; arquivo para baixar só para o que não é texto. Arquivo que tem bloco de
    código dentro vai numa moldura `~~~`, porque crases aninhadas cortam a colagem no meio.
    Para arquivo novo: a pasta, o nome exato e como criar no VS Code.

15. **Diga onde o comando roda:** na máquina local ou no servidor, no terminal ou no editor.

16. **Commit só depois de aprovado, e com travas.** A proposta é aprovada antes de vir o
    comando de commit. O bloco confere só o que não pode dar errado: a branch é a certa, e
    nenhum `.env` nem `node_modules` entra no commit. Se uma trava falhar, ele para com
    **❌ PARE** e diz qual. O conteúdo dos arquivos é conferido pela revisão do
    `git diff --cached` (regra 8) e com o sistema rodando, não pelo bloco de commit.

## Este projeto no portfólio

Este projeto aparece no portfólio **JVM Systems** (`joaomendes.dev.br`, repositório
`jvm-systems`), por um arquivo em `src/content/projetos/`, seguindo o `docs/CONTEUDO.md`
daquele repositório.

- **O site não afirma nada que o código não sustente.** Estado, fase, stack e capa do
  estudo de caso acompanham este repositório.
- **Mudou o projeto, muda o `.mdx`.** Entrega que muda o que o estudo de caso diz exige
  atualizar o portfólio junto.
