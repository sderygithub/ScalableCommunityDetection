
var WordNetwork = function() {

  var w = 600;
  var h = 300;

  var keyc = true, keys = true, keyt = true, keyr = true, keyx = true, keyd = true, keyl = true, keym = true, keyh = true, key1 = true, key2 = true, key3 = true, key0 = true

  var focus_node = null, highlight_node = null;

  var text_center = false;
  var outline = false;

  var min_score = 0;
  var max_score = 1;

  var fill = d3.scale.category20();

  var color = d3.scale.linear()
    .domain([min_score, (min_score+max_score)/2, max_score])
    .range(["lime", "yellow", "red"]);

  var highlight_color = "blue";
  var highlight_trans = 0.3;
    
  var size = d3.scale.pow().exponent(1)
    .domain([1,100])
    .range([8,24]);
      
  var force = d3.layout.force()
    .linkDistance(60)
    .charge(-300)
    .size([w,h]);

  var default_node_color = "#ccc";
  //var default_node_color = "rgb(3,190,100)";
  var default_link_color = "#D7D7D7";
  var nominal_base_node_size = 8;
  var nominal_text_size = 10;
  var max_text_size = 24;
  var nominal_stroke = 1.5;
  var max_stroke = 4.5;
  var max_base_node_size = 36;
  var min_zoom = 0.1;
  var max_zoom = 7;
  var svg = d3.select("#viewport").append("svg")
              .on("mousedown", mousedown);
  var zoom = d3.behavior.zoom().scaleExtent([min_zoom,max_zoom])
  // 
  var g;
  svg.style("cursor","move");
  // 
  var linkedByIndex = {};
  var circle;
  var nodes = force.nodes(),
      links = force.links(),
      node = svg.selectAll(".node"),
      link = svg.selectAll(".link"),
      text = svg.selectAll(".text");
  var tooltip;

  var tocolor = "fill";
  var towhite = "stroke";
  
  function mousedown() {
    //var point = d3.mouse(this),
    //    node = {x: point[0], y: point[1]},
    //    n = nodes.push(node);

    // add links to any nearby nodes
    //nodes.forEach(function(target) {
     // var x = target.x - node.x,
      //    y = target.y - node.y;
      //if (Math.sqrt(x * x + y * y) < 30) {
       // links.push({source: node, target: target});
     // }
    //});
    //restart();
  };
  function restart() {
    //
    link = link.data(links);
    link.enter().insert("line", ".node")
        .attr("class", "link");
    //
    node = node.data(nodes);
    node.enter().insert("circle", ".cursor")
        .attr("class", "node")
        .attr("r", 5)
        .call(force.drag);
    //
    force.start();
  };

  // 
  var that = {
    clear:function() {
      d3.selectAll("svg").remove();
    },
    add:function(n,e) {
      //node = 
      //n = nodes.push(node);
      //links.push({source: node, target: target});
      //restart();
    },
    load:function(jsonfile){
      //
      d3.json(jsonfile, function(error, graph) {
        g = svg.append("g");

        //
        graph.links.forEach(function(d) {
          linkedByIndex[d.source + "," + d.target] = true;
        });
          
          console.log(graph)

        force
          .nodes(graph.nodes)
          .links(graph.links)
          .start();

        nodes = force.nodes()
        links = force.links()

        var div = d3.select("body")
            .append("div")   
            .attr("class", "tooltip")               
            .style("opacity", 0)
            .on("mouseout", function() {
              alert('mousein')
              //div.transition()
              //   .duration(200)      
              //   .style("opacity", 0);
            })

        link = g.selectAll(".link")
          .data(graph.links)
          .enter().append("line")
          .attr("class", "link")
          .style("stroke-width",nominal_stroke)
          .style("stroke", function(d) { 
          if (isNumber(d.score) && d.score>=0) return color(d.score);
          else return default_link_color; })

        node = g.selectAll(".node")
          .data(graph.nodes)
          .enter().append("g")
          .attr("class", "node")    
          .call(force.drag)

        node.on("dblclick.zoom", function(d) { 
          d3.event.stopPropagation();
          var dcx = (w/2-d.x*zoom.scale());
          var dcy = (h/2-d.y*zoom.scale());
          zoom.translate([dcx,dcy]);
            g.attr("transform", "translate("+ dcx + "," + dcy  + ")scale(" + zoom.scale() + ")");
        });

        if (outline) {
          tocolor = "stroke"
          towhite = "fill"
        }
          
        circle = node.append("path")
          .attr("d", d3.svg.symbol()
            .size(function(d) { 
              return 20 * Math.log(d.citation * 100000); })
            .type(function(d) { return d.type; }))
          .style(tocolor, function(d) {
            if (isNumber(d.community)) return fill(d.community);
            else return default_node_color;
          })
          .style("stroke-width", nominal_stroke)
          .style(towhite, "white");
                      
        text = g.selectAll(".text")
          .data(graph.nodes)
          .enter().append("text")
          .attr("dy", ".35em")
          .style("font-size", function(d) { 
            return 20 * d.citation + "px";
          })
          .style("opacity", function(d) { return d.size/10 })

        if (text_center)
          text.text(function(d) { 
            return d.name;
          })
          .style("text-anchor", "middle");
        else
          text.attr("dx", function(d) {
            return (size(d.size)||nominal_base_node_size);
          })
          .text(function(d) { return d.name; });

        // Node mouse behaviour
        node.on("mouseover", function(d) {
          that.set_highlight(d);
          div.transition()        
            .duration(200)      
            .style("opacity", .9);
          div.html(d.name + '<br/><a href="http://google.com">Link</a>')  
            .style("left", (d3.event.pageX) + "px")     
            .style("top", (d3.event.pageY - 28) + "px");        
        })
        .on("mousedown", function(d) { 
          d3.event.stopPropagation();
          focus_node = d;
          that.set_focus(d)
          if (highlight_node === null) that.set_highlight(d)
        })
        .on("mouseout", function(d) {
          that.exit_highlight();
        });

        d3.select(window).on("mouseup", function() {
          if (focus_node!==null) {
            focus_node = null;
            if (highlight_trans<1) {
              circle.style("opacity", 1);
              text.style("opacity", 1);
              link.style("opacity", 1);
            }
          }
          if (highlight_node === null) that.exit_highlight();
        });

        zoom.on("zoom", function() {        
          var stroke = nominal_stroke;
          if (nominal_stroke * zoom.scale() > max_stroke) stroke = max_stroke/zoom.scale();
          link.style("stroke-width",stroke);
          circle.style("stroke-width",stroke);
          
          // Adjust circle radius
          var base_radius = nominal_base_node_size;
          //if (nominal_base_node_size * zoom.scale() > max_base_node_size) base_radius = max_base_node_size/zoom.scale();
            circle.attr("d", d3.svg.symbol()
            .size(function(d) { 
              return 20 * Math.log(d.citation * 100000);
              //Math.PI*Math.pow(size(d.size)*base_radius/nominal_base_node_size||base_radius,2);
            })
            .type(function(d) { return d.type; }))
          
          if (!text_center) {
            text.attr("dx", function(d) {
              return (size(d.size)*base_radius/nominal_base_node_size||base_radius);
            });
          }

          // Adjust text size
          var text_size = nominal_text_size;
          if (nominal_text_size*zoom.scale() > max_text_size) {
            text_size = 20 * d.citation * zoom.scale();
            text.style("font-size", text_size + "px");
          }

          g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        });
           
        svg.call(zoom);     
        resize();

        d3.select(window).on("resize", resize).on("keydown", keydown);
            
        force.on("tick", function() {
          node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
          text.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
          //tooltip.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

          link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
              
          node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
        });
        
        function resize() {
          var width = document.getElementById("viewport").offsetWidth;
          var height = 500;//document.getElementById("viewport").offsetHeight;
          svg.attr("width", width).attr("height", height);
          
          force.size([force.size()[0]+(width-w)/zoom.scale(),force.size()[1]+(height-h)/zoom.scale()]).resume();
          w = width;
          h = height;
        }
          
        function keydown() {
          // Space-bar
          if (d3.event.keyCode == 32) {
            force.stop();
          }
          else if (d3.event.keyCode>=48 && d3.event.keyCode<=90 && !d3.event.ctrlKey && !d3.event.altKey && !d3.event.metaKey) {
            switch (String.fromCharCode(d3.event.keyCode)) {
              case "C": keyc = !keyc; break;
              case "S": keys = !keys; break;
              case "T": keyt = !keyt; break;
              case "R": keyr = !keyr; break;
              case "X": keyx = !keyx; break;
              case "D": keyd = !keyd; break;
              case "L": keyl = !keyl; if (keyl == 1) { keym = 0; keyh = 0; } break;
              case "M": keym = !keym; if (keym == 1) { keyl = 0; keyh = 0; } break;
              case "H": keyh = !keyh; if (keyh == 1) { keyl = 0; keym = 0; } break;
              case "1": key1 = !key1; break;
              case "2": key2 = !key2; break;
              case "3": key3 = !key3; break;
              case "0": key0 = !key0; break;
            }
            // 
            //link.style("display", function(d) {
              //var flag = vis_by_type(d.source.type)&&vis_by_type(d.target.type) && vis_by_node_citation(d.citation) && vis_by_node_citation(d.targetcitation) && vis_by_link_score(d.score);
              //linkedByIndex[d.source.index + "," + d.target.index] = flag;
              //return flag ? "inline" : "none";
            //});
            // 
            //node.style("display", function(d) {
              //return (that.key0||that.hasConnections(d))&&vis_by_type(d.type) && vis_by_node_citation(d.citation) ? "inline" : "none";
            //});
            // 
            //text.style("display", function(d) {
              //return (that.key0||that.hasConnections(d)) && vis_by_node_citation(d.citation) ? "inline" : "none";
            //});
            // 
            if (highlight_node !== null) {
              if ((key0||that.hasConnections(highlight_node))&&vis_by_type(highlight_node.type)&&vis_by_node_citation(highlight_node.citation)) { 
                if (focus_node!==null) that.set_focus(focus_node);
                that.set_highlight(highlight_node);
              }
              else {
                that.exit_highlight();
              }
            }
          }   
        }
      });
      // Return self
      return that;
    },
    set_highlight:function(d) {
      svg.style("cursor","pointer");
      if (focus_node !== null) d = focus_node;
      highlight_node = d;
      //
      if (highlight_color != "white") {
        circle.style(towhite, function(o) {
          return that.isConnected(d, o) ? highlight_color : "white";
        });
        text.style("font-weight", function(o) {
          return that.isConnected(d, o) ? "bold" : "normal";
        });
        link.style("stroke", function(o) {
          return o.source.index == d.index || o.target.index == d.index ? highlight_color : ((isNumber(o.score) && o.score>=0)?color(o.score):default_link_color);
        });
      }
    },
    exit_highlight:function() {
      highlight_node = null;
      if (focus_node===null) {
        svg.style("cursor","move");
        if (highlight_color!="white") {
          circle.style(towhite, "white");
          text.style("font-weight", "normal");
          link.style("stroke", function(o) {return (isNumber(o.score) && o.score>=0)?color(o.score):default_link_color});
        }
      }
    },
    set_focus:function(d) {   
      if (highlight_trans<1) {
        circle.style("opacity", function(o) {
          return that.isConnected(d, o) ? 1 : highlight_trans;
        });
        text.style("opacity", function(o) {
          return that.isConnected(d, o) ? 1 : highlight_trans;
        });
        link.style("opacity", function(o) {
          return o.source.index == d.index || o.target.index == d.index ? 1 : highlight_trans;
        });     
      }
    },
    isConnected:function(a, b) {
      return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
    },
    hasConnections:function(a) {
      for (var property in linkedByIndex) {
        s = property.split(",");
        if ((s[0] == a.index || s[1] == a.index) && linkedByIndex[property])                    return true;
      }
      return false;
    }
  }

  function vis_by_type(type) {
    switch (type) {
      case "circle": return keyc;
      case "square": return keys;
      case "triangle-up": return keyt;
      case "diamond": return keyr;
      case "cross": return keyx;
      case "triangle-down": return keyd;
      default: return true;
    }
  }

  function vis_by_node_citation(citation) {
    if (isNumber(citation)) {
      if (keyh == 1) return (citation >= 10000);
      else if (keym == 1) return (citation >= 2000);
      else if (keyl == 1) return (citation >= 0) ;
    }
    return true;
  }

  function vis_by_link_score(score) {
    if (isNumber(score)) {
      if (score>=0.666) return key3;
      else if (score>=0.333) return key2;
      else if (score>=0) return key1;
    }
    return true;
  }

  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  // 
  return that;
}

