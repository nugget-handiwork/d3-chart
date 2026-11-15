# D3 chart artifact

A single static D3 chart drawn into one SVG. No build step: the files you
write are served exactly as you write them.

## Start from a recipe

`recipes/` holds one complete, working chart per chart type. Copy the
closest one over `chart.js` and edit it, rather than writing a chart from
nothing:

```
cp artifact/recipes/bar.js artifact/chart.js
```

One `shell` call, and far cheaper than reading a recipe and writing it
back out through `writeFile`.

Every recipe already carries the house style — palette, gridlines, tick
formats, axis titles, legend, tooltip — so editing one is mostly renaming
its fields to your columns and fixing the labels and number formats. The
field names in a recipe (`label`, `value`, `series`, `year`) are
placeholders for whatever your data actually holds, and so is the
`DATA_FILE.json` it loads — replace it with the real file name from your
launch prompt.

| Recipe | Chart | Rows |
| --- | --- | --- |
| `bar.js` | Vertical bars, one series | `{ label, value }` |
| `horizontal_bar.js` | Ranked bars with value labels and a source note | `{ label, value }` |
| `grouped_bar.js` | Bars side by side within each group | `{ label, series, value }` |
| `stacked_bar.js` | Parts of a whole, hashed palette | `{ label, series, value }` |
| `line.js` | One line with open dots | `{ year, value }` |
| `multi_line.js` | Several lines, one colour each | `{ year, series, value }` |
| `area.js` | One line over a hashed fill | `{ year, value }` |
| `scatter.js` | Points on a full grid | `{ spend, revenue, series, label }` |

Leave `recipes/` in place when you are done. It is never loaded by
`index.html` and never reaches the reader, and a later revision that
changes the chart type starts from this repo rather than the template.

## What you edit

- `chart.js` — the chart. This is the file you almost always write.
- `style.css` — extra styling, when a class is easier than a per-element
  attribute. Do not change the palette or the token values.

Do not edit `index.html`. It loads d3, the stylesheets, `chart.js`, and
the hatch pattern definitions; editing it is how an artifact stops
rendering.

## The contract

`chart.js` is an ES module. It starts with:

```js
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm'

const container = document.getElementById('chart')
const data = await artifactData('trees_by_species.json')
```

`container` is the `<div id="chart">` to draw into.

Keep the pinned d3 import at the top of the file. Do not vendor D3 or add
a `<script>` tag; many artifacts share the browser-cached modules from
the same origin.

## Where your data comes from

Two sources, both provided by the platform. Neither needs importing, and
neither should be replaced with your own `fetch`.

`await artifactData(fileName)` reads a file committed beside your code in
`data/`. Your launch prompt names each staged file, describes it, and
shows its columns and first rows. A `.json` file arrives parsed — an
array of row objects for tabular data — so treat the shape as given and
do not re-parse it. This is where a chart's data almost always comes
from: the result was computed and checked before the build began, and
committing it means the chart shows the same numbers a year from now.

`await artifactQuery(sql)` runs SQL against the catalog at the moment someone
views the chart, returning an array of row objects. It works only when
your launch prompt names datasets the artifact may query, and only for
those datasets — any other is refused. Use it when the chart genuinely
has to be current rather than fixed. Aggregate in SQL: select the shape
you draw rather than pulling raw rows into the browser.

A chart may use both, e.g. a committed historical series with a live
current value drawn on top. When you query, render something honest while
the query is in flight and show the error if it fails — a chart that
silently draws nothing is worse than one that says why.

## Type

The platform serves the typefaces and sets the body font, so a chart
inherits it without asking. Where a rule needs to name a family — tick
labels, printed values, source notes — use `var(--family-mono)`.
`var(--family-sans)` is the default and rarely needs stating.

## Colour

Every colour is a CSS custom property defined in the `:root` block at the
top of `style.css`, and each one carries both its light and its dark value
in a `light-dark()` pair, so a chart that uses the tokens is legible in
both themes and a chart with hard-coded hexes is not.

