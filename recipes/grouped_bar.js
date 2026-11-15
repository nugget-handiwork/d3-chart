import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm'

const container = document.getElementById('chart')
const data = await artifactData('DATA_FILE.json')

const color = (name, step) => `var(--${name}-${step})`

const groups = [...new Set(data.map((row) => row.label))]
const series = [...new Set(data.map((row) => row.series))]

const width = 800
const height = 450
const margin = { top: 16, right: 140, bottom: 56, left: 72 }

const x = d3
  .scaleBand()
  .domain(groups)
  .range([margin.left, width - margin.right])
  .padding(0.25)

const xSeries = d3
  .scaleBand()
  .domain(series)
  .range([0, x.bandwidth()])
  .padding(0.1)

const y = d3
  .scaleLinear()
  .domain([0, d3.max(data, (row) => row.value)])
  .nice()
  .range([height - margin.bottom, margin.top])

const fill = d3
  .scaleOrdinal()
  .domain(series)
  .range(series.map((name, index) => color('categorical', index + 1)))

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

const tooltip = d3.select(container).append('div').attr('class', 'tooltip')

svg
  .append('g')
  .selectAll('rect')
  .data(data)
  .join('rect')
  .attr('class', 'mark')
  .attr('x', (row) => x(row.label) + xSeries(row.series))
  .attr('y', (row) => y(row.value))
  .attr('width', xSeries.bandwidth())
  .attr('height', (row) => y(0) - y(row.value))
  .attr('fill', (row) => fill(row.series))
  .on('mousemove', (event, row) => {
    const [pointerX, pointerY] = d3.pointer(event, container)
    tooltip
      .style('opacity', 1)
      .html(
        `<strong>${row.label}</strong>${row.series}: ${d3.format(',')(row.value)}`,
      )
      .style('left', `${pointerX + 14}px`)
      .style('top', `${pointerY + 14}px`)
  })
  .on('mouseleave', () => tooltip.style('opacity', 0))

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
