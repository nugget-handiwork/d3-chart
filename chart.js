import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm'

const container = document.getElementById('chart')

const svg = d3
  .select(container)
  .append('svg')
  .attr('viewBox', '0 0 800 450')

svg
  .append('text')
  .attr('x', 400)
  .attr('y', 225)
  .attr('text-anchor', 'middle')
  .attr('class', 'placeholder')
  .text('Copy a recipe over this file')
