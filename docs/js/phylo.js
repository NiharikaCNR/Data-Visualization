var node_countries;

function make_tree(edges) {
  edges.push({to: 1, from: null})
  stratifier = d3.stratify()
    .id(d => d.to)
    .parentId(d => d.from)
  tree_gen = d3.tree()
    .size([900, 450])
  let root = stratifier(edges)
  return tree_gen(root)
}

function visualize(nodes, edges) {
  node_countries = nodes.map(d => d.country);  

  // Assign colors to countries
  country_colour = assign_colours(node_countries)

  // Make the tree
  tree = make_tree(edges)
  
  // Generate edges/links
  let link_gen = d3.linkVertical()
    .x(d => d.x)
    .y(d => d.y)
  d3.select("#tree")
    .selectAll("path")
    .data(tree.links()).enter()
    .append("path")
    .attrs({
      d: link_gen,
      "stroke-width": 0.8
    })

  // Generate nodes
  d3.select("#tree")
    .selectAll("circle")
    .data(tree.descendants()).enter()
    .append("circle")
    .attrs({
      cx: d => d.x,
      cy: d => d.y,
      fill: d => d.depth==0 ? "#000" : country_colour[nodes[d.id-1].country],
      r: 4,
      opacity: .8,
    })
    
  // d3.select("svg").on("mousemove", (ev) => update_labels(ev, neighborhoods, tree, nodes))

  // Make the legend
  let legend_data = Object.keys(country_colour).slice(1,6)
  legend_data.push("Others (hover to see)")
  
  legend_items = d3.select("#legend")
    .selectAll(".legend-item")
    .data(legend_data)
    .enter().append("g")
    .attrs({
      class: ".legend-item",
      transform: (d, i) => `translate(0, ${i*20})`,
    })

  legend_items
    .append("circle")
    .attrs({
      fill: (d, i) => Object.values(country_colour).slice(1,7)[i],
    })

  legend_items
    .append("text")
    .text(d => d);
}

function get_ids(node) {
  descendant_ids = node.descendants().map(d => d.id)
  ancestor_ids = node.ancestors().map(d => d.id)
  return ancestor_ids.concat(descendant_ids)
}

function get_highlight_level(curr_index, selected_index, id, focused) {
  let highlight_level = (curr_index==selected_index ? 1 : (focused.indexOf(id) == -1) ? -1 : 0)
  return highlight_level + 2
}

function update_labels(ev, neighborhoods, tree, nodes) {
  let pos = d3.pointer(ev),
    selected_index = neighborhoods.find(pos[0], pos[1]),
    selected_node = tree.descendants()[selected_index],
    focused = get_ids(selected_node)

  d3.select("#tree")
    .selectAll("circle")
    .transition(50)
    .ease(d3.easeLinear)
    .attrs({
      r: (curr_node, curr_index) => {
        let highlight_level = get_highlight_level(curr_index, selected_index, curr_node.id, focused)
        return (highlight_level)*4
      },
      opacity: (curr_node, curr_index) => {
        let highlight_level = get_highlight_level(curr_index, selected_index, curr_node.id, focused)
        return .3*(highlight_level)
      }
    })

  d3.select("#tree")
    .selectAll("path")
    .transition(100)
    .ease(d3.easeLinear)
    .attr("stroke-width", d => focused.indexOf(d.target.id) == -1 ? 0.2 : 1.5)

  d3.select("#labels")
    .selectAll("text")
    .transition(50)
    .ease(d3.easeLinear)
    .text(node_countries[selected_node.id-1]=='NA' ? "" : node_countries[selected_node.id-1])
    .attr("transform", `translate(${selected_node.x}, ${selected_node.y})`)
}

function assign_colours(all_countries_list) {
  let countries_frequencyTable = {};
  all_countries_list.forEach((country) => {
      countries_frequencyTable[country] = (countries_frequencyTable[country] || 0) + 1;
  });
  let countries = Object.keys(countries_frequencyTable).sort((a, b) => countries_frequencyTable[b] - countries_frequencyTable[a]);
  colors = ["none","#feda75","#fa7e1e","#d62976","#962fbf","#4f5bd5","#777"]
  let country_color = {}
  for (i=0; i<countries.length ; i++) {
    country_color[countries[i]] = (i<colors.length-1) ? colors[i] : colors[colors.length-1]
  }
  return country_color
}

function reset_viz() {
  d3.select("#tree")
    .selectAll("path")
    .attrs({
      "stroke-width": 0.8
    })

  d3.select("#tree")
    .selectAll("circle")
    .attrs({
      r: 4,
      opacity: .8,
    })

  d3.select("#labels")
    .selectAll("text")
    .text("")
}

function toggleInteractivity(toggleSwitch) {
  if(toggleSwitch.checked) {
    let neighborhoods = d3.Delaunay.from(tree.descendants().map(d => [d.x, d.y]))
    d3.select("svg").on("mousemove", (ev) => update_labels(ev, neighborhoods, tree, node_countries))
  }
  else {
    d3.select("svg").on("mousemove",() => {})
    reset_viz()
  }
}


Promise.all([
  d3.csv("../data/covid-nodes.csv", d3.autoType),
  d3.csv("../data/covid-edges.csv", d3.autoType)
]).then(([nodes, edges])=> {
  visualize(nodes, edges)
})
