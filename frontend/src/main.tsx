import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import { AutenticacaoProvider } from './contexts/AutenticacaoProvider'
import { aplicarTema, lerTema } from './lib/tema'

// Antes da primeira renderização, para as telas já aparecerem no tema certo.
aplicarTema(lerTema())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AutenticacaoProvider>
        <App />
      </AutenticacaoProvider>
    </BrowserRouter>
  </StrictMode>,
)
