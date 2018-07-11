import formatMessage from "../format-message"

const isValidURL =
  // typeof URL !== 'function'
  url => {
    try {
      // the URL constructor is more accurate than regex
      // but not supported in IE and some versions of jsdom.
      new URL(url)
      return true
    } catch (_) {
      return false
    }
  }
// : url =>
//     /((http|ftp|https|mailto):\/\/)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(
//       url
//     )

export default {
  test: function(elem) {
    if (elem.tagName !== "A") return true
    return isValidURL(elem.getAttribute("href"))
  },

  data: elem => {
    return {
      href: elem.getAttribute("href")
    }
  },

  form: () => [
    {
      label: formatMessage("Change the URL for this link"),
      dataKey: "href"
    }
  ],

  update: function(elem, data) {
    const rootElem = elem.parentNode

    if (data.href !== elem.getAttribute("href")) {
      elem.setAttribute("href", data.href)
    }

    return elem
  },

  rootNode: function(elem) {
    return elem.parentNode
  },

  message: () => formatMessage("Links should be valid."),

  why: () =>
    formatMessage(
      "Invalid links become broken links which are confusing to all users."
    ),

  link: "https://www.w3.org/TR/2016/NOTE-WCAG20-TECHS-20161007/H48"
}
