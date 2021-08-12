# vite-plugin-svgprep

> Preps and embeds SVGs into HTML with Vite.

## Installation & Usage

First:

```shell
npm i --save-dev vite-plugin-svgprep
```

Then, in `vite.config.js`, something like this:

```javascript
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import svgprep from "vite-plugin-svgprep";

export default defineConfig({
  plugins: [
    solid(),
    multipage({
      // This is an optional object, defaults as follows:
      scan: "", // Directory to scan and embed PNGs from.
    }),
  ],

  build: {
    target: "esnext",
    polyfillDynamicImport: false,
  },
});
```

You may also set the `scan` path on a per-page basis. In each HTML page
being built, you may add a custom `<svgprep>` element:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Some page</title>
    <link rel="icon" href="/assets/favicon.ico" />
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#FFFFFF" />
  </head>
  <body>
    <svgprep scan="/assets/svg"></svgprep>
    <noscript>you need to enable javascript to run this app</noscript>
    <div id="root"></div>
    <script src="./index.jsx" type="module"></script>
  </body>
</html>
```

The `scan` attribute in `<svgprep>` accepts a path. This custom element is
removed before new HTML is generated.

## What does it do?

This plugin extends Vite to handle embedding prepped SVG files into each
HTML page built. This allows user interface icons to be preloaded.

Each SVG file loaded has its outermost SVG element parsed, any `height` and
`width` attributes removed and the `stroke` and `fill` attributes set to
`inherit`. This is usually good enough to prepare the SVG for being scaled and
colored.

Finally the SVGs are appended into a hidden SVG element that's appended into
`<body>`. They are accessible by `#svg-${filename}` IDs.

Assuming an SVG named `hello.svg` has been embedded, it may be used like so:

```javascript
function Svg(props) {
  return () => (
    <svg
      {...props}
      class="h-8 w-8 fill-current stroke-current inline-block text-center bg-cover"
    >
      <use xlink:href={`#svg-${props.alt}`}></use>
    </svg>
  );
}

function HelloButton() {
  return () => (
    <Button onClick={sayHello} class="text-white">
      <Svg alt="hello" />
    </Button>
  );
}
```

Using `<svg>` elements directly is the easiest way to style
dimensions, colors and such. By using `fill: currentColor` and
`stroke: currentColor` on an `<svg>` it will obtain its color from its
parent elmenet. Consider the `<Button>` above. When it sets the `text-white`
utility class, it will also change the `<svg>` contained within.

## License

0BSD
