import formatMessage from "../format-message"

export default {
  id: "img-alt",
  test: elem => {
    if (elem.tagName !== "IMG") {
      return true
    }

    const alt = elem.hasAttribute("alt") ? elem.getAttribute("alt") : null
    return alt !== null
  },

  data: elem => {
    const alt = elem.hasAttribute("alt") ? elem.getAttribute("alt") : null
    const decorative = alt !== null && alt.replace(/\s/g, "") === ""
    return {
      alt: alt || "",
      decorative: decorative
    }
  },

  form: () => [
    {
      label: formatMessage("Add alt text for the image"),
      dataKey: "alt",
      disabledIf: data => data.decorative
    },
    {
      label: formatMessage("Decorative image"),
      dataKey: "decorative",
      checkbox: true
    }
  ],

  update: (elem, data) => {
    if (data.decorative) {
      elem.setAttribute("alt", "")
      elem.setAttribute("role", "presentation")
    } else {
      elem.setAttribute("alt", data.alt)
      elem.removeAttribute("role")
    }
    return elem
  },

  message: () =>
    formatMessage(
      "Images should include an alt attribute describing the image content."
    ),

  why: () =>
    formatMessage(
      "Screen readers cannot determine what is displayed in an image without alternative text, which describes the content and meaning of the image."
    ),

  link: "https://www.w3.org/TR/WCAG20-TECHS/H37.html",
  linkText: () => formatMessage("Learn more about using alt text for images")
}
