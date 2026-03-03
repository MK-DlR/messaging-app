// frontend/src/helpers/formatDate.js

// format date to M/D/YYYY, H:MM:SS AM/PM
function formatDate(dateString) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const date = new Date(dateString);

  // check if date is today, yesterday, or other
  if (date.toDateString() === today.toDateString()) {
    // date is today, display "today"
    return `Today, ${date.toLocaleTimeString()}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    // date is yesterday, display "yesterday"
    return `Yesterday, ${date.toLocaleTimeString()}`;
  } else {
    // date is other, display M/D/YYYY
    return date.toLocaleString();
  }
}

export default formatDate;
