function Visualisation() {

    this.data;
    this.sim;
    this.svg;
    this.g;
    this.width;
    this.height;
    this.xStatScale;
    this.leftStatMargin;
    this.statWidth;
    this.link;
    this.node;

    this.nodes = [];
    this.links = [];
    this.all_nodes = [];

    this.data_props = {
        "nodes": 811,
        "links": 0,
        "rows": 0,
        "current_bin": 0
    };

    this.params = {
        "bin_size": 900,
        "offset": 0,
        "bins": 100,
        "threshold": -90,
        "source": "user",
        "target": "user2",
        "statistics": [
            {name: "Average Degree", method: function(links, nodes) { return averageDegree(links);}},
            {name: "Number of isolated nodes", method: function(links, nodes) { return (data_props.nodes - nodes.length); }},
            //{name: "Network Density", method: function(links, nodes) {return networkDensity(links);}},
            {name: "Number of links", method: function(links, nodes) { return links.length; }}
        ]
    };
}

Visualisation.prototype.initGraph = function(canvas) {

    link = canvas
        .append("g")
        .selectAll(".link");

    node = canvas
        .append("g")
        .selectAll(".node");
}

Visualisation.prototype.updatePars = function() {

    var threshold = document.getElementById("threshold_slider").valueAsNumber;
    var binsize = document.getElementById("binsize_slider").valueAsNumber;
    var n_bins = document.getElementById("n_bins_slider").valueAsNumber;

    d3.select("#threshold_value")
        .html(threshold);
    d3.select("#binsize_value")
        .html(binsize);
    d3.select("#n_bins_value")
        .html(n_bins);

    params["threshold"] = threshold
    params["bin_size"] = binsize
    params["bins"] = n_bins
    console.log(params)

    this.calculateGraphs();

    d3.select("body")
        .on("keydown", function() {
            if (d3.event.keyCode == 39) {
                viewBin(1)
            }
            else if (d3.event.keyCode == 37) {
                viewBin(-1)
            }
        });
};

Visualisation.prototype.calculateGraphs = function()
{
    defineTimeFormat()

    var i = 0;
    nodes = [];
    links = [];
    for (var n = 0; n < params.bins; n++) {
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
        links[n] = graphdata["links"]
        //links[n] = simulateNodes()
        nodes[n] = graphdata["nodes"]
        if (n === 0){
            d3.select("#stats")
                .selectAll("*")
                .remove();
            drawGraph(g, nodes[n], links[n]);
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

    for (var j = 0; j < params["statistics"].length; j++) {
        var canvas = d3.select("#stat" + j);
        var steps = calcGraphStatistics(links, nodes, params["statistics"][j].method);
        console.log(steps.length);
        drawStepChart(steps, canvas)

    }
};

Visualisation.prototype.calculateLinksNodes = function(data, filter, count = false, directed = false) {
    var node1key = params["source"];
    var node2key = params["target"];

    var link_map = {};
    var node_map = {};

    for (var key in data) {
        var row = data[key];
        if (filter(row)) {
            var source = row[node1key];
            var target = row[node2key];
            node_map[source] = true;
            node_map[target] = true;
            if (!link_map[source]) {
                link_map[source] = {};
            }
            link_map[source][target] = true;

            if(link_map[target]) {
                delete link_map[target][source]; //Not good if target == source
            }
        }
    }

    var links = [];
    for (var source in link_map) {
        for (var target in link_map[source]) {
            links.push({"source": source, "target": target, "value": 0});
        }
    }

    var nodes = [];
    for (var key in node_map) {
        nodes.push(all_nodes[key]); //Uses references instead of new node objects
    }

    return {"links": links, "nodes": nodes};
};

Visualisation.prototype.viewBin = function(n, abs = false) {
    if (!abs) {
        n = data_props.current_bin + n;
    }
    if (n < 0 || n >= links.length) {return;}
    data_props.current_bin = n;

    var x = xStatScale(n * params.bin_size);
    if (abs) {
        d3.selectAll(".statistic_svg g .vTimeLine")
            .transition()
            .attr("duration", 1000)
            .attr("x", x);

        d3.selectAll(".statistic_svg g .tickText")
            .text(formatTime(n * params.bin_size * 1000) + " - " + formatTime((n+1) * params.bin_size * 1000))
            .transition()
            .attr("duration", 1000)
            .attr("x", x);

        drawGraph(g, nodes[n], links[n]);
    } else {
        d3.selectAll(".statistic_svg g .vTimeLine")
            .attr("x", x);

        d3.selectAll(".statistic_svg g .tickText")
            .text(formatTime(n * params.bin_size * 1000) + " - " + formatTime((n+1) * params.bin_size * 1000))
            .attr("x", x);
        drawGraph(g, nodes[n], links[n], false);
    }
};

Visualisation.prototype.simulation = function(width, height) {
    return d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody().strength(-100))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .on("tick", ticked);
};

Visualisation.prototype.ticked = function() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
};

