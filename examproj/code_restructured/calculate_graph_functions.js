var graph_functions = {
    statistics: [
        {   
            name: "Average Degree", 
            method: function(links, nodes, i) { return averageDegree(links[i]);},
            values: [],
            line: null,
            start_on: true,
            format: ".3f",
            tickFormat: ".1f",
            line: 0
        },
        {
            name: "Number of links", 
            method: function(links, nodes, i) {return links[i].length;},
            values: [],
            start_on: false,
            line: null
        },
        {   
            name: "Number of isolated nodes", 
            method: function(links, nodes, i) { return isolatedNodes(nodes[i]); },
            values: [],
            start_on: false,
            line: null
        },
        {   
            name: "Link growth (absolute)", 
            method: function(links, nodes, i) {return linksGrowthAbs(links, i)},
            values: [],
            start_on: false,
            line: 0
        },
        {   
            name: "Link growth (relative)", 
            method: function(links, nodes, i) {return linksGrowthRel(links, i)},
            values: [],
            start_on: false,
            line: 0,
            format: ".2%",
            tickFormat: ".0%"
        }
    ],
    clustering: [
        {   
            name: "Detect communities",
            clusters: [],
            statistic: {
                name: "Number of communities",
                values: [],
                line: null
            }
        }
    ]
}

//---------------------------------------------------------------------
//Calculate the descriptive graph statistics, which should be visualized in the step charts
//

function calculateGraphFunctions() { //links, nodes, statistic

    detectCommunities()
    console.log(graph_functions.clustering[0])

    for (j=0; j<graph_functions.statistics.length; j++) {
        //console.log(j)
        statistic = graph_functions.statistics[j]
        statistic.values = []
        //console.log("hi", statistic)
        for (var i=0; i<graph_seq.links.length; i++) {
            statistic.values.push(statistic.method(graph_seq.links, graph_seq.nodes, i));
        }
        //console.log(statistic.values)
    }
}

//------------------------------------------------------------------------
//Methods for calculating graph statistics

function averageDegree(links) {
    var n_nodes = data_props.nodes;
    return 2*links.length / n_nodes;
}

function isolatedNodes(nodes) {
    return (data_props.nodes - nodes.length)
}

function linksGrowthAbs(links, i) { 
    if (i==0) {return 0}
    else {return links[i].length - links[i-1].length}
}

function linksGrowthRel(links, i) { 
    if (i==0) {return 0}
    else {return (((links[i].length / links[i-1].length) - 1))}
}

//-----------------------------------------------------------------------
//Methods for calculating graph clusters

function detectCommunities() {

    //if (document.getElementById("communities_checkbox").checked) {

    var communities = []
    var n_communities = []

    for (n=0; n<graph_seq_params.bins; n++) {
    
        bin_nodes = graph_seq.nodes[n]
        bin_links = graph_seq.links[n]

        var nodes_id_list = [], links_list = [];

        for (i=0; i<bin_nodes.length; i++) {
            nodes_id_list.push(bin_nodes[i].id)
        }

        for (i=0; i<bin_links.length; i++) {
            links_list.push({source: bin_links[i].source, target: bin_links[i].target, weight: 1.})
        }

        if (n==0 || true) { //!document.getElementById("init_part_checkbox").checked) {

            var community = jLouvain().nodes(nodes_id_list)
                                      .edges(links_list)           
        }
        else {
            var community = jLouvain().nodes(nodes_id_list)
                                      .edges(links_list)
                                      .partition_init(visualisation_params.communities[n-1]);
        }

        var community_assignment = community();

        var max_community_number = 0;

        bin_nodes.forEach(function(node) {        
            node.community = community_assignment[node.id]
            max_community_number = max_community_number < community_assignment[node.id] ? community_assignment[node.id]: max_community_number;
        })

        communities.push(community_assignment)
        n_communities.push(max_community_number + 1)
            
        //}

    }
    graph_functions.clustering[0].clusters = communities
    graph_functions.clustering[0].statistic.values = n_communities
}