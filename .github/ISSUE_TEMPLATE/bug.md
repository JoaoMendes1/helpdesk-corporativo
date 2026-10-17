---
name: Bug
about: Algo que deveria funcionar e não funciona
title: "fix: "
labels: bug
---

<!-- Antes de salvar, no painel ao lado: as labels de área. Se o bug for uma falha de
segurança, adicione security. -->

### Sintoma

<!-- O que aparece para quem usa, exatamente como aparece: mensagem, tela, código HTTP. -->

### Como reproduzir

1. Passo 1
2. Passo 2

### Causa

<!-- Preencha quando descobrir. É a parte que mais ensina, e a que some se não for escrita. -->

### Tarefas

- [ ] Corrigir a causa, não só o sintoma
- [ ] Avaliar se vira item do `docs/PITFALLS.md` (falhou em silêncio? pode voltar?)

### Critérios de aceite

- [ ] O passo a passo acima não reproduz mais o problema
- [ ] Conferido rodando com `docker compose up`