import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm'

const container = document.getElementById('chart')
const data = await artifactData('DATA_FILE.json')

const color = (name, step) => `var(--${name}-${step})`

const width = 800
const height = 450
const margin = { top: 16, right: 24, bottom: 72, left: 80 }

const x = d3
  .scaleLinear()
  .domain(d3.extent(data, (row) => row.year))
  .range([margin.left, width - margin.right])

const y = d3
  .scaleLinear()
  .domain(d3.extent(data, (row) => row.value))
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
  .attr('class', 'axis')
  .attr('transform', `translate(0,${height - margin.bottom})`)
  .call(
    d3
      .axisBottom(x)
      .ticks(width / 60)
      .tickSize(0)
      .tickPadding(10)
      .tickFormat(d3.format('d')),
  )
  .selectAll('text')
  .attr('transform', 'rotate(-90)')
  .attr('text-anchor', 'end')
  .attr('dy', '0.32em')
  .attr('dx', '-0.6em')

svg
  .append('g')
  .attr('class', 'axis')
  .attr('transform', `translate(${margin.left},0)`)
  .call(d3.axisLeft(y).ticks(6).tickSize(0).tickPadding(10).tickFormat(d3.format('.0%')))
  .call((group) => group.select('.domain').remove())

svg
  .append('text')
  .attr('class', 'axis-title')
  .attr('transform', 'rotate(-90)')
  .attr('x', -(margin.top + height - margin.bottom) / 2)
  .attr('y', 20)
  .attr('text-anchor', 'middle')
  .text('Approval percentage')

svg
  .append('text')
  .attr('class', 'axis-title')
  .attr('x', (margin.left + width - margin.right) / 2)
  .attr('y', height - 8)
  .attr('text-anchor', 'middle')
  .text('Year')

svg
  .append('path')
  .datum(data)
  .attr('fill', 'none')
  .attr('stroke', color('sequential', 1))
  .attr('stroke-width', 2.5)
  .attr('stroke-linejoin', 'round')
  .attr('stroke-linecap', 'round')
  .attr(
    'd',
    d3
      .line()
      .curve(d3.curveMonotoneX)
      .x((row) => x(row.year))
      .y((row) => y(row.value)),
  )

const tooltip = d3.select(container).append('div').attr('class', 'tooltip')

// Open dots: surface fill, series stroke.
svg
  .append('g')
  .selectAll('circle')
  .data(data)
  .join('circle')
  .attr('cx', (row) => x(row.year))
  .attr('cy', (row) => y(row.value))
  .attr('r', 3.5)
  .attr('fill', 'var(--surface)')
  .attr('stroke', color('sequential', 1))
  .attr('stroke-width', 1.5)
  .on('mousemove', (event, row) => {
    const [pointerX, pointerY] = d3.pointer(event, container)
    tooltip
      .style('opacity', 1)
      .html(`<strong>${row.year}</strong>${d3.format('.1%')(row.value)}`)
      .style('left', `${pointerX + 14}px`)
      .style('top', `${pointerY + 14}px`)
  })
  .on('mouseleave', () => tooltip.style('opacity', 0))