Pass the token itself, never its value. The embedding app can switch
theme while the chart is on screen, and a `var()` reference re-resolves
where a colour read into JavaScript would stay whatever it was when the
chart was drawn. Name them the way the recipes do:

```js
const color = (name, step) => `var(--${name}-${step})`
```

So: never `getComputedStyle(...).getPropertyValue('--categorical-1')`, and
never a `prefers-color-scheme` rule — the theme is the app's to decide,
not the operating system's.

- `categorical`, steps 1–6 — unordered categories: series in a
  multi-line chart, groups in a grouped bar chart, classes in a scatter.
  Beyond six categories, group the tail into "Other" rather than
  inventing a seventh colour.
- `sequential`, steps 1–6 — one ordered measure, dark to light. Step 1 is
  the brand orange and is also the right fill for a single-series chart.
- `secondary`, steps 1–6 — the same ramp in blue, for a second ordered
  measure beside a sequential one.
- `diverging`, steps 1–6 — orange through pale to blue, for a measure
  with a meaningful midpoint. Steps 2–5 are hatched, like `hashed`.
- `hashed`, steps 1–3 — up to three ordered parts of one whole in a
  single hue, separated by hatching instead of by colour.

The `hashed` and inner `diverging` tokens are flat tints, for a legend
swatch or a small block. The hatching itself comes from SVG patterns
defined in `index.html` and used as `fill="url(#hashed-2)"`,
`fill="url(#diverging-3)"`, and so on — `hashed` steps 2–3 and
`diverging` steps 2–5. The ends of each ramp are plain colours and need
no pattern.

A mark takes the pattern and its legend swatch takes the token: each
pattern is built so that its stroke and ground average out to exactly the
flat token of the same name, which is what lets the two stand for each
other. Fill a mark with a flat inner `diverging` token only when the
marks are too small for hatching to read at all.

`--ink`, `--muted`, `--grid`, and `--axis` cover text and rules.
`--surface` is the colour of the page, for filling a shape that has to
read as the page — the ground of a hatch pattern, a halo behind a label.
The page itself is never painted: the app supplies the ground the chart
sits on.

## Classes

`style.css` styles these; the recipes apply them for you.

- `.axis` on an axis `<g>` — mono tick labels in `--muted`. Add
  `.categories` for uppercase category labels.
- `.grid` on a `<g>` holding a `tickFormat('')` axis — gridlines only.
- `.axis-title` on a `<text>` — sans, `--ink`.
- `.value` on a `<text>` — mono, `--ink`, for a value printed beside a
  mark.
- `.key` on a legend `<g>`.
- `.note` on a `<div>` appended after the SVG — mono uppercase source and
  methodology lines.
- `.tooltip` on a `<div>` appended to `container`.
- `.mark` on a mark — a halo on hover.

## Rules

- Draw into `container`, never into `document.body`.
- Size the SVG with `viewBox` and let CSS scale it. Never use viewport
  units (`vh`, `vw`) — the artifact is rendered in an iframe whose height
  is derived from its content, so `vh` measures the wrong box.
- Draw statically. No entry animations and no transitions on first
  render: a preview reload re-runs this file from scratch, so an entry
  animation restarts on every keystroke. This does not apply to hover.
- No `rx`/`ry` on a `<rect>` mark, no borders or background colours
  around the chart, and no chart title inside the SVG: the title is the
  artifact's title and is rendered outside the frame.
- Gridlines run across the value axis only, except in a scatter, which
  gets both. Give the value axis `.ticks(6)` or so and pass the same
  count to the grid, or the rules and the labels will not line up.
- Format numbers and dates with `d3.format` / `d3.timeFormat`. A year is
  a number, so a linear axis over years needs `.tickFormat(d3.format('d'))`
  to stop d3 writing `2,012`.

## Fitting the frame

The `viewBox` is the whole drawing surface, so anything outside it is cut
off rather than overflowing into the page. Size the SVG for what the
chart actually carries: widen `margin.right` for a legend down the
right-hand side, `margin.bottom` for rotated tick labels or an axis
title, and `margin.left` for long category names. The margins in each
recipe fit that recipe's example data and nothing else.
