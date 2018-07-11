import rule from "../valid-links"

let body, a

beforeEach(() => {
  body = document.createElement("body")
  a = document.createElement("a")
  body.appendChild(a)
  a.textContent = "Link Text"
})

describe("test", () => {
  test("returns true if not A element", () => {
    expect(rule.test(document.createElement("div"))).toBe(true)
  })

  test("returns true for valid links", () => {
    a.setAttribute("href", "http://example.com")
    expect(rule.test(a)).toBe(true)
    a.setAttribute("href", "mailto:user@example.com")
    expect(rule.test(a)).toBe(true)
  })

  test("returns false for invalid links", () => {
    a.setAttribute("href", "http://something weird")
    expect(rule.test(a)).toBe(false)
    a.setAttribute("href", "plaintext")
    expect(rule.test(a)).toBe(false)
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
    expect(rule.update(a, { href: "http://good.com" })).toBe(a)
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
