import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm'

const container = document.getElementById('chart')
const data = await artifactData('DATA_FILE.json')

const color = (name, step) => `var(--${name}-${step})`

const rows = data.slice().sort((a, b) => d3.descending(a.value, b.value))
const format = d3.format('.1%')

const width = 800
const rowHeight = 26
const margin = { top: 16, right: 64, bottom: 44, left: 150 }
const height = margin.top + margin.bottom + rows.length * rowHeight

const x = d3
  .scaleLinear()
  .domain([0, d3.max(rows, (row) => row.value)])
  .nice()
  .range([margin.left, width - margin.right])

const y = d3
  .scaleBand()
  .domain(rows.map((row) => row.label))
  .range([margin.top, height - margin.bottom])
  .padding(0.25)

const svg = d3
  .select(container)
  .append('svg')
  .attr('viewBox', `0 0 ${width} ${height}`)

svg
  .append('g')
  .selectAll('rect')
  .data(rows)
  .join('rect')
  .attr('x', margin.left)
  .attr('y', (row) => y(row.label))
  .attr('width', (row) => x(row.value) - margin.left)
  .attr('height', y.bandwidth())
  .attr('fill', color('sequential', 1))

// Gridlines sit above the bars, as light rules across the fill.
svg
  .append('g')
  .attr('class', 'grid')
  .attr('transform', `translate(0,${height - margin.bottom})`)
  .call(d3.axisBottom(x).ticks(8).tickSize(margin.top + margin.bottom - height).tickFormat(''))
  .attr('opacity', 0.6)

svg
  .append('g')
  .attr('class', 'axis')
  .attr('transform', `translate(0,${height - margin.bottom})`)
  .call(d3.axisBottom(x).ticks(8).tickSize(0).tickPadding(10).tickFormat(d3.format('.0%')))

svg
  .append('g')
  .attr('class', 'axis categories')
  .attr('transform', `translate(${margin.left},0)`)
  .call(d3.axisLeft(y).tickSize(0).tickPadding(10))
  .call((group) => group.select('.domain').remove())

svg
  .append('g')
  .selectAll('text')
  .data(rows)
  .join('text')
  .attr('class', 'value')
  .attr('x', (row) => x(row.value) + 8)
  .attr('y', (row) => y(row.label) + y.bandwidth() / 2)
  .attr('dominant-baseline', 'central')
  .text((row) => format(row.value))

d3
  .select(container)
  .append('div')
  .attr('class', 'note')
  .html('Source: survey data of U.S. residents by state')
