// frontend/src/main.jsx

// imports
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import ApiProvider from './components/ApiProvider.jsx';

import "./css/auth.css";
import "./css/base.css";
import "./css/buttons.css";
import "./css/channels-users.css";
import "./css/forms.css";
import "./css/header.css";
import "./css/icons.css";
import "./css/layout.css";
import "./css/messages.css";
import "./css/misc.css";
import "./css/profile.css";
import "./css/spinner.css"; 
import "./css/textbox.css";
import "./css/theme.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApiProvider>
      <App />
    </ApiProvider>
  </StrictMode>,
)
