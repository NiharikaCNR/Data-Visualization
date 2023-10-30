
let generator = d3.randomUniform(100,1400);
let x_coords = d3.range(10).map(generator);

circle_data = [];
for (var i = 10; i < 20; i++) {
  circle_data.push({x: x_coords[i], r: i});
}

d3.select("svg")
  .selectAll("circle")
  .data(circle_data).enter()
  .append("circle")
  .attrs({
    cx: cd => cd.x,
    cy: 400,
    r: cd => cd.r, 
    opacity: 0.5
  })

function animate(t) {
  circle_data = circle_data.map(cd => { return { x: generator(), r: cd.r, rnew: (1 + Math.sin(t/10)) * cd.r } });
  d3.selectAll("circle")
    .data(circle_data)
    .transition()
    .duration(2000)
    .ease(d3.easeLinear)
    .attrs({
      cx: cd => cd.x,
      r: cd => cd.rnew
    })
    d3.timeout(() => { animate(t+1) }, 500)
}

animate(0)