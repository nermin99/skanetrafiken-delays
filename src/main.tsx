import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import amplifyOutputs from '../amplify_outputs.json'
import './index.css'
import App from './App.tsx'

Amplify.configure(amplifyOutputs)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
