import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Parse from 'parse';

// Parse initialization
// see vite.config.js for parse aliasing
const PARSE_APPLICATION_ID = "Kl597XIwONvLruqWcxjxX7TMw4Td7voqpdgPGBHf";
const PARSE_JAVASCRIPT_KEY = "trqaoWOAvLsOb6Cx9VgLsHHGYznM4lRNiCqEysia";
const PARSE_SERVER_URL = "https://parseapi.back4app.com/";
 
Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
Parse.serverURL = PARSE_SERVER_URL;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

export default Parse;