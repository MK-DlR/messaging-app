// frontend/src/helpers/imageCheck.jsx

// imports
import React from "react";

// check if file string is an image/gif
function imageCheck(fileString) {
  if (
    fileString.startsWith("http") &&
    [".jpeg", ".jpg", ".png", ".gif", ".webp"].some((ext) =>
      fileString?.endsWith(ext),
    )
  ) {
    return <img src={fileString} className="message-image" />;
  } else {
    return null;
  }
}

export default imageCheck;
