/*
function calculateGraphs()
{
    defineTimeFormat()
*/
    var n_to_draw = 0;
    if (params.old_bin_size === params.bin_size && params.bins > params.current_bin) {
        n_to_draw = params.current_bin;
    }
    else {
        var old_x = (params.current_bin + 0.5) * params.old_bin_size;
        var new_bin = Math.floor(old_x / params.bin_size);
        if (params.bins > new_bin) {
            n_to_draw = new_bin;
        }
    }
/*    //console.log("hi")
    var i = 0;
    nodes = [];
    links = [];
    for (var n = 0; n < params.bins; n++) {
        //console.log("hello")
        var bin = [];
        var looping = true;
        while (looping) {
            var row = data[i];
            if (row["ts"] < (n+1) * params["bin_size"]) {
                bin.push(row);
            } else {
                looping = false;
            }
            i++;
        }
        var graphdata = calculateLinksNodes(bin, function(row){
            return row["rssi"] > params['threshold'];
        });

        links[n] = graphdata["links"];
        nodes[n] = graphdata["nodes"];
        degrees_freq[n] = graphdata["degrees_freq"];
        //if (n === n_to_draw){
        //    drawGraph(g, nodes[n], links[n]);
        //}

        if (n === 0){
            d3.select("#stats")
                .selectAll("*")
                .remove();
            for (var k = 0; k < params["statistics"].length; k++) {
                var divs = d3.select("#stats")
                    .append("div")
                    .classed("statistic_div", true)
                    .attr("id", "stat_div" + k);

                divs.append("span")
                    .classed("statistic_span", true)
                    .text(params["statistics"][k].name);

                divs.append("br");

                divs.append("svg")
                    .classed("statistic_svg", true)
                    .attr("width", "800")
                    .attr("height", "200")
                    .attr("id", "stat" + k);
            }
        }
    }
    //console.log("link_count", link_count)
    //console.log("nodes", nodes)
    for (var j = 0; j < params["statistics"].length; j++) {
        var canvas = d3.select("#stat" + j);
        var steps = calcGraphStatistics(links, nodes, params["statistics"][j]);
        drawStepChart(steps, canvas, j, params["statistics"][j].line)

    }
    */
    viewBin(n_to_draw, true, false);
//}

function viewBin(n, abs = false, trans = true) {
    if (!abs) {
        n = params.current_bin + n;
    }
    if (n < 0 || n >= links.length) {return;}
    params.current_bin = n;

    /*nodes[n].forEach(function(d){
        delete d.x;
        delete d.y;
        return d;
    });
    links[n].forEach(function(d){
        delete d.x1;
        delete d.x2;
        delete d.y1;
        delete d.y2;
        return d;
    });*/
    /*
    var bin_width = xStatScale(params.bin_size);
    var x = xStatScale(n * params.bin_size);
    if (abs && trans) {
        d3.selectAll(".statistic_svg g .vTimeLine")
            .transition()
            .attr("duration", 1000)
            .attr("x", x);

        d3.selectAll(".statistic_svg g .tickText")
            .text(formatTime(n * params.bin_size * 1000) + " - " + formatTime((n+1) * params.bin_size * 1000))
            .transition()
            .attr("duration", 1000)
            .attr("x", x + bin_width / 2);

        d3.selectAll(".statistic_svg g .valueText")
            .text(function(d, i) {return d3.format(params.statistics[i].format)(params.statistics[i].values[n*2].value);})
            .transition()
            .attr("duration", 1000)
            .attr("x", x + bin_width / 2);

    } else {
        d3.selectAll(".statistic_svg g .vTimeLine")
            .attr("x", x);

        d3.selectAll(".statistic_svg g .tickText")
            .attr("x", x + bin_width / 2)
            .text(formatTime(n * params.bin_size * 1000) + " - " + formatTime((n+1) * params.bin_size * 1000));

        d3.selectAll(".statistic_svg g .valueText")
            .attr("x", x + bin_width / 2)
            .text(function(d, i) {return d3.format(params.statistics[i].format)(params.statistics[i].values[n*2].value);});

    }
    */
    drawGraph(g, nodes[n], links[n]);
    //console.log(link_count[n])
    //drawDegreeDist(degrees_freq[n])//link_count[n])

}