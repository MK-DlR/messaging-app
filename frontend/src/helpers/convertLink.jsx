// frontend/src/helpers/convertLink.jsx

// check if text string is a url
function convertLink(text) {
  // regex to match URLs (http(s):// or www.)
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

  // split text by URLs, keeping the URLs
  const parts = text.split(urlRegex);

  const matches = text.match(urlRegex);

  return parts.map((part, index) => {
    // if this part is a URL match
    if (matches && matches.includes(part)) {
      let href = part;

      // add protocol if missing (for www links)
      if (part.startsWith("www.")) {
        href = `https://${part}`;
      }

      return (
        <a key={index} href={href} target="_blank" rel="noopener noreferrer">
          {part}
        </a>
      );
    }

    // otherwise it's just plain text
    return part;
  });
}

export default convertLink;
