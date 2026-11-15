import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm'

const container = document.getElementById('chart')
const data = await artifactData('DATA_FILE.json')

const color = (name, step) => `var(--${name}-${step})`

const series = [...new Set(data.map((row) => row.series))]

const fill = d3
  .scaleOrdinal()
  .domain(series)
  .range(series.map((name, index) => color('categorical', index + 1)))

const width = 800
const height = 450
const margin = { top: 16, right: 140, bottom: 64, left: 88 }

const x = d3
  .scaleLinear()
  .domain([0, d3.max(data, (row) => row.spend)])
  .nice()
  .range([margin.left, width - margin.right])

const y = d3
  .scaleLinear()
  .domain([0, d3.max(data, (row) => row.revenue)])
  .nice()
  .range([height - margin.bottom, margin.top])

const svg = d3
  .select(container)
  .append('svg')
  .attr('viewBox', `0 0 ${width} ${height}`)

// A scatter reads against a full grid rather than horizontal rules alone.
svg
  .append('g')
  .attr('class', 'grid')
  .attr('transform', `translate(${margin.left},0)`)
  .call(d3.axisLeft(y).ticks(6).tickSize(margin.left + margin.right - width).tickFormat(''))

svg
  .append('g')
  .attr('class', 'grid')
  .attr('transform', `translate(0,${height - margin.bottom})`)
  .call(d3.axisBottom(x).ticks(8).tickSize(margin.top + margin.bottom - height).tickFormat(''))

svg
  .append('g')
  .attr('class', 'axis')
  .attr('transform', `translate(0,${height - margin.bottom})`)
  .call(
    d3
      .axisBottom(x)
      .ticks(8)
      .tickSize(0)
      .tickPadding(10)
      .tickFormat(d3.format('$~s')),
  )

svg
  .append('g')
  .attr('class', 'axis')
  .attr('transform', `translate(${margin.left},0)`)
  .call(d3.axisLeft(y).ticks(6).tickSize(0).tickPadding(10).tickFormat(d3.format('$~s')))
  .call((group) => group.select('.domain').remove())

svg
  .append('text')
  .attr('class', 'axis-title')
  .attr('transform', 'rotate(-90)')
  .attr('x', -(margin.top + height - margin.bottom) / 2)
  .attr('y', 20)
  .attr('text-anchor', 'middle')
  .text('Revenue')

svg
  .append('text')
  .attr('class', 'axis-title')
  .attr('x', (margin.left + width - margin.right) / 2)
  .attr('y', height - 12)
  .attr('text-anchor', 'middle')
  .text('Advertising spend')

const tooltip = d3.select(container).append('div').attr('class', 'tooltip')

svg
  .append('g')
  .selectAll('circle')
  .data(data)
  .join('circle')
  .attr('class', 'mark')
  .attr('cx', (row) => x(row.spend))
  .attr('cy', (row) => y(row.revenue))
  .attr('r', 6)
  .attr('fill', (row) => fill(row.series))
  .on('mousemove', (event, row) => {
    const [pointerX, pointerY] = d3.pointer(event, container)
    const money = d3.format('$,')
    tooltip
      .style('opacity', 1)
      .html(
        `<strong>${row.label}</strong>Category: ${row.series}<br>` +
          `Ad spend: ${money(row.spend)}<br>Revenue: ${money(row.revenue)}`,
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
  .append('circle')
  .attr('r', 5.5)
  .attr('cx', 5.5)
  .attr('cy', -3)
  .attr('fill', (name) => fill(name))

key.append('text').attr('x', 20).text((name) => name)
