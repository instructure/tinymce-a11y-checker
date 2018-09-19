import React from "react"
import ReactDOM from "react-dom"
import Checker from "./components/checker"
import formatMessage from "./format-message"

let instance
const pendingInstanceCallbacks = []

tinymce.create("tinymce.plugins.AccessibilityChecker", {
  init: function(ed) {
    const container = document.createElement("div")
    container.className = "tinymce-a11y-checker-container"
    document.body.appendChild(container)

    ReactDOM.render(
      <Checker getBody={ed.getBody.bind(ed)} editor={ed} />,
      container,
      function() {
        // this is a workaround for react 16 since ReactDOM.render is not
        // guaranteed to return the instance synchronously (especially if called
        // within another component's lifecycle method eg: componentDidMount). see:
        // https://github.com/facebook/react/issues/10309#issuecomment-318434635
        instance = this
        pendingInstanceCallbacks.forEach(cb => cb(instance))
      }
    )

    ed.addCommand("openAccessibilityChecker", (...args) =>
      instance.check(...args)
    )

    ed.addButton("check_a11y", {
      title: formatMessage("Check Accessibility"),
      cmd: "openAccessibilityChecker",
      icon: "a11y"
    })
  },

  getInfo: function() {
    return {
      longname: "Instructure Accessibility Checker",
      author: "Brent Burgoyne",
      authorurl: "https://github.com/instructure",
      infourl: "https://github.com/instructure/tinymce-a11y",
      version: "1.0"
    }
  }
})

// Register plugin
tinymce.PluginManager.add("a11y_checker", tinymce.plugins.AccessibilityChecker)

export function getInstance(cb) {
  if (instance != null) {
    return cb(instance)
  }
  pendingInstanceCallbacks.push(cb)
}

export function setLocale(locale) {
  const options = formatMessage.setup()
  options.locale = locale
  formatMessage.setup(options)
}
