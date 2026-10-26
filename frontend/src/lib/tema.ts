export type Tema = 'claro' | 'escuro'

const CHAVE = 'helpdesk-tema'

// O tema salvo no navegador; sem escolha salva, o claro.
export function lerTema(): Tema {
  try {
    if (localStorage.getItem(CHAVE) === 'escuro') {
      return 'escuro'
    }
  } catch {
    // Navegador sem acesso ao localStorage: vale o tema claro.
  }
  return 'claro'
}

// O index.css troca as cores pelo atributo data-tema do <html>.
export function aplicarTema(tema: Tema) {
  document.documentElement.dataset.tema = tema
}

export function salvarTema(tema: Tema) {
  aplicarTema(tema)
  try {
    localStorage.setItem(CHAVE, tema)
  } catch {
    // Sem localStorage, o tema vale até a página ser recarregada.
  }
}
