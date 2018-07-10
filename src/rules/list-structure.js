import formatMessage from "../format-message"

/**
 * Handles:
 * * list item
 * - list item
 * 1. list item
 * 1) list item
 */
const listLikeRegex = /^\s*(?:[*|-])|(?:(\d+)[\)|\.])\s+/

const isTextList = elem =>
  elem.tagName === "P" && listLikeRegex.test(elem.textContent)

const cleanListItem = elem => {
  if (elem.nodeType === Node.TEXT_NODE) {
    elem.textContent = elem.textContent.replace(listLikeRegex, "")
    return true
  }

  for (let childElement of elem.childNodes) {
    let found = cleanListItem(childElement)
    if (found) return true
  }

  return false
}

const moveContents = (from, to) => {
  while (from.firstChild) to.appendChild(from.firstChild)
}

export default {
  test: function(elem) {
    const isList = isTextList(elem)
    const isFirst = elem.previousElementSibling
      ? !isTextList(elem.previousElementSibling)
      : true
    return !(isList && isFirst)
  },

  data: elem => {
    const match = elem.textContent.match(listLikeRegex)
    return {
      orderedStart: match[1] ? Number(match[1]) : null,
      formatAsList: false
    }
  },

  form: () => [
    {
      label: formatMessage("Format as a list"),
      checkbox: true,
      dataKey: "formatAsList"
    }
  ],

  update: function(elem, data) {
    const rootElem = elem.parentNode

    if (data.formatAsList) {
      const listContainer = document.createElement(
        data.orderedStart ? "ol" : "ul"
      )

      if (data.orderedStart && data.orderedStart !== 1) {
        listContainer.setAttribute("start", data.orderedStart)
      }

      let cursor = elem
      while (cursor) {
        if (!isTextList(cursor)) break

        const li = document.createElement("li")
        listContainer.appendChild(li)

        moveContents(cursor, li)

        let nextSibling = cursor.nextElementSibling
        // Remove cleared siblings
        // Skip if elem because elem is replaced on completion.
        if (cursor !== elem) cursor.parentNode.removeChild(cursor)

        cursor = nextSibling

        cleanListItem(li)
      }

      rootElem.replaceChild(listContainer, elem)
      return listContainer
    }

    return elem
  },

  rootNode: function(elem) {
    return elem.parentNode
  },

  message: () => formatMessage("Lists should be formatted as lists."),

  why: () =>
    formatMessage(
      "When markup is used that visually formats items as a list but does not indicate the list relationship, users may have difficulty in navigating the information."
    ),

  link: "https://www.w3.org/TR/2016/NOTE-WCAG20-TECHS-20161007/H48"
}
