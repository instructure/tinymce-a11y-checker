import offset from "bloody-offset"

const BORDER = 1
const PADDING = 3
const THROTTLE = 10

// return the rect that is the size of the target's bounding rect
// but offset by tinymce's editor iframe's offset so we can
// locate the target relative to the page at large
export function indicatorRegion(
  editorFrame,
  target,
  offsetFn = offset,
  boundingRectOverride
) {
  const outerShape = offsetFn(editorFrame)
  const b = boundingRectOverride || target.getBoundingClientRect()
  const innerShape = {
    top: b.top,
    left: b.left,
    width: b.right - b.left,
    height: b.bottom - b.top,
  }

  return {
    width: innerShape.width,
    height: innerShape.height,
    left: outerShape.left + innerShape.left,
    top: outerShape.top + innerShape.top,
  }
}

function indicatorContainer() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.body
  )
}

export function clearIndicators(parent) {
  const container = parent || indicatorContainer()
  Array.from(
    container.querySelectorAll(".a11y-checker-selection-indicator")
  ).forEach((existingElem) => {
    existingElem.parentNode.removeChild(existingElem)
  })
}

export default function indicate(editor, elem, padding = PADDING) {
  clearIndicators()

  const padPlusBorder = padding + BORDER

  const editorFrame = editor.getContainer().querySelector("iframe")

  const el = document.createElement("div")
  el.className = "a11y-checker-selection-indicator"

  const region = indicatorRegion(editorFrame, elem)

  // The z-index below is set to be one below the Instructure UI tray
  // that the a11y checker uses.  It may need to be updated in the future.
  el.setAttribute(
    "style",
    `
    border: ${BORDER}px solid #000;
    background-color: #008EE2;
    position: absolute;
    display: block;
    border-radius: 5px;
    z-index: 9998;
    box-sizing: content-box;
    padding: ${padding}px;
    left: ${region.left - padPlusBorder}px;
    top: ${region.top - padPlusBorder}px;
    width: ${region.width}px;
    height: ${region.height}px;
    opacity: 0.4;
  `
  )
  indicatorContainer().appendChild(el)

  let lastAdjust = 0
  const adjust = (timestamp) => {
    if (timestamp - lastAdjust > THROTTLE) {
      lastAdjust = timestamp

      if (el.parentElement === null) {
        return
      }

      // boundingRect is relative to tinymce's iframe
      const boundingRect = elem.getBoundingClientRect()
      // region shifts boundingRect to be relative to the page
      const region = indicatorRegion(editorFrame, elem, offset, boundingRect)
      // editorFrameOffest is tinymce's iframe's offset in the page
      const editorFrameOffset = offset(editorFrame)
      // where is the body?
      const bodyRect = document.body.getBoundingClientRect()
      // if the page is scrolled enough the tinymce header is position:fixed
      // at the top of the page. take that into account
      const stickyOffset = editor.container.classList.contains(
        "tox-tinymce--toolbar-sticky-on"
      )
        ? editor.container.querySelector(".tox-editor-header").offsetHeight
        : 0

      el.style.left = `${region.left - padPlusBorder}px`
      el.style.top = `${region.top - padPlusBorder}px`
      el.style.display = "block"
      if (
        stickyOffset > 0 &&
        region.top + bodyRect.top - padPlusBorder < stickyOffset
      ) {
        // the page is scrolled so the indicator should be behind tinymce's sticky header
        const newHeight =
          region.height - (stickyOffset - (region.top + bodyRect.top))
        if (newHeight < 0) {
          el.style.display = "none"
        }
        el.style.top = `${stickyOffset - bodyRect.top}px`
        el.style.height = `${newHeight}px`
      } else if (boundingRect.top - padPlusBorder < 0) {
        // tinymce's iframe content is scrolled so the indicator is above the visible area
        const newHeight = region.height + boundingRect.top
        if (newHeight < 0) {
          el.style.display = "none"
        }
        el.style.top = `${editorFrameOffset.top}px`
        el.style.height = `${newHeight}px`
      } else if (
        boundingRect.bottom + padPlusBorder >
        editorFrameOffset.height
      ) {
        // the indicator is below the visible area in tinymce's content area
        const newHeight =
          region.height - (boundingRect.bottom - editorFrameOffset.height)
        if (newHeight < 0) {
          el.style.display = "none"
        }
        el.style.height = `${newHeight}px`
      } else {
        // no special case
        el.style.height = `${region.height}px`
      }
    }
    window.requestAnimationFrame(adjust)
  }

  window.requestAnimationFrame(adjust)
}
