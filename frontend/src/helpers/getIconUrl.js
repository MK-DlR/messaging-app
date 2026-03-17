// frontend/src/helpers/getIconUrl.js

function getIconUrl(icon) {
  return icon?.startsWith("http") ? icon : `/icons/${icon}`;
}

export default getIconUrl;
