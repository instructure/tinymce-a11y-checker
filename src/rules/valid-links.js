import formatMessage from "../format-message"

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

const debouncedFetch = (() => {
  let timeout = null

  return (...args) =>
    new Promise((resolve, reject) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        fetch(...args)
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

      // If url is valid, do a HEAD request.
      debouncedFetch(href, { method: "HEAD" })
        .then(res => resolve(res.ok))
        .catch(() => resolve(false))

      // This will always work in jest because there
      // node does not check cross-origin requests,
      // but this will cause issues in the browser.
      //
      // In the browser, the request will still fire
      // but will will fail for all links that are
      // not same-origin.
      //
      // For cross-origin urls, the user will be
      // prompted to check the link, or check ignore
      // if they so choose.
      //
      // Workarounds:
      //  * Create a service to proxy the request
      //  * Do something crazy with web workers
      //  * and importScripts (plausible).
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
