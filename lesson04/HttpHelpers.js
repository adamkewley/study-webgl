function fetchImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = (err) => {
      reject(err);
    };
    img.src = src;
  });
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open("GET", url);

    req.onload = () => {
      if (200 <= req.status && req.status < 300) {
        resolve(req.response);
      } else {
        reject(req.response);
      }
    };

    req.onerror = () => {
      reject(req.response);
    };

    req.send();
  });
}
