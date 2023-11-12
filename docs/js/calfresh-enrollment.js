function make_scales(data, margin) {
  yExtent = d3.extent(data.map(d => d.calfresh))
  yScale = (yExtent[1]-yExtent[0])/100
  return {
    x: d3.scaleTime()
      .domain(d3.extent(data.map(d => d.date)))
      .range([margin.left, 600 - margin.right]),
    y: d3.scaleLinear()
      .domain([yExtent[0]-yScale, yExtent[1]+yScale])
      .range([400 - margin.bottom, margin.top])
  }
}

function draw_axes(scales, margin) {
  let x_axis = d3.axisBottom(scales.x)
  d3.select("#x_axis")
    .attr("transform", `translate(0, ${400 - margin.bottom})`)
    .call(x_axis)

  let y_axis = d3.axisLeft(scales.y)
  d3.select("#y_axis")
    // .transition(200)
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(y_axis)

}

function draw_lines(county_data, scales) {
  let path_generator = d3.line()
    .x(d => scales.x(d.date))
    .y(d => scales.y(d.calfresh))

  d3.select("#lines")
    .selectAll("path")
    .data([county_data]).enter()
    .append("path")
    // .transition().delay(300).duration(500)
    .attrs({
      d: n => path_generator(n),
      id: n => n.county,
      stroke: "#a8a8a8",
      "stroke-width": 3, 
      fill: 'none', 
      opacity: 0.9
    })
}

function generate_ts(data) {
  let margin = {top: 100, right: 10, bottom: 20, left: 50}
  
  let parseDate = d3.timeParse('%Y %b')
  data.forEach((d) => {d.date = parseDate(d.date)});
  var reshaped_data = Object.fromEntries(d3.group(data, d => d.county).entries())

  county_data = reshaped_data['Contra Costa']

  let scales = make_scales(county_data, margin)
  draw_axes(scales, margin)
  draw_lines(county_data, scales)
}

function generate_map(data) {
  let width = 500,
      height = 500,
      scales = {
        fill: d3.scaleQuantize()
          .domain([0, 100])
          .range(d3.schemeBlues[9])
      }
  let proj = d3.geoMercator()
    .fitSize([width, height], data)
  let path = d3.geoPath()
    .projection(proj);

  d3.select("#map")
    .selectAll("path")
    .data(data.features).enter()
    .append("path")
    .attrs({
      d: path,
      fill: '#e2e2e2',
      "stroke-width": 0,
      transform: 'translate(700,0)'
    })
    // .on("mouseover", (_, d) => mouseover(d));

  // d3.select("#name")
  //   .append("text")
  //   .attr("transform", "translate(100, 100)")
  //   .text("hover a glacier")
}

d3.csv("../data/calfresh-small.csv", d3.autoType)
  .then(generate_ts)

d3.json("../data/california-counties.geojson")
  .then(generate_map) // we define the visualize function