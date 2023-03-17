# TinyMCE Accessibility Checker Plugin _(tinymce-a11y-checker)_

## Deprecated

This package had been merged into `@instructure/canvas-rce`. This repository
is no longer under development or being maintained.

The corresponding npm package has been deprecated.

If you use the Rich Content Editor from Canvas, the a11y checker is now
built in.

---

> An accessibility checker plugin for TinyMCE.

[![Build Status](https://travis-ci.com/instructure/tinymce-a11y-checker.svg?branch=master)](https://travis-ci.com/instructure/tinymce-a11y-checker)
[![npm](https://img.shields.io/npm/v/tinymce-a11y-checker.svg)](https://www.npmjs.com/package/tinymce-a11y-checker)

## Install

You will need to have an instance of TinyMCE setup prior to using this plugin.

```bash
npm install tinymce-a11y-checker --save

# or

yarn add tinymce-a11y-checker
```

## Usage

```js
import tinymce from "tinymce"
import "tinymce-a11y-checker"

tinymce.init({
  selector: "#editor",
  plugins: ["a11y_checker"],
  toolbar: "check_a11y | bold italic ...",
})
```

## Contribute

See [the contributing file](CONTRIBUTING.md)!

PRs accepted.

[MIT](../LICENSE)
