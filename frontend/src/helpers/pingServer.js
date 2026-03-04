// frontend/src/helpers/pingServer.js

import apiFetch from "./apiFetch";

// call apiFetch on ping endpoint
async function pingServer() {
  await apiFetch(`${import.meta.env.VITE_API_URL}/users/ping`, {
    method: "POST",
  });
}

export default pingServer;
