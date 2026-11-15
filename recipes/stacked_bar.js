import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm'

const container = document.getElementById('chart')
const data = await artifactData('DATA_FILE.json')

const color = (name, step) => `var(--${name}-${step})`

const groups = [...new Set(data.map((row) => row.label))]
const series = [...new Set(data.map((row) => row.series))]

// Three ordered parts of one whole read best in a single hue, where the
// hatch rather than a second colour separates them. Beyond three parts,
// or for unordered categories, use the categorical palette instead.
const fill = d3
  .scaleOrdinal()
  .domain(series)
  .range([color('hashed', 1), 'url(#hashed-2)', 'url(#hashed-3)'])

const wide = Array.from(
  d3.group(data, (row) => row.label),
  ([label, rows]) => ({
    label,
    ...Object.fromEntries(rows.map((row) => [row.series, row.value])),
  }),
)

const stacked = d3.stack().keys(series)(wide)

const width = 800
const height = 450
const margin = { top: 16, right: 120, bottom: 56, left: 72 }

const x = d3
  .scaleBand()
  .domain(groups)
  .range([margin.left, width - margin.right])
  .padding(0.35)

const y = d3
  .scaleLinear()
  .domain([0, d3.max(stacked[stacked.length - 1], (part) => part[1])])
  .nice()
  .range([height - margin.bottom, margin.top])

const svg = d3
  .select(container)
  .append('svg')
  .attr('viewBox', `0 0 ${width} ${height}`)

svg
  .append('g')
  .attr('class', 'grid')
  .attr('transform', `translate(${margin.left},0)`)
  .call(d3.axisLeft(y).ticks(6).tickSize(margin.left + margin.right - width).tickFormat(''))

svg
  .append('g')
  .attr('class', 'axis categories')
  .attr('transform', `translate(0,${height - margin.bottom})`)
  .call(d3.axisBottom(x).tickSize(0).tickPadding(10))

svg
  .append('g')
  .attr('class', 'axis')
  .attr('transform', `translate(${margin.left},0)`)
  .call(d3.axisLeft(y).ticks(6).tickSize(0).tickPadding(10).tickFormat(d3.format(',')))
  .call((group) => group.select('.domain').remove())

svg
  .append('text')
  .attr('class', 'axis-title')
  .attr('transform', 'rotate(-90)')
  .attr('x', -(margin.top + height - margin.bottom) / 2)
  .attr('y', 16)
  .attr('text-anchor', 'middle')
  .text('Percentage')

svg
  .append('g')
  .selectAll('g')
  .data(stacked)
  .join('g')
  .attr('fill', (layer) => fill(layer.key))
  .selectAll('rect')
  .data((layer) => layer)
  .join('rect')
  .attr('x', (part) => x(part.data.label))
  .attr('y', (part) => y(part[1]))
  .attr('width', x.bandwidth())
  .attr('height', (part) => y(part[0]) - y(part[1]))
  .append('title')
  .text((part) => d3.format(',')(part[1] - part[0]))

const key = svg
  .append('g')
  .attr('class', 'key')
  .attr('transform', `translate(${width - margin.right + 24},${margin.top + 12})`)
  .selectAll('g')
  .data(series)
  .join('g')
  .attr('transform', (name, index) => `translate(0,${index * 24})`)

key
  .append('rect')
  .attr('y', -8)
  .attr('width', 11)
  .attr('height', 11)
  .attr('rx', 2)
  .attr('fill', (name) => fill(name))

key.append('text').attr('x', 20).text((name) => name)
