// frontend/src/helpers/isOnline.js

// conditionally show if a user is online or offline
function isOnline(lastSeen) {
  let now = Date.now();
  let lastOnline = new Date(lastSeen).getTime();
  let difference = now - lastOnline;

  if (difference <= 300000) {
    // less than 5 minutes
    return true;
  } else {
    return false;
  }
}

export default isOnline;
