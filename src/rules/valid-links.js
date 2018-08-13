import formatMessage from "../format-message"

/**
 * How does this Link Checker work?
 *
 * This checker takes inspiration from JSONP,
 * where cross domain requests are still valid
 * even if they load from a 3rd party site
 *
 * 1. An iframe sandbox is created from a data url.
 * 2. This iframe contains a script tag will create
 *    a web worker.
 * 3. The top frame sends the iframe the url in
 *    question, and the frame creates the worker
 *    with the url embeded in a `loadScripts` call.
 * 4. If the script loads, it will fail silently
 *    - If silent, the worker responds true (good)
 *    - else the worker responds false (bad link)
 *    - on timeout, the worker responds false
 * 5. The top frame waits for the response and
 *    removes the iframe.
 *
 * Note, as of writing, this does not work on
 * non-chromium browsers. In that case, all links
 * are flagged as bad with the message:
 *   "This link could not be verified."
 *
 * It would also appear that jsdom (used for tests)
 * cannot handle this as well.
 */

const isValidURL = url => {
  try {
    // the URL constructor is more accurate than regex
    // but not supported in IE.
    new URL(url)
    return true
  } catch (_) {
    // If this does throw, either:
    // 1. the url is invalid
    // 2. the URL constructor is not there.
    // The user will be prompted to check the link manually.
    return false
  }
}

const send = (type, payload, frame) =>
  new Promise((resolve, reject) => {
    const id = Math.random() + Date.now()
    const message = JSON.stringify({ type, payload, id })

    const handler = event => {
      let obj = event.data
      try {
        if (typeof obj === "string") obj = JSON.parse(event.data)
      } catch (e) {
        return
      }

      const { error, response, id: returnedId } = obj
      if (returnedId !== id) return
      window.removeEventListener("message", handler)
      if (error) return reject(error.href ? error : new Error(error))
      resolve(response)
    }

    const win = frame ? frame.contentWindow : window.top
    window.addEventListener("message", handler)
    win.postMessage(message, "*")
  })

const on = (type, fn) => {
  window.addEventListener("message", event => {
    let obj = event.data
    try {
      if (typeof obj === "string") obj = JSON.parse(event.data)
    } catch (e) {
      return
    }

    const reply = o => {
      event.source.postMessage(
        JSON.stringify(Object.assign(o, { id: obj.id })),
        "*"
      )
    }

    if (obj.type === type) {
      Promise.resolve(fn(obj.payload))
        .then(response => reply({ response }))
        .catch(error => {
          console.error(error)
          reply({
            error: error.stack || error.message
          })
        })
      return true
    }
  })
}

const checkUrl = src =>
  new Promise(resolve => {
    const workerBody =
      "data:application/javascript," +
      encodeURIComponent(`
function reply(ok){
  self.postMessage(JSON.stringify({ok: ok}));
}

try {
  importScripts("${src}");
  reply(true);
} catch(e) {
  reply(!(e instanceof DOMException));
}
`)

    const worker = new Worker(workerBody)

    const timeout = setTimeout(() => {
      resolve(false)
      worker.terminate()
    }, 3000)

    worker.onmessage = e => {
      const { ok } = JSON.parse(e.data)
      resolve(ok)
      worker.terminate()
      clearTimeout(timeout)
    }
  })

const checkUrlWithIframe = src =>
  new Promise(r => {
    const body = `data:text/html,${encodeURIComponent(
      `<script>
var on = ${on.toString()};
var checkUrl = ${checkUrl.toString()};
on('checkUrl', checkUrl);
</script>`
    )}`

    const iframe = document.createElement("iframe")

    iframe.setAttribute("sandbox", "allow-scripts")
    iframe.setAttribute("hidden", "true")
    iframe.setAttribute("src", body)
    document.body.appendChild(iframe)

    iframe.onload = () => {
      send("checkUrl", src, iframe).then(result => {
        r(result)
        document.body.removeChild(iframe)
      })
    }
  })

const debouncedFetch = (() => {
  let timeout = null

  return href =>
    new Promise((resolve, reject) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        checkUrlWithIframe(href)
          .then(resolve)
          .catch(reject)
      }, 500)
    })
})()

export default {
  test: function(elem) {
    return new Promise((resolve, reject) => {
      if (elem.tagName !== "A") return resolve(true)
      const href = elem.getAttribute("href")

      // If url is invalid
      if (!isValidURL(href)) return resolve(false)

      debouncedFetch(href).then(resolve)
    })
  },

  data: elem => {
    return {
      href: elem.getAttribute("href")
    }
  },

  form: () => [
    {
      label: formatMessage("Ensure this link is correct."),
      dataKey: "href",
      disabledIf: data => data.ignore
    },
    {
      label: formatMessage("Ignore this link in the future."),
      checkbox: true,
      dataKey: "ignore"
    }
  ],

  update: function(elem, data) {
    const rootElem = elem.parentNode

    if (data.ignore) {
      elem.setAttribute("data-ignore-a11y-check", "true")
    }

    if (data.href !== elem.getAttribute("href")) {
      elem.setAttribute("href", data.href)
    }

    return elem
  },

  rootNode: function(elem) {
    return elem.parentNode
  },

  // Note, these messages are poor and should be replaced with
  // better text.
  message: () => formatMessage("This link could not be verified."),

  why: () => formatMessage("Links should not be broken."),

  link: " --- fill in --- "
}
