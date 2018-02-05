//Draws the visualisation of the graph for a given timebin in the graph sequence
function drawGraph(canvas, nodes, links, restart = true) {

    //https://bl.ocks.org/mbostock/1095795

    link = link.data(links);
    link.exit().remove();
    link = link.enter()
        .append("line")
        .classed("link", true)
        .merge(link);

    node = node.data(nodes);
    node.exit().remove();
    node = node.enter()
        .append("circle")
        .attr("r", 5)
        .classed("node", true)
        .merge(node);

    node.select("title")
        .remove();
    node.append("title")
        .text(function(d) { return d.id; });

    sim.nodes(nodes);

    sim.force("link").links(links);
    //console.log(nodes)
    //console.log(links)

    if (restart) {
        sim.alpha(0.1).restart();
    } else {
        sim.restart();
    }

    //drawNoLinksBar(data_props.nodes - nodes.length)

}
/*
function drawNoLinksBar(n) {

    d3.select("#isolated_count_div > span")
      .text(n.toString())
}
*/
var scale = 1;
var transX = 0;
var transY = 0;
var zoomStep = 0.1;

function simulation(width, height) {
    return d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody().strength(-100))
        //.force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .alphaMin(0.01)
        .alphaDecay(0.002)
        .on("tick", ticked);
}

function ticked() {
    link
        .attr("x1", function(d) { return d.source.x * scale + transX; })
        .attr("y1", function(d) { return d.source.y * scale + transY; })
        .attr("x2", function(d) { return d.target.x * scale + transX; })
        .attr("y2", function(d) { return d.target.y * scale + transY; });
        // .each(function(d, i){
        //     var op = parseFloat(d3.select(this).style("opacity"));
        //     d3.select(this).style("opacity", op < 1 ? op + 0.01 : 1)});

    node
        .attr("cx", function(d) { return d.x * scale + transX; })
        .attr("cy", function(d) { return d.y * scale + transY; });
        // .each(function(d, i){
        //     var op = parseFloat(d3.select(this).style("opacity"));
        //     d3.select(this).style("opacity", op < 1 ? op + 0.01 : 1)});
}

/*
function resetZoom() {
    svg.transition().duration(750).call(zooming.transform, d3.zoomIdentity.translate(400, 400));
}

function reheat() {
    sim.alpha(0.2).restart();
}
*/

