/**
 * @param {string} url - only name is mandatory
 * @param {object} [options]
 * @param {string} [options.method] - GET or POST
 * @param {null|Document|Blob|BufferSource|FormData|URLSearchParams|ReadableStream|USVString} [options.body] - body for POST
 * @returns {Promise<Document>} A Promise fulfilled with a Document if succeeded.
 */
export default function fetchDom (url, options) {
  url = encodeURI(url.replace('\n', ' '))

  const method = (options && options.method && options.method.toLowerCase() === 'post') ? 'POST' : 'GET'
  const body = options && options.body

  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest()
    xhr.onload = () => {
      if (!xhr.responseXML) {
        return reject(new Error('Empty body, Response code ' + xhr.status))
      }
      resolve(xhr)
    }
    xhr.onerror = reject
    xhr.open(method, url)
    xhr.responseType = 'document'
    return body ? xhr.send(body) : xhr.send()
  })
}
