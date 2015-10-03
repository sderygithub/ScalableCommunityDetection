// Draggable Widget
jQuery(function($) {
    var panelList = $('#draggablePanelList');

    panelList.sortable({
        // Only make the .panel-heading child elements support dragging.
        // Omit this to make then entire <li>...</li> draggable.
        handle: '.panel-heading', 
        update: function() {
            $('.panel', panelList).each(function(index, elem) {
                 var $listItem = $(elem),
                     newIndex = $listItem.index();
                 // Persist the new indices
            });
        }
    });
});



var s;
var svg;
var node;
var graph;
var isRunning = true;
var isCommunityView = true;
var color = d3.scale.category20();
var activeColormap = 1;
var activeSize = 1;

var ordinal_color = d3.scale.ordinal()
  .domain([0, 100, 200, 300, 500])
  .range(["#fff","#000","#333"]);

var jetColorScale = d3.scale.linear()
    .domain([0, 0.2, 0.4, 0.6, 0.8, 1])
    .range(["#800000","#FF0000","#FFFF00","#00FFFF","#0000FF","#00008F"]);

var sizeScale = d3.scale.linear()
  .domain([0, 1])
  .range([5,30])

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)")
  var results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function loadCommunityClusterFromJSON(callback) {

}

function loadNodeClusterFromJSON(callback,node) {
  // 
  HoldOn.open({
    theme: 'sk-cube-grid',
    message: '<h3>Loading cluster ...</h3><br><h4>Thank you for your patience</h4>'
  });
  request = '/community_graph_dummy/'
  //request = '/hbase/?search=' + node
  sendXMLHttpRequest(request,callback)
}

// In-house implementation in case trim is not supported..
if(typeof(String.prototype.trim) === "undefined"){
  String.prototype.trim = function() {
    return String(this).replace(/^\s+|\s+$/g, '');
  };
}

function searchForNode(callback) {
  //
  search_node = document.getElementById('search-input').value.trim()
  if (search_node == "") {
    HoldOn.open({
      theme: 'sk-cube-grid',
      message: '<h3>No input to search for</h3><br><h4>Please indicate a node ID</h4>'
    });
    setTimeout(function() {
      HoldOn.close();
    },1000)
  }
  else {
    // Block user interaction while searching and loading graph
    HoldOn.open({
      theme: 'sk-cube-grid',
      message: '<h3>Searching for Node ' + search_node + '</h3><br><h4>Thank you for your patience</h4>'
    });
    //
    loadNodeClusterFromJSON(callback,search_node)
  }
}

function displayNodeSalienceProperties(json) {
  $('#node_salience_properties_div').text("")
  data = JSON.parse(json);
  data.forEach(function (d) {
    if ("label" in d) {
      $('#node_salience_properties_div').append("<h3>" + d['label'] + ": " + d['value'] + "</h3>")
    }
  })
}

function displayNodeGraphProperties(json) {
  $('#node_graph_properties_div').text("")
  data = JSON.parse(json);
  data.forEach(function (d) {
    if ("label" in d) {
      $('#node_graph_properties_div').append("<h3>" + d['label'] + ": " + d['value'] + "</h3>")
    }
  })
}

function displayCommunityProperties(json) {
  $('#community_property_div').text("")
  data = JSON.parse(json);
  data.forEach(function (d) {
    if ("label" in d) {
      $('#community_property_div').append("<h3>" + d['label'] + ": " + d['value'] + "</h3>")
    }
  })
}

function sendXMLHttpRequest(request,callback) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', request, true);
  xobj.onreadystatechange = function () {
    if ( (xobj.status >= 200 && xobj.status < 300 || xobj.status === 304 ) ) {
      callback(xobj.responseText);
      HoldOn.close();
    }
    else {
      HoldOn.open({
        theme: 'sk-cube-grid',
        message: '<h3>An error occured while selecting this node</h3><br><h4>Sorry for any inconvenience and thank you for understanding</h4>',
        textColor: "red"
      });
      setTimeout(function() {
        HoldOn.close();
      },2000)
    }
  };
  xobj.send(null);
}

function setEntityLabel(label) {
  $('#entity_name_div').text("")
  $('#entity_name_div').append("<h4>" + label + "</h4>")      
}

