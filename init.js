function init() {

	//Listen for arrowkey events
	/*
    d3.select("body")
        .on("keydown", function() {
            var sliderFocus = d3.select(document.activeElement).classed("parameterSlider");
            if (sliderFocus) {
                return;
            }
            if (d3.event.keyCode == 39) {
                viewBin(1)
            }
            else if (d3.event.keyCode == 37) {
                viewBin(-1)
            }
        });	
	*/
    //Initialize the graph sequence visualization
    init_graphseq_vis()
  
    //Read in the data and calculate the graph sequence
    d3.csv(
        'data/sodas_data_cleaned.csv',
        function (error, input_data) {
            if (error) throw error;
            data = input_data;
            //Shouldn't I be able to move the functions below out of the d3.csv call?
            cutter = new GraphSeqCutter(cutterpars_init.nbins,
            							cutterpars_init.binlength,
            							cutterpars_init.nlinks,
            							cutterpars_init.threshold);
            graphseq = cutter.cutGraphSeq(data)  
            console.log(graphseq)
           	
           	drawGraph(g, graphseq.graphs[0].nodes, graphseq.graphs[0].links)         
        }
    )
}

function init_graphseq_vis() {
    
    svg = d3.select("#vis");
    var margin = {top: 0, right: 0, bottom: 0, left: 0};
    width = +svg.node().getBoundingClientRect().width - margin.left - margin.right;
    height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;
    g = svg.append("g")
        .attr("transform",
            "translate(" + 0+ "," + 0 + ")");
    link = g
        .append("g")
        .selectAll(".link");
    node = g
        .append("g")
        .selectAll(".node");

    sim = simulation(width, height);
    /*
    zooming = d3.zoom()
        .on("zoom", function(){
            scale = d3.event.transform.k;
            transX = d3.event.transform.x;
            transY = d3.event.transform.y;
            //scale = scale + zoomStep;
            sim.restart();
        });
    
    d3.select("#reset_zoom_div")
        .on("click", resetZoom);

    d3.select("#reheat_div")
        .on("click", reheat); 

    svg.call(zooming);
    svg.call(zooming.transform, d3.zoomIdentity.translate(400, 400));
	*/
}