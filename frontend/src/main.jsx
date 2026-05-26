// frontend/src/main.jsx

// imports
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import ApiProvider from './components/ApiProvider.jsx';

import "./styles/auth.css";
import "./styles/base.css";
import "./styles/buttons.css";
import "./styles/channels-users.css";
import "./styles/forms.css";
import "./styles/header.css";
import "./styles/icons.css";
import "./styles/layout.css";
import "./styles/messages.css";
import "./styles/misc.css";
import "./styles/profile.css";
import "./styles/spinner.css"; 
import "./styles/textbox.css";
import "./styles/theme.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApiProvider>
      <App />
    </ApiProvider>
  </StrictMode>,
)