function setCommunityAttributes(d) {
  // Update community properties
  request = '/community_properties/?community_id=' + d.id.toString()
  sendXMLHttpRequest(request,displayCommunityProperties)
  // Update graph properties
  if ("betweenness" in d) {
    json = '[{"label": "Betweenness", "value": ' + d.betweenness + '}, \
             {"label": "Closeness", "value": ' + d.closeness + '}, \
             {"label": "Page Rank", "value": ' + d.pagerank + '}, \
             {"label": "Eigenvector Centrality", "value": ' + d.eigenvector + '}, \
             {"label": "Degree", "value": ' + d.degree + '}]'
            console.log(json)
    displayNodeGraphProperties(json)
  }
  else {
    request = '/node_graph_properties/?community_id=' + d.id.toString()
    sendXMLHttpRequest(request,displayNodeGraphProperties)
  }
  // Update node credential properties
  request = '/node_salience_properties/?community_id=' + d.id.toString()
  sendXMLHttpRequest(request,displayNodeSalienceProperties)
}

function setNodeAttributes(d) { 
  // Update community properties
  request = '/community_properties/?community_id=' + d.id.toString()
  sendXMLHttpRequest(request,displayCommunityProperties)
  // Update graph properties
  request = '/node_graph_properties/?community_id=' + d.id.toString()
  sendXMLHttpRequest(request,displayNodeGraphProperties)
  // Update node credential properties
  request = '/node_salience_properties/?community_id=' + d.id.toString()
  sendXMLHttpRequest(request,displayNodeSalienceProperties)
}

function onNodeClick(d) {
  // Get parameters
  if (isCommunityView == true) {
    // Explore inside the community
    setEntityLabel("Community " + d.label)
    setCommunityAttributes(d)
  } 
  else {
    setEntityLabel("Node " + d.label)
    setNodeAttributes(d)
  }      
}

function onNodeDblClick(d) { 
  if (isCommunityView == true) {
    // Explore inside the community
    loadNodeClusterFromJSON(processD3JSON)
  }
  else {
    // Nothing
  }
}

function processSigmaJSON(json) {
    //
    clearSigmaGraph();
    //
    data = JSON.parse(json)
    //
    s = new sigma({
        graph: data,
        container: 'graph-canvas',
        settings: {
            defaultNodeColor: '#ec5148'
        },
        edges: {
          type: 'curve'
        }
    });
    s.graph.nodes().forEach(function(n) {
        n.originalColor = color(n.community);
        n.color = color(n.community);
        n.size = 1000;
    });
    s.graph.edges().forEach(function(e) {
      e.color = color(4);
      e.type = 'curve';
    })
    // Register for interactive event
    s.bind('clickNode',onNodeClick)
    s.bind('doubleClickNode',onDoubleClickNode)
    

    s.startForceAtlas2({
      worker: true,
      barnesHutOptimize: true, 
      startingIterations: 10, 
      maxIterations: 20,
      avgDistanceThreshold: 0.01});
    //s.forceAtlas2.cooldown();

    document.getElementById('stop-layout').addEventListener('click',function(){
      if(isRunning){
        stopForceLayout()
      } else {
        startForceLayout()
      }
    },true);
    // 
    document.getElementById('rescale-graph').addEventListener('click',function(){
      restartLayout();
    },true);
    // 
    document.getElementById('zoomin-layout').addEventListener('click',function(){
      zoomIn();
    },true);
    document.getElementById('zoomout-layout').addEventListener('click',function(){
      zoomOut();
    },true);
};


var width = document.width;
var height = document.height;



/*
d3.json("../static/graphs/facebook.json", function(error, graph) {
  if (error) throw error;
  console.log(graph)
  force
      .nodes(graph.nodes)
      .links(graph.edges)
      .start();

  var link = svg.selectAll(".link")
      .data(graph.edges)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return 2; });

  var node = svg.selectAll(".node")
      .data(graph.nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", 5)
      .style("fill", function(d) { return color(d.community); })
      .call(force.drag);

  node.append("title")
      .text(function(d) { return d.label; });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  });
});
*/

function redraw() {
  if (d3.event != null) {
    svg.attr("transform",
        "translate(" + d3.event.translate + ")"
        + " scale(" + d3.event.scale + ")");
  }
}

