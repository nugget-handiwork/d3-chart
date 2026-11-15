import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm'

const container = document.getElementById('chart')
const data = await artifactData('DATA_FILE.json')

const color = (name, step) => `var(--${name}-${step})`

const width = 800
const height = 450
const margin = { top: 16, right: 16, bottom: 56, left: 72 }

const x = d3
  .scaleBand()
  .domain(data.map((row) => row.label))
  .range([margin.left, width - margin.right])
  .padding(0.3)

const y = d3
  .scaleLinear()
  .domain([0, d3.max(data, (row) => row.value)])
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
  .text('Value')

const tooltip = d3.select(container).append('div').attr('class', 'tooltip')

svg
  .append('g')
  .selectAll('rect')
  .data(data)
  .join('rect')
  .attr('class', 'mark')
  .attr('x', (row) => x(row.label))
  .attr('y', (row) => y(row.value))
  .attr('width', x.bandwidth())
  .attr('height', (row) => y(0) - y(row.value))
  .attr('fill', color('sequential', 1))
  .on('mousemove', (event, row) => {
    const [pointerX, pointerY] = d3.pointer(event, container)
    tooltip
      .style('opacity', 1)
      .html(`<strong>${row.label}</strong>${d3.format(',')(row.value)}`)
      .style('left', `${pointerX + 14}px`)
      .style('top', `${pointerY + 14}px`)
  })
  .on('mouseleave', () => tooltip.style('opacity', 0))
