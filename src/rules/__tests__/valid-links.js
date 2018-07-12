import fetch from "node-fetch"
import rule from "../valid-links"

let body, a

beforeEach(() => {
  body = document.createElement("body")
  a = document.createElement("a")
  body.appendChild(a)
  a.textContent = "Link Text"
  window.fetch = () => Promise.resolve({ ok: true })
})

describe("test", () => {
  test("returns true if not A element", async () => {
    expect(await rule.test(document.createElement("div"))).toBe(true)
  })

  test("returns true for valid links", async () => {
    window.fetch = () => Promise.resolve({ ok: true })
    a.setAttribute("href", "https://www.instructure.com/")
    expect(await rule.test(a)).toBe(true)
  })

  test("returns false for invalid links", async () => {
    window.fetch = () => Promise.resolve({ ok: false })
    a.setAttribute("href", "http://something weird")
    expect(await rule.test(a)).toBe(false)
    a.setAttribute("href", "plaintext")
    expect(await rule.test(a)).toBe(false)
    window.fetch = () => Promise.reject(new Error())
    a.setAttribute("href", "http://something-valid-but-not-reachable/123")
    expect(await rule.test(a)).toBe(false)
  })
})

describe("data", () => {
  test("returns the proper object", () => {
    expect(rule.data(a)).toMatchSnapshot()
  })
})

describe("form", () => {
  test("returns the proper object", () => {
    expect(rule.form(a)).toMatchSnapshot()
  })
})

describe("update", () => {
  test("returns same element", () => {
    expect(rule.update(a, {})).toBe(a)
  })
  test("does not change href if href does not change", () => {
    const href = "http://example.com"
    a.setAttribute("href", href)
    expect(rule.update(a, { href })).toBe(a)
  })
  test("changes href if it has been changed", () => {
    const href = "bad"
    a.setAttribute("href", href)
    rule.update(a, { href: "https://www.instructure.com/" })
    expect(a.getAttribute("href")).toBe("https://www.instructure.com/")
  })
  test("does not change href if href does not change", () => {
    const href = "http://example.com"
    a.setAttribute("href", href)
    expect(
      rule.update(a, { ignore: true }).getAttribute("data-ignore-a11y-check")
    ).toBe("true")
  })
})

describe("rootNode", () => {
  test("returns the parentNode of an element", () => {
    expect(rule.rootNode(a).tagName).toBe("BODY")
  })
})

describe("message", () => {
  test("returns the proper message", () => {
    expect(rule.message()).toMatchSnapshot()
  })
})

describe("why", () => {
  test("returns the proper why message", () => {
    expect(rule.why()).toMatchSnapshot()
  })
})
