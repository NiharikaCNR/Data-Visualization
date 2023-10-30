let generator = d3.randomUniform(150,300);
let id = 0
bar_data = []

function assign_fill(x) {
    switch(x%5) {
        case 0: return `hsl(19, 96%, 45%)`
        case 1: return `hsl(49, 100%, 51%)`
        case 2: return `hsl(123, 100%, 34%)`
        case 3: return `hsl(193, 100%, 40%)`
        case 4: return `hsl(232, 85%, 67%)`
    }
}

function move_bars() {
    bar_data = bar_data.map(d => { return {id: d.id, life: d.life + 1, height: d.height }})
    bar_data.push({life: 0, height: generator(), id: id});
    bar_data = bar_data.filter(d => d.life < 11)
    id+=1

    d3.select("svg")
      .selectAll("rect")
      .data(bar_data, bd=> bd.id)
      .join (
        enter => enter.append("rect").transition(500)
                      .attrs({
                        height: 0,
                        width: 50,
                        x: 0,
                        y: 500,
                        fill: bd => assign_fill(bd.id),
                        opacity: 0.75
                      }),
        update => update.transition(500).delay(100)
                        .attrs({
                            x: bd => (bd.life-1)*55,
                            y: bd => 500 - bd.height,
                            height: bd => bd.height,
                            width: 50
                        }),
        exit => exit.transition(500)
                    .attrs({y: 500})
                    .remove()
      )
}

move_bars()









// | ---------------------------------- UNUSED OLD CODE --------------------------------------- | //
// ⌄                                                                                            ⌄ //  
// ⌄                                                                                            ⌄ //
// ⌄                                                                                            ⌄ //



// helper function to create a new bar
function new_bar(ht, xi) {
    id += 1;
    return {
        id: id, x: xi, y: 350-ht, 
        h: ht, width: 50, 
        fill: assign_fill(id),
    }
}

// Creating the initial 10 bars
// for (var i = 9; i >= 0; i--) { bar_data.push(new_bar(generator(),(i)*55)); }
// d3.select("svg")
//   .selectAll("rect")
//   .data(bar_data).enter()
//   .append("rect")
//   .attrs({
//     x: bd => bd.x, y: bd => 350 - bd.h,
//     height: bd => bd.h, width: 50, 
//     fill: bd => assign_fill(bd.id), 
//     opacity: 0.75
//   })

// Updating the bar_data to remove a bar on the left and add a bar on the right
function update_data(bar_data) {
    bar_data = bar_data.map(bd => { bd.x -= 55;	return bd})
    bar_data = bar_data.concat(new_bar(generator(), 495))
    return bar_data.filter(bd => bd.x >= 0);
  }

function move_bars1() {
    bar_data = update_data(bar_data);
    d3.select("svg")
    .selectAll("rect")
    .data(bar_data, bd => bd.id)
    .join(
            enter => enter.append("rect").transition().duration(1000)
            .attrs({ 
                x: bd => bd.x, y: bd => 350-bd.h, 
                height: bd => bd.h, width: 50, 
                fill: bd => assign_fill(bd.id),
                opacity: 0.75
            }),
            update => update.transition().duration(1000).attr("x", bd => bd.x),
            exit => exit.remove().transition().duration(1000)
        )
}
