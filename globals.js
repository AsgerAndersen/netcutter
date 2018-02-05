var data, graphseq, cutter, svg, g, width, height, sim, link, node; //Consider whether these should be global, or if I should handle them functionally

var params = { //This should not be part of the final code
    "source": "user", //Demand that the uploaded dataframe is encoded with source and target
    "target": "user2", //Demand that the uploaded dataframe is encoded with source and target
    "nnodes": 589 //Count unique users in init
};

var cutterpars_init = {
	binlength: 900,
	starttime: 0,
	endtime: 60*60*24,
	nbins: 96,
	threshold: -90,
	nlinks: 1
}