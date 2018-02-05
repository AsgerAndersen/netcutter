function Node(id, degree, features) {
	this.id = id; //type: int
	this.degree = degree;
	this.features = features; //type: object
}

function Link(source, target, weight) {
	this.source = source; //type: int
	this.target = target; //type: int
	this.value = weight; //type: float
}

function Graph(nisolated, nodes, links) {
	this.nisolated = nisolated; //type: int
	this.nodes = nodes; //type: list of Node objects
	this.links = links; //type: list of Link objects
}

function GraphSeq(length, directed, graphs) {
	this.length = length; //type: int
	this.directed = directed; //type: bool
	this.graphs = graphs; //type: list of Graph objects
}


function GraphSeqCutter(nbins, 
						binlength, 
						nlinks, 
						threshold, 
						accumulatelinks = false, 
						directed = false) {

	this.nbins = nbins;
	this.binlength = binlength;
    this.old_binlength = binlength;
	this.nlinks = nlinks;
	this.threshold = threshold;
	this.accumulatelinks = accumulatelinks;
	this.directed = directed;
	this.filter = function(row){return row.rssi >= this.threshold};

    this.cutGraphSeq = function(data) {

        var i = 0;
        var graphs = [];
        
        for (var n = 0; n < this.nbins; n++) {
            
            var bin = [];
            var looping = true;
            while (looping) {
                var row = data[i];
                if (row.ts < (n+1) * this.binlength) {
                    bin.push(row);
                } else {
                    looping = false;
                }
                i++;
            }
            //console.log("bin", bin)
            graphs[n] = this.cutGraph(bin);
        
        }
        //console.log(new GraphSeq(this.nbins, false, graphs))
        return (new GraphSeq(this.nbins, false, graphs))
    }

    this.cutGraph = function(bin) {
        
        var node1key = params["source"];
        var node2key = params["target"];

        var linkcount = {}; 
        //A count of the pairwise number of links between all the users
        //If there a 3 links from user A to user B and 4 links from user B
        //to user A, then - if A < B - the linkcount will save the entry
        //"B: 7" under the object indexed by A.
        
        var degrees = {};
        var links = [];
        var nodes = [];

        for (i=0; i<bin.length; i++) {
            var row = bin[i];
            //console.log(row)
            //console.log(filter(row))
            if (this.filter(row)) {
                //console.log("Passed the test")
                
                var user_id_1 = row[node1key];
                var user_id_2 = row[node2key];

                if (user_id_1 < user_id_2) {
                    var source = user_id_1
                    var target = user_id_2
                } 
                else {
                    var source = user_id_2
                    var target = user_id_1
                }

                if (!linkcount[source]) {
                    linkcount[source] = {};
                }
                if (!linkcount[source][target]) {
                    linkcount[source][target] = 1;
                }
                else {
                    linkcount[source][target] += 1;    
                }
            }
        }
        //console.log("linkcount", linkcount)

        for (var source in linkcount) {
            for (var target in linkcount[source]) {
                if (linkcount[source][target] >= this.nlinks) {

                    if (!degrees[source]) {
                        degrees[source] = 1
                    }
                    else {
                        degrees[source] += 1    
                    }
                    if (!degrees[target]) {
                        degrees[target] = 1
                    }
                    else {
                        degrees[target] += 1    
                    }

                    links.push(new Link(source, target, 0));
                }
            }
        }
        
        for (var key in degrees) {
            nodes.push(new Node(key, degrees[key], null))
        }

       return (new Graph(params["nnodes"] - nodes.length, nodes, links))
    }

    this.configure = function() {

        this.old_binlength = this.binlength;
        this.threshold = $("#threshold_slider").slider("option","value")
        this.binlength = ($("#binlength_slider").slider("option","value"))*60
        this.nlinks = $("#nlinks_slider").slider("option","value")
        //console.log(params.n_scans)
        //console.log("binsize", params.bin_size)

        var time_interval = $("#start_end_slider").slider("option","values")
        var n_bins = Math.floor( ( time_interval[1] - time_interval[0]) * 3600  / this.binlength );
        
        //console.log("n bins", n_bins)
        this.nbins = n_bins;
        //this.start_time = time_interval[0]
        //this.end_time = time_interval[1]

    }
}



