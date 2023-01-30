export const INDICATOR_STYLE = "outline:2px solid #2D3B45;outline-offset:2px;"
export const A11Y_CHECKER_STYLE_ELEM_ID = "a11y-checker-style"

export function clearIndicators(doc) {
  const checker_style = doc.getElementById(A11Y_CHECKER_STYLE_ELEM_ID)
  if (checker_style) {
    checker_style.textContent = ""
  }
}

export function findDepthSelector(doc, elem) {
  const depths = []
  let target = elem
  while (target && parent && target !== doc.body) {
    let parent = target.parentElement
    const depth = findChildDepth(parent, target)
    depths.unshift(`>:nth-child(${depth})`)
    target = parent
    parent = target?.parentElement
  }

  return `body${depths.join("")}`
}

export function findChildDepth(parent, target) {
  if (!(parent && target)) return 0
  const children = parent.children
  const depth = Array.from(children).findIndex((child) => child === target)
  return depth + 1
}

export function ensureA11yCheckerStyleElement(doc) {
  let style_elem = doc.getElementById(A11Y_CHECKER_STYLE_ELEM_ID)
  if (!style_elem) {
    style_elem = doc.createElement("style")
    style_elem.id = A11Y_CHECKER_STYLE_ELEM_ID
    doc.head.appendChild(style_elem)
  }
  return style_elem
}

export default function indicate(elem) {
  const doc = elem.ownerDocument
  const style_elem = ensureA11yCheckerStyleElement(doc)
  const selector = findDepthSelector(doc, elem)
  style_elem.textContent = `${selector}{${INDICATOR_STYLE}}`
}
