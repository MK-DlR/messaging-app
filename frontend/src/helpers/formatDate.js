// frontend/src/helpers/formatDate.js

// format date to M/D/YYYY H:MM AM/PM
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

export default formatDate;
