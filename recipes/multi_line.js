import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm'

const container = document.getElementById('chart')
const data = await artifactData('DATA_FILE.json')

const color = (name, step) => `var(--${name}-${step})`

const series = [...new Set(data.map((row) => row.series))]

const stroke = d3
  .scaleOrdinal()
  .domain(series)
  .range(series.map((name, index) => color('categorical', index + 1)))

const width = 800
const height = 450
const margin = { top: 16, right: 140, bottom: 64, left: 80 }

const x = d3
  .scaleLinear()
  .domain(d3.extent(data, (row) => row.year))
  .range([margin.left, width - margin.right])

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
  .attr('class', 'axis')
  .attr('transform', `translate(0,${height - margin.bottom})`)
  .call(
    d3
      .axisBottom(x)
      .ticks(width / 90)
      .tickSize(0)
      .tickPadding(10)
      .tickFormat(d3.format('d')),
  )

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
  .text('Approval rating')

svg
  .append('text')
  .attr('class', 'axis-title')
  .attr('x', (margin.left + width - margin.right) / 2)
  .attr('y', height - 12)
  .attr('text-anchor', 'middle')
  .text('Year')

const line = d3
  .line()
  .x((row) => x(row.year))
  .y((row) => y(row.value))

svg
  .append('g')
  .selectAll('path')
  .data(d3.group(data, (row) => row.series))
  .join('path')
  .attr('fill', 'none')
  .attr('stroke', ([name]) => stroke(name))
  .attr('stroke-width', 2)
  .attr('stroke-linejoin', 'round')
  .attr('d', ([, rows]) => line(rows.slice().sort((a, b) => a.year - b.year)))

const tooltip = d3.select(container).append('div').attr('class', 'tooltip')

svg
  .append('g')
  .selectAll('circle')
  .data(data)
  .join('circle')
  .attr('class', 'mark')
  .attr('cx', (row) => x(row.year))
  .attr('cy', (row) => y(row.value))
  .attr('r', 4)
  .attr('fill', (row) => stroke(row.series))
  .on('mousemove', (event, row) => {
    const [pointerX, pointerY] = d3.pointer(event, container)
    tooltip
      .style('opacity', 1)
      .html(
        `<strong>${row.series}</strong>${row.year}: ${d3.format('.1%')(row.value)}`,
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
  .attr('fill', (name) => stroke(name))

key.append('text').attr('x', 20).text((name) => name)
