  var w = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName('body')[0];

  var width = 800;
  var height = 500;

  // Interaction variables
  var focus_node = null, highlight_node = null;
  var text_center = false;
  var outline = false;
  var highlight_color = "blue";
  var highlight_trans = 0.1;

  var default_node_color = "#ccc";
  var default_link_color = "#D7D7D7";
  
  //
  var fill = d3.scale.category20();

  var force = d3.layout.force()
      .size([width, height])
      .charge(-400)
      .linkDistance(40)
      .on("tick", tick);

  var drag = force.drag()
      .on("dragstart", dragstart);

  var svg = d3.select("#viewport")
    .append("div")
    .classed("svg-container", true)
    .append("svg:svg")
      .attr("pointer-events", "all")
    .append('svg:g')
      //s.call(d3.behavior.zoom().on("zoom", redraw))
    .append('svg:g');

//  svg.append('svg:rect')
//      .attr('width', width)
//      .attr('height', height)
//      .attr('fill', 'white');

//  var svg = d3.select("body").append("svg")
//      .attr("width", width)
//      .attr("height", height);

  var link = svg.selectAll(".link");
  var node = svg.selectAll(".node");
  var text = svg.selectAll("text.label");
  
  d3.json("../static/maps/richclubs/graph.json", function(error, graph) {

    var linkedByIndex = {};
    graph.links.forEach(function(d) {
      linkedByIndex[d.source + "," + d.target] = true;
    });

    function isConnected(a, b) {
      return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
    }

    function hasConnections(a) {
      for (var property in linkedByIndex) {
          s = property.split(",");
          if ((s[0] == a.index || s[1] == a.index) && linkedByIndex[property]) 
            return true;
      }
      return false;
    }

    force
      .nodes(graph.nodes)
      .links(graph.links)
      .start();

    link = link.data(graph.links)
      .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(d.value); })
      //.style("opacity", 0.5)
      .style("color", function(d) { return default_node_color })
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    // var node = svg.append("g")
    //   .attr("class", "nodes")
    //   .selectAll("circle")
    //   .data(graph.nodes)
    //   .enter()
    //   .append("g")
    //   .attr("transform", function(d, i) {
    //      return "translate(" + d.x + "," + d.y + ")"; 
    //   });
    
    // // Add a circle element to the previously added g element.
    // node.append("circle")
    //   .attr("class", "node")
    //   .attr("r", function(d) {  return d.size; })
    //   .style("fill", function(d) { return fill(d.group); });

    // // Add a text element to the previously added g element.
    // node.append("text")
    //   .attr("text-anchor", "middle")
    //   .text(function(d) {
    //     return d.name;
    //   });


    node = node.data(graph.nodes)
     .enter().append("circle")
     .attr("class", "node")
     .attr("cx", function(d) { return d.x; })
     .attr("cy", function(d) { return d.y; })
     .attr("r", function(d) {  return d.size; })
     .style("fill", function(d) { return fill(d.group); })
     .style("opacity", 0.5)
     .on("dblclick", dblclick)
     .call(force.drag);
    
    var circle = node.append("path")
      .attr("d", d3.svg.symbol()
        .size(function(d) { return Math.PI*Math.pow(size(d.size)||nominal_base_node_size,2); })
        .type(function(d) { return d.type; }))
        .style(tocolor, function(d) { 
          if (isNumber(d.score) && d.score>=0) return color(d.score);
          else return default_node_color; 
        })
        .style("stroke-width", nominal_stroke)
        .style(towhite, "white");

    node.on("mouseover", function(d) { set_highlight(d); })
        .on("mouseout", function(d) { exit_highlight(); });

    //if (highlight_node === null) exit_highlight();
    //});

   text = text.data(graph.nodes)
     .enter().append("text")
     .attr("class", "label")
     .attr("fill", "black")
     .attr("dy", ".35em")
     .attr("text-anchor", "middle")
     .text(function(d) { return d.name; })
     .style("font", function(d) { return  d.size * 2 + "px sans-serif"; })
     //.style("text-shadow", "#EEEE00 0 0 10px")
     .style("opacity", 0.7)
     .on("dblclick", dblclick)
     .call(force.drag);
  });

  function exit_highlight() {
    highlight_node = null;
    if (focus_node===null) {
      svg.style("cursor","move");
      if (highlight_color!="white") {
        circle.style(towhite, "white");
        text.style("font-weight", "normal");
        link.style("stroke", function(o) {return (isNumber(o.score) && o.score>=0)?color(o.score):default_link_color});
      }
    }
  }

  function set_highlight(d) {
    svg.style("cursor","pointer");
    if (focus_node !== null) d = focus_node;
    highlight_node = d;

    if (highlight_color != "white") {
        circle.style(towhite, function(o) {
          return isConnected(d, o) ? highlight_color : "white";
        });
        text.style("font-weight", function(o) {
          return isConnected(d, o) ? "bold" : "normal";
        });
        link.style("stroke", function(o) {
          return o.source.index == d.index || o.target.index == d.index ? highlight_color : ((isNumber(o.score) && o.score>=0)?color(o.score):default_link_color);
        });
    }
  }

  function redraw() {
    //svg.attr("transform",
    //    "translate(" + d3.event.translate + ")"
    //    + " scale(" + d3.event.scale + ")");
  }

  function tick() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    //node.attr("transform", function(d, i) { return "translate(" + d.x + "," + d.y + ")"; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    //text.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  }

  function dblclick(d) {
    d3.select(this).classed("fixed", d.fixed = false);
  }

  function dragstart(d) {
    d3.select(this).classed("fixed", d.fixed = true);
  }

  function updateWindow(){
    //x = w.innerWidth || e.clientWidth || g.clientWidth;
    //y = w.innerHeight|| e.clientHeight|| g.clientHeight;
    //svg.attr("width", x).attr("height", y);
  }

  function resize() {
    /* Update graph using new width and height (code below) */
    //var width = parseInt(d3.select("#viewport").style("width")) - margin*2,
    //    height = parseInt(d3.select("#viewport").style("height")) - margin*2;
    
    
    
  }
  
  d3.select(window).on('resize', resize); 
  