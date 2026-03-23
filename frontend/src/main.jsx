// frontend/src/main.jsx

// imports
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import "./styles/theme.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/header.css";
import "./styles/channels.css";
import "./styles/users.css";
import "./styles/profile.css";
import "./styles/messages.css";
import "./styles/textbox.css";
import "./styles/forms.css";
import "./styles/auth.css";
import "./styles/icons.css";
import "./styles/buttons.css";
import "./styles/misc.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
