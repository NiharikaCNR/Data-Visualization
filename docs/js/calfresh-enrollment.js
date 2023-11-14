function make_scales(data, margin) {
  return {
    x: d3.scaleTime()
      .domain(d3.extent(data.map(d => d.date)))
      .range([margin.left, 600 - margin.right]),
    y: d3.scaleLinear()
      .domain(d3.extent(data.map(d => d.calfresh)))
      .range([450, margin.top]), 
    fill: d3.scaleSequential(d3.interpolateHslLong(d3.hsl('#fff'), d3.hsl('#72172f')))
    .domain(d3.extent(data.map(d => d.calfresh)))
  }
}

function draw_axes(scales, margin) {
  let x_axis = d3.axisBottom(scales.x)
  d3.select("#x_axis")
    .attr("transform", `translate(0, ${450})`)
    .call(x_axis)

  d3.select("#y_label")
  .attrs({
    // transform: 'translate(250, 420)',
    x: -margin.top*2,
    y: 20,  
    transform: 'rotate(-90)'
  }) 
  .style('text-anchor', 'middle')
  .text(`Calfresh Enrollment (in ,000s)`)

  let y_axis = d3.axisLeft(scales.y)
  d3.select("#y_axis")
    .transition(200)
    .ease(d3.easeLinear)
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(y_axis)

}

function draw_lines(data, scales) {
  let path_generator = d3.line()
    .x(d => scales.x(d.date))
    .y(d => scales.y(d.calfresh))

  d3.select("#lines")
    .selectAll("path")
    .data([data]).enter()
    .append("path")
    .transition(300)
    .ease(d3.easeLinear)
    .attrs({
      d: path_generator,
      id: cd => cd.county,
      // stroke: "#9F2042",
      "stroke-width": 2, 
      // fill: 'none', 
      // opacity: 0.7
    })

    // d3.select("#lines")
    //   .selectAll("path")
    //   .data([data])
    //   .join(
    //     enter => enter.append("path")
    //                   .transition(300)
    //                   .ease(d3.easeLinear)
    //                   .attrs({
    //                     d: path_generator,
    //                     id: cd => cd.county,
    //                     stroke: "#a8a8a8",
    //                     "stroke-width": 3, 
    //                     fill: 'none', 
    //                     opacity: 0.9
    //                   }),
    //     update => update.append("path")
    //                   .transition(300)
    //                   .ease(d3.easeLinear)
    //                   .attrs({
    //                     d: path_generator,
    //                     id: cd => cd.county,
    //                     stroke: "#a8a8a8",
    //                     "stroke-width": 3, 
    //                     fill: 'none', 
    //                     opacity: 0.9
    //                   }),
    //     exit => exit.remove()
    //   )
}

function generate_ts(data) {
  let margin = {top: 150, right: 10, left: 70}

  let scales = make_scales(data, margin)
  draw_axes(scales, margin)
  draw_lines(data, scales)
}

function update_ts(map_data, calfresh_data) {
  // Updating the Time-Series chart
  county_data = calfresh_data.filter(d => d.county == map_data.properties.county)
  d3.select("#lines")
    .selectAll("path")
    .remove()
  generate_ts(county_data)

  // Updating the map - highlighting the selected county
  d3.select("#map")
    .selectAll("path")
    .attrs({
      "stroke-width": e => e.properties.county == map_data.properties.county ? 4 : 0.5, 
      stroke: e => e.properties.county == map_data.properties.county ? "white" : "black"
    })

  d3.select("#name")
    .select("text")
    .text(`${map_data.properties.county} County`);
}

function generate_map(map_data, calfresh_data) {
  let proj = d3.geoMercator().fitSize([500,500], map_data)
  let path = d3.geoPath().projection(proj)

  let calfresh_county_means = calfresh_data.reduce((result, cd) => {
    if (!result[cd.county]) {
      result[cd.county] = { sum: 0, count: 0 };
    }
    result[cd.county].sum += cd.calfresh;
    result[cd.county].count += 1;
    return result;
  }, {})

  Object.values(calfresh_county_means).forEach((d) => d.mean = d.sum/d.count)

  let fillScale = d3.scaleSequential(d3.interpolateHslLong(d3.hsl('#dda2b2'), d3.hsl('#72172f')))
                    .domain(d3.extent(Object.values(calfresh_county_means).map(d => d.mean)))

  d3.select("#map")
    .selectAll("path")
    .data(map_data.features).enter()
    .append("path")
    .attrs({
      d: path,
      fill: d => fillScale(calfresh_county_means[d.properties.county].mean),
      "stroke-width": 0.5,
      stroke: 'black',
      transform: 'translate(700,0)'
    })
    .on("mouseover", (_, map_data) => update_ts(map_data,calfresh_data));

  d3.select("#name")
    .append("text")
    .text("Hover over a county")
}

function visualize([calfresh_data, map_data]) {
  let parseDate = d3.timeParse('%Y %b')
  calfresh_data.forEach((d) => {d.date = parseDate(d.date); d.calfresh /= 1000})
  generate_ts(calfresh_data)
  generate_map(map_data, calfresh_data)
}


Promise.all([
  d3.csv("../data/calfresh-small.csv", d3.autoType), 
  d3.json("../data/ca-counties.geojson")
]).then(visualize)