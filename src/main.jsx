import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import { ArtGallery } from './components/ArtGallery.jsx'

// ?gallery shows every piece of art on one page. Dev builds only.
const showGallery = import.meta.env.DEV && new URLSearchParams(window.location.search).has('gallery')

createRoot(document.getElementById('root')).render(
  <StrictMode>{showGallery ? <ArtGallery /> : <App />}</StrictMode>,
)
