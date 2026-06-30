import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Parse from 'parse';

// Parse initialization
// see vite.config.js for parse aliasing
Parse.initialize(
  "7RRwYI9Lvy7MtzdyT1wGE2TjUHNCJpQa8D7qW0yT",
  "AqanjPV1KwvqJVrCSn7EW6aCxu2mn1Q1GUeUr2jK"
);

Parse.serverURL = "https://parseapi.back4app.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