Visualisation.prototype.drawNoLinksBar = function(n) {

    d3.select("#n_nolinks")
        .html(n.toString())

    /*
    var canvas = d3.select("#nolinksbar")

    canvas.selectAll("*").remove();

    var margin = {top: 0, right: 0, bottom: 0, left: 0};
    var width = +canvas.node().getBoundingClientRect().width - margin.left - margin.right;

    var g = canvas.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
        .domain([0,data_props.nodes])
        .range([0,width]);

    g.append("rect")
     .attr("height", 25)
     .attr("width", x(n))
     .attr("fill", "brown")
     console.log(n)
     console.log(x(n))


    //Why is this not working?
    g.append("text")
     .attr("x", 0)
     .attr("y", 0)
     .text(n.toString())
     .attr("font-family", "sans-serif")
     .attr("font-size", "20px")
     .attr("fill", "black")
    */
};

Visualisation.prototype.calcGraphStatistics = function(links, nodes, statistic) {
    var statistics = [];
    for (var i=0; i<links.length; i++) {
        var value = statistic(links[i], nodes[i]);
        var t = i*params.bin_size;
        if (i === 0) {
            statistics.push({t: t,
                value: value,
                left: true})
        }
        else {
            var last_value = statistics[2*i-2].value;
            var jump = value - last_value;
            statistics.push({t: t,
                value: last_value,
                left: false});
            statistics.push({t: t,
                value: value,
                left: true,
                jump: jump})
        }
    }
    //statistics.pop();
    return statistics
};

Visualisation.prototype.averageDegree = function(links) {
    var n_nodes = data_props.nodes;
    return 2*links.length / n_nodes;
}

function networkDensity(links) {
    var n_nodes = data_props.nodes;
    return 2*(links.length - n_nodes + 1) / (n_nodes * (n_nodes - 3) + 2);
}
//---------------------------------------------------------------------

//---------------------------------------------------------------------
//Visualize the descriptive graph statistics in a step chart

