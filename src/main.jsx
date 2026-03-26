import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import BookPage from './BookPage.jsx'

const isBookPage = window.location.pathname.startsWith('/book');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isBookPage ? <BookPage /> : <App />}
  </StrictMode>,
)
