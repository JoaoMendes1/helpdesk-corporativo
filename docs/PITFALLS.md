# Armadilhas

Armadilhas que já aconteceram neste repositório, principalmente as silenciosas: o que não
quebra, só entrega errado. Armadilha corrigida não é apagada: recebe a marcação de resolvida,
para o raciocínio continuar disponível.

As lições que vieram de outros projetos estão no [`AGENTS.md`](../AGENTS.md).

## Formato de cada item

- **Título:** descreve a armadilha, não a correção.
- **Sintoma:** o que se via, exatamente como aparecia (mensagem, tela, código HTTP).
- **Causa:** por que acontecia.
- **Pergunta obrigatória:** o que precisa ser respondido antes de mexer naquela área.
- **Conferência:** o comando ou a consulta que prova que a armadilha não está armada.
- Quando resolvida, logo abaixo do título: **Resolvida em dd/mm/aaaa**, com o commit.

---

## Erro de digitação em linha que só roda quando dá erro

- **Sintoma:** nenhum, no uso normal: o projeto sobe e funciona. Só quando o caminho de erro
  roda aparece `ReferenceError: proccess is not defined`, no lugar da mensagem que o código
  deveria mostrar.
- **Causa:** o JavaScript só confere se um nome existe quando a linha é executada. Um
  `proccess` (com dois `c`) dentro de um `if` de erro ou de um `catch` passa por todos os
  testes do caminho feliz. Aconteceu na etapa 2 (#1).
- **Pergunta obrigatória:** o código novo tem linhas que só rodam em erro (`if` de validação,
  `catch`, middleware de erro)? Elas já rodaram ao menos uma vez?
- **Conferência:** antes do `docker compose up`, provocar cada erro de propósito (variável
  faltando, entrada inválida, token errado) e conferir a mensagem. Busca rápida:
  `grep -rn "proccess" backend/src backend/prisma`.