function processD3JSON(json) {
    //if (error) throw error;
    clearD3Graph()

    width = document.width;
    height = document.height;

    var force = d3.layout.force()
        .charge(-120)
        .linkDistance(160)
        .size([width, height]);

    svg = d3.select("#graph-canvas")
      .append("svg:svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.behavior.zoom()
          .on("zoom", redraw))
          .on("dblclick.zoom", null)
      .append("svg:g");

    graph = JSON.parse(json)
    
    force
        .nodes(graph.nodes)
        .links(graph.edges)
        .start();

    var link = svg.selectAll(".link")
        .data(graph.edges)
      .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function(d) { return 1; });
        //Math.sqrt(d.value);

    node = svg.selectAll(".node")
        .data(graph.nodes)
      .enter().append("circle")
        .attr("class", "node")
        .attr("r", function(d) { return d.size; })
        .style("stroke-width", function(d) { return 0; })
        .style("fill", function(d) { return color(d.community); })
        .call(force.drag)
        .on("dblclick", function(d) {
          onNodeDblClick(d);
        })
        .on("click", function(d) {
          onNodeClick(d);
        })

    node.append("title")
        .text(function(d) { return d.id; });

    force.on("tick", function() {
      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    });
}

function activeProperty(d,node_property) {
  if (node_property == "1") return d.community;
  else if (node_property == "2") return d.betweenness;
  else if (node_property == "3") return d.closeness;
  else if (node_property == "4") return d.eigenvector;
  else if (node_property == "5") return d.degree;
  else return 0
}

function updateScale(node_property) {
  min = 99999;
  max = -99999;
  property_value = 0;
  graph.nodes.forEach(function(d) {
    property_value = activeProperty(d,node_property)
    if (property_value < min) min = property_value
    if (property_value > max) max = property_value
  })
  jetColorScale = d3.scale.linear()
    .domain([min,min+(max-min)*0.2,min+(max-min)*0.4,min+(max-min)*0.6,min+(max-min)*0.8,max])
    .range(["#00008F","#0000FF","#00FFFF","#FFFF00","#FF0000","#800000"]);
  sizeScale = d3.scale.linear()
    .domain([min,max])
    .range([5,30])
}

function activeColormapProperty(d,node_property) {
  return jetColorScale(activeProperty(d,node_property))
}

function activeSizeProperty(d,node_property) {
  var value = activeProperty(d,node_property)
  if (isNaN(value)) value = 1
  return sizeScale(value)
}

function applyStyle(node_style,callback) {
  node_property = document.getElementById('colormap_selector_id').value
  if (graph != null) {
    // Update Scale
    updateScale(node_property)
    // Update nodes
    d3.selectAll("circle").style(node_style, function(d) {
        return callback(d,node_property)
    });
  }
}

function applyAttr(node_attr,callback) {
  node_property = document.getElementById('size_selector_id').value
  if (graph != null) {
    // Update Scale
    updateScale(node_property)
    // Update nodes
    d3.selectAll("circle").attr(node_attr, function(d) {
        return callback(d,node_property)
    });
  }
}

function clearD3Graph() {
  resetCanvas()
}

function clearSigmaGraph() {
  if (s != undefined) {
    // Some instabilities with Force layout have been noted on the web.. Better to stop it first
    stopForceLayout();
    // Clear graph
    s.graph.clear();
    // Reset the HTML content
    resetSigma()
    // Kill will effectively make it unusable.. Just don't
    // s.kill();
  } 
}

function resetCanvas() {
  $('#graph-canvas').remove(); 
  $('#graph-parent').html('<div id="graph-canvas" lass marginwidth="0" marginheight="0"></div>');
}

function stopForceLayout() {
  if (s != undefined) {
    isRunning = false;
    s.stopForceAtlas2();
    document.getElementById('stop-layout').childNodes[0].nodeValue = 'Start Layout';
    document.getElementById('stop-layout').childNodes[0].setAttribute('class','fa fa-play fa-2x')
  }
}

function startForceLayout() {
  if (s != undefined) {
    isRunning = true;
    s.startForceAtlas2();
    document.getElementById('stop-layout').childNodes[0].nodeValue = 'Stop Layout';
    document.getElementById('stop-layout').childNodes[0].setAttribute('class','fa fa-pause fa-2x')
  }
}

function restartLayout() {
  if (s != undefined) {
    s.camera.goTo({ x:0, y: 0, angle: 0, ratio: 1 });
  }
}

function zoomIn() {
  if (s != undefined) {
    s.camera.goTo({ratio: s.camera.ratio / 2});
  }
}

function zoomOut() {
  if (s != undefined) {
    s.camera.goTo({ratio: s.camera.ratio * 2});
  }
}