function drawStepChart(steps, canvas) {

    var margin = {top: 50, right: 50, bottom: 50, left: 50};
    var width = +canvas.node().getBoundingClientRect().width - margin.left - margin.right;
    var height = +canvas.node().getBoundingClientRect().height - margin.top - margin.bottom;

    canvas.selectAll("*")
        .remove();

    var g = canvas.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
        .on("click", handleStatClick)
        .on("mousemove", handleStatHover);

    var x = d3.scaleLinear()
        .domain([params.offset, params.bins * params.bin_size])
        .range([0,width]);

    g.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "white");

    //Quick n' dirty. Used in function "getStatX"
    xStatScale = x;
    leftStatMargin = margin.left;
    statWidth = width;

    var y = d3.scaleLinear()
        .domain(d3.extent(steps,
            function(d){
                return d.value;
            }))
        .range([height,0]);

    var xAxis = d3.axisBottom(x)
        .tickValues(d3.range(params.offset, params.bin_size * params.bins, params.bin_size));

    var yAxis = d3.axisLeft(y);

    g.selectAll(".stepgraph-hline")
        .data(steps.filter(function(d){
            return (d.left)
        }))
        .enter()
        .append("line")
        .classed("stepgraph-hline", true)
        .style("stroke", "black")
        .attr("x1", function(d) {return x(d.t)})
        .attr("y1", function(d) {return y(d.value)})
        .attr("x2", function(d) {
            return (x(d.t + params.bin_size))
        })
        .attr("y2", function(d) {return y(d.value)});

    g.selectAll(".stepgraph-vline")
        .data(steps.filter(function(d, i){
            return (d.left && (i !== 0))
        }))
        .enter()
        .append("line")
        .classed("stepgraph-vline", true)
        .attr("stroke", "grey")
        //.attr("stroke-dasharray", 4)
        .attr("x1", function(d) {return x(d.t)})
        .attr("y1", function(d) {return y(d.value)})
        .attr("x2", function(d) {return x(d.t)})
        .attr("y2", function(d) {
            return (y(d.value - d.jump))
        });

    canvas.append("g")
        .attr("transform", "translate(" + margin.left + "," + (height+margin.top) + ")")
        .call(xAxis)
        .selectAll("text")
        .classed("xTick", true);

    canvas.append("text")
        .attr("x", margin.left + width / 2)
        .attr("y", margin.top + height + 35)
        .style("stroke", "black")
        .html("Time");

    canvas.append("g")
        .attr("transform", "translate(" + (margin.left) + "," + margin.top + ")")
        .call(yAxis);

    /*canvas.append("text")
        .attr("x", margin.left - 50)
        .attr("y", margin.top + height / 2)
        .style("stroke", "black")
        .html("f(x)");*/

    var line_size = x(params.bin_size);

    g.append("rect")
        .classed("vTimeLineGhost", true)
        .attr("y", 0)
        .attr("x", 0)
        .attr("height", height)
        .attr("width", line_size);

    g.append("text")
        .classed("movingTickText", true)
        .attr("text-anchor", "middle")
        .attr("y", height+20)
        .attr("x", 0);

    g.append("rect")
        .classed("vTimeLine", true)
        .attr("y", 0)
        .attr("x", 0)
        .attr("height", height)
        .attr("width", line_size);

    g.append("text")
        .classed("tickText", true)
        .attr("text-anchor", "middle")
        .attr("y", height+20)
        .attr("x", 0);



    /*
    g.selectAll(".stepgraph-circle")
        .data(steps)
        .enter()
        .append("circle")
        .classed("stepgraph-circle", true)
        .attr("cx", function(d) {
            return x(d.t) + "px";
        })
        .attr("cy", function(d) {
            return y(d.value) + "px";
        })
        .attr("r", "3")
        .attr("fill", function(d) {
            if (d.left) {return "black";}
            else {return "white";}
        })
        .attr("stroke", "black")
    */
}
//---------------------------------------------------------------------


var formatTime;

function defineTimeFormat() {

    var orders = [" Day %e at ", " %H:%M", ":%S"];
    var maxCount = [365, 24, 60];
    var values = [24*60*60, 60*60, 1];

    for (var n = orders.length - 1; n >= 0; n--) {
        if (params.bin_size % (maxCount[n] * values[n]) === 0) {
            orders[n] = "";
        }
        else
        {
            break;
        }
    }

    for (n = 0; n < orders.length; n++) {
        if (Math.floor((params.bin_size * params.bins - 1) / values[n]) === 0) {
            orders[n] = "";
        }
        else
        {
            break;
        }
    }
    var formatString = orders.join("").substr(1);
    formatTime = d3.utcFormat(formatString);
}

function handleStatClick(d, i) {
    var x = d3.mouse(this)[0];

    var n = Math.floor(xStatScale.invert(x) / params.bin_size);

    viewBin(n, true);
}

function handleStatHover(d, i) {
    var x = d3.mouse(this)[0];

    var g = d3.select(this);
    var line = g.select(".vTimeLineGhost");

    if (x > 0 && x < statWidth - 1) {

        var bin_width = xStatScale(params.bin_size);
        var n = Math.floor(x / bin_width);
        line.attr("x", n * bin_width);

        g.select(".movingTickText")
            .attr("x", (n+0.5) * bin_width)
            .text(formatTime(n * params.bin_size * 1000) + " - " + formatTime((n+1) * params.bin_size * 1000));

    }

    //console.log(getStatX(d3.mouse(this)[0]));
}

function getStatX(x) {
    return xStatScale.invert(x);
}