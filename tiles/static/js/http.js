export function http(method, url, data) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.onreadystatechange = () => {
      if (req.readyState === XMLHttpRequest.DONE) {
        if (req.status >= 200 && req.status < 300) {
          if (req.responseText) {
            try {
              resolve(JSON.parse(req.responseText));
            } catch (err) {
              reject(`Failed to parse response: ${err.message}`, null);
            }
          } else {
            resolve(null);
          }
        } else {
          reject(`The response status code was ${req.status}`, null);
        }
      }
    };
    req.open(method, url, true);
    req.setRequestHeader('Content-Type', 'application/json');
    const elsCSRFToken = document.getElementsByName('csrfmiddlewaretoken');
    if (elsCSRFToken.length) {
      req.setRequestHeader('X-CSRFToken', elsCSRFToken[0].value);
    }
    req.send(JSON.stringify(data));
  });
}

/**
 * @see https://stackoverflow.com/a/42916772
 */
export function httpImageData(url) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      var reader = new window.FileReader();
      reader.addEventListener('load', () => {
        resolve(reader.result);
      });
      reader.readAsDataURL(xhr.response);
    };
    xhr.send();
  });
}
