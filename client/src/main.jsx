
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import { ClerkProvider } from '@clerk/react'
import {AppProvider} from './context/AppContext.jsx'


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <ClerkProvider>
   < AppProvider>
      <App />
     </ AppProvider>
    </ClerkProvider>
  </BrowserRouter>,
    
 
)
