# Telas

O estado de cada tela. O andamento por etapa está no [`ROADMAP.md`](ROADMAP.md).

Todas as telas tratam carregamento e erro; as que têm formulário tratam também a validação.
O solicitante não vê o estoque: entra direto em Minhas solicitações.

O protótipo navegável de todas as telas está em
[`prototipo/helpdesk-v1.html`](prototipo/helpdesk-v1.html). Abre direto no navegador, com
dados fictícios, e a barra do topo troca a tela, o perfil e o estado da página.

| Tela | Perfil | Status | Etapa | Arquivo |
|---|---|---|---|---|
| Login | Todos | ✅ Implementada | 6 | `frontend/src/pages/Login.tsx` |
| Dashboard: totais de equipamentos por status | Aprovador | ✅ Implementada | 6 | `frontend/src/pages/Painel.tsx` |
| Equipamentos: lista com filtros por status e tipo, e detalhe | Aprovador | ✅ Implementada | 6 | `frontend/src/pages/Equipamentos.tsx` |
| Novo equipamento | Aprovador | ✅ Implementada | 6 | `frontend/src/pages/NovoEquipamento.tsx` |
| Minhas solicitações: status e histórico de observações | Solicitante | ✅ Implementada | 7 | `frontend/src/pages/MinhasSolicitacoes.tsx` |
| Nova solicitação: descrição do equipamento de que precisa | Solicitante | ✅ Implementada | 7 | `frontend/src/pages/NovaSolicitacao.tsx` |
| Solicitações pendentes: aprovar ou recusar com justificativa | Aprovador | ✅ Implementada | 7 | `frontend/src/pages/SolicitacoesPendentes.tsx` |

Status possíveis: ✅ Implementada · 🎨 Prototipada · 🕐 Planejada.

## Diferenças em relação ao protótipo

- **Modo escuro e menu recolhível:** ficam para depois da entrega (etapa 9 do
  [`ROADMAP.md`](ROADMAP.md)). Em tela estreita, o menu mostra só os ícones.
- **Sair:** fica direto no cabeçalho, sem o menu do usuário, que só teria essa opção.
- **Menu:** o item Pendentes não mostra o número de solicitações; o painel mostra a lista.
- **Tipo no cadastro de equipamento:** é escolhido numa lista dos tipos existentes, com a
  opção "Outro tipo…" para um tipo novo, em vez de texto livre com sugestões. Assim, um erro
  de digitação não cria um tipo separado nos filtros.
- **Aviso de sucesso:** aparece no topo da tela, em vez do aviso temporário no canto: na lista
  de equipamentos, com a linha nova destacada; em Minhas solicitações, com o cartão novo
  destacado; e depois de cancelar, aprovar ou recusar.
- **Conflito (`409`):** além da mensagem da API, a lista é recarregada ao fechar o diálogo, porque
  a solicitação ou o equipamento mudou fora da tela.
- **Aprovar sem equipamento disponível:** o diálogo mostra só o aviso, sem o campo de observação,
  porque não há o que aprovar.
