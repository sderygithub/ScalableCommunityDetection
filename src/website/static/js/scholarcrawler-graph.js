
var SocialNetwork = function() {

  var w = 600;//document.getElementById("viewport").width;
  var h = 600;//document.getElementById("viewport").height;

  var keyc = true, keys = true, keyt = true, keyr = true, keyx = true, keyd = true, keyl = true, keym = true, keyh = true, key1 = true, key2 = true, key3 = true, key0 = true

  var focus_node = null, highlight_node = null;

  var text_center = false;
  var text_opacity = 1.0;
  var outline = false;

  var node_weighted_opacity = true
  var node_weighted_opacity_min = 0.2
  var node_opacity = 1.0;

  var fill = d3.scale.category20c();
  var colores_g = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];

  var highlight_color = "blue";
  var highlight_trans = 0.3;
    
  var size = d3.scale.pow().exponent(1)
    .domain([1,100])
    .range([8,24]);

  var default_node_color = "#ccc";
  var default_link_color = "#ccc";
  var nominal_base_node_size = 8;
  var nominal_text_size = 10;
  var max_text_size = 24;

  // Size of links
  var nominal_stroke = 2.0;
  var link_opacity = 0.9
  var max_stroke = 4.5;
  var max_base_node_size = 36;
  
  var svg = d3.select("#viewport").append("svg").on("mousedown", mousedown);
  
  // Zoom
  var min_zoom = 0.001;
  var max_zoom = 25;
  var zoom = d3.behavior.zoom().scaleExtent([min_zoom,max_zoom])
  var zoomfactor = 15;

  var value_slider = $("#value_slider");
  var current_sizeencoding = 1;

  var circle_size_function = function(d) {
    if (isNumber(d.gs_number_of_citation) == 1) return 10 + 1 * Math.pow(Math.log(d.gs_number_of_citation),5); 
    else return 10;
  }

  var node_color_function = function(d) {
    // Community colour scheme
    color = colores_g[1];
    if (isNumber(d.community) == true) color = fill(d.community);
    return color;
  }

  var node_opacity_function = function(d) {
    opacity = node_opacity;
    if (node_weighted_opacity == true) {
      opacity = d.gs_number_of_citation / 500.0;
      if (opacity > 1.0) opacity = 1.0;
    }
    return opacity;
  }

  var link_color_function = function(d) {
    a = d.source;
    b = d.target;
    if (a.community == b.community) return fill(a.community);
    else return default_link_color; 
  }



  // 
  var g;

 

  svg.style("cursor","move");
  // 
  var linkedByIndex = {};
  var force = d3.layout.force();
  var circle;
  var nodes = force.nodes(),
      links = force.links(),
      node = svg.selectAll(".node"),
      link = svg.selectAll(".path"),
      text = svg.selectAll(".text");
  var tooltip_visible = 0;

  var tocolor = "fill";
  var towhite = "stroke";

  function mousedown() {
    that.exit_highlight();
    that.set_focus(null)
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
    //link.enter().insert("line", ".node")
    //    .attr("class", "link");
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
      zoom = d3.behavior.zoom().scaleExtent([min_zoom,max_zoom])
      zoomfactor = 5;

      d3.json(jsonfile, function(error, graph) {
        g = svg.append("svg:g");

        // build the arrow.
        g.selectAll("marker")
            .data(["end"])      // Different link/path types can be defined here
          .enter().append("svg:marker")    // This section adds in the arrows
            .attr("id", "end-arrow")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 15)
            .attr("refY", -1.5)
            .attr("markerWidth", 3)
            .attr("markerHeight", 3)
            .attr("orient", "auto")
          .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5");

        var force = d3.layout.force()
          .nodes(nodes)
          .linkDistance(function(d) {
            a = d.source;
            b = d.target;
            if (a.community == b.community) return 100;
            else return 1000;
          })
          //.charge(-500)
          .charge(function(d) {
            return -d.gs_number_of_citation;
          })
          .size([w,h]);

        //
        graph.links.forEach(function(d) {
          linkedByIndex[d.source + "," + d.target] = true;
        });
        
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
          .attr("id", "tooltip-div-id")
          .on("mouseenter", function() {
            tooltip_visible = 1;
          })
          .on("mouseleave", function(d) {
            tooltip_visible = 0;
            div.transition()
               .duration(200)
               .style("opacity", 0);
          })

        link = g.selectAll("path")
          .data(graph.links)
          .enter().append("svg:path")
            .attr("class", "link")
            .attr("marker-end", "url(#end-arrow)")
            .style("stroke-width", nominal_stroke)
            .style("stroke", function(d) { return link_color_function(d); })
            .style("opacity", function(d) { return node_opacity_function(d); });

/*
        link = g.selectAll("path")
          .data(graph.links)
          .enter().append("line")
          .attr("class", "link")
          .style("stroke-width", nominal_stroke)
          .style("stroke", function(d) { return link_color_function(d); })
          .style("opacity", function(d) { return node_opacity_function(d); })
*/
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
          .attr("d", d3.svg.symbol().type(function(d) { return d.type; }))
          .style(tocolor, function(d) { return node_color_function(d); })
          .style("opacity", function(d) { return node_opacity_function(d); })
          .style("stroke-width", nominal_stroke)
          .style(towhite, "white");
        
        text = g.selectAll(".text")
          .data(graph.nodes)
          .enter().append("text")
          .attr("dy", ".35em")
          .style("opacity", function(d) { return node_opacity_function(d); })

        if (text_center)
          text.text(function(d) { 
            return d.name;
          })
          .style("text-anchor", "middle");
        else
          text.attr("dx", function(d) {
            return (size(d.size) || nominal_base_node_size);
          })
          .style("text-anchor", "middle")
          .text(function(d) {
            if (d.title != null) return d.title.substring(0, 25) + ' ...';
            else if (d.id != null) return d.id;
          });

        // Node mouse behaviour
        node.on("mouseenter", function(d) {
          that.set_highlight(d);
          // If there is no mouseenter tooltip, make it go away
          setTimeout( function() {
            if (tooltip_visible == 0) {
              div.transition()
                .duration(400)
                .style("opacity", 0.0)
                .disabled
            }
          }, 1000)
          // Transition to visible opacity
          div.transition()
            .duration(200)
            .style("opacity", .9)
            .enabled
          // Update content
          div.html('<div class="row"> \
                      <div class="col-md-6"> \
                        <strong>' + d.sc_title + '</strong>' + '\
                      </div>  \
                    </div>  \
                    <div class="row"> \
                      <div class="col-md-6"> \
                        <br/>Year: ' + d.sc_year + '\
                        <br/>Number of citations: ' + d.gs_number_of_citation + ' \
                      </div> \
                      <div class="col-md-6"> \
                        Level ' + d.level + ' \
                        <br/>Shared Keywords: ' + d.most_frequent_word + ' \
                        <br/>Personal Keywords: ' + d.shared_most_frequent_word + ' \
                      </div> \
                    </div>')
                    .style("left", (d3.event.pageX + 25) + "px")     
                    .style("top", (d3.event.pageY - 25) + "px");

            console.log(d)
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
              circle.style("opacity", function(d) { return node_opacity_function(d); })
              text.style("opacity", function(d) { return node_opacity_function(d); })
              link.style("opacity", 1);
            }
          }
          if (highlight_node === null) that.exit_highlight();
        });

        zoom.on("zoom", function() {
          zoomfactor = d3.event.scale;
          g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        });
        
        svg.call(zoom);     
        resize();

        d3.select(".zoomin").on("click", function (){
            zoomfactor = zoomfactor * 1.1;
            zoom.scale(zoomfactor).event(d3.select("#viewport"));
        });

        d3.select(".zoomout").on("click", function (){
            zoomfactor = zoomfactor * 0.9;
            zoom.scale(zoomfactor).event(d3.select("#viewport"));
        });

        d3.select(".sizeencode_citation").on("click", function(){ that.setsizeencode(1) })
        d3.select(".sizeencode_i10index").on("click", function(){ that.setsizeencode(2) })
        d3.select(".sizeencode_hindex").on("click", function(){ that.setsizeencode(3) })
        d3.select(".sizeencode_betweenness").on("click", function(){ that.setsizeencode(4) })
        d3.select(".sizeencode_centrality").on("click", function(){ that.setsizeencode(5) })

        that.refresh_sizeencode();

        value_slider.on("change", function () {
            var $this = $(this),
                value = $this.prop("value");
                value = value.split(";")
            lowerbound = parseFloat(value[0])
            upperbound = parseFloat(value[1])
            if (upperbound == 1000) upperbound = 1000000
            // Filter links
            link.style("display", function(d) {
              var sourcevalid = d.source.gs_number_of_citation >= lowerbound && d.source.gs_number_of_citation <= upperbound;
              var targetvalid = d.target.gs_number_of_citation >= lowerbound && d.target.gs_number_of_citation <= upperbound;
              var flag = sourcevalid && targetvalid;
              linkedByIndex[d.source.index + "," + d.target.index] = flag;
              return flag ? "inline" : "none";
            });
            
            node.style("display", function(d) {
              return d.gs_number_of_citation >= lowerbound && d.gs_number_of_citation <= upperbound ? "inline" : "none";
            });
            
            text.style("display", function(d) {
              return d.gs_number_of_citation >= lowerbound && d.gs_number_of_citation <= upperbound ? "inline" : "none";
            });
        });
        
        d3.select(window).on("resize", resize).on("keydown", keydown);
        
        force.on("tick", function() {
          node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
          text.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
          //tooltip.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

          link.attr("d", function(d) {
            tr = 0;//circle_size_function(d.target);
            sr = 0;//circle_size_function(d.source);
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" + 
                d.source.x + sr + "," + 
                d.source.y + sr + "A" + 
                dr + "," + dr + " 0 0,1 " + 
                d.target.x + tr + "," + 
                d.target.y + tr;
          });
          /*
          link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
            */  
          node.attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return d.y; });
        });
        
        function resize() {
          var width = document.getElementById("viewport").offsetWidth;
          var height = 600;//document.getElementById("viewport").offsetHeight;
          svg.attr("width", width).attr("height", height);
          
          force.size([force.size()[0]+(width-w)/zoom.scale(),force.size()[1]+(height-h)/zoom.scale()]);
          force.resume();
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
              case "L": keyl = !keyl; break;
              case "M": keym = !keym; break;
              case "H": keyh = !keyh; break;
              case "1": key1 = !key1; break;
              case "2": key2 = !key2; break;
              case "3": key3 = !key3; break;
              case "0": key0 = !key0; break;
            }
          }
        }
      });
      // Return self
      return that;
    },
    refresh_sizeencode:function() {
      that.setsizeencode(current_sizeencoding);
    },
    setsizeencode:function(attr) {
        circle.attr("d", d3.svg.symbol().size(function(d) { return circle_size_function(d); }))

        text.style("font-size", function(d) { 
          if (isNumber(d.gs_number_of_citation) == 1)  return 5 + 2 * Math.log(d.gs_number_of_citation);
          else return 5 + "px";
        })

      current_sizeencoding = attr;
    },
    centeron:function(d) {
      zoomfactor = 1;
      var dcx = (w/2-d.x*zoomfactor);
      var dcy = (h/2-d.y*zoomfactor);
      zoom.translate([dcx,dcy]);
      zoom.scale(zoomfactor).event(d3.select("#viewport"));
      g.attr("transform", "translate("+ dcx + "," + dcy  + ")scale(" + zoomfactor + ")");
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
          return that.isConnected(d, o) ? highlight_color : link_color_function(o);
        });
      }
    },
    exit_highlight:function() {
      highlight_node = null;
      if (focus_node === null) {
        svg.style("cursor","move");
        if (highlight_color!="white") {
          circle.style(towhite, "white");
          text.style("font-weight", "normal");
          link.style("stroke", function(d) { return link_color_function(d); });
        }
      }
    },
    set_focus:function(d) {   
      if (d == null) {
        circle.style("opacity", function(d) { return node_opacity_function(d) });
        text.style("opacity", function(o) { return node_opacity_function(d); });
        link.style("opacity", function(o) { return link_opacity; });
      } 
      else {
        if (highlight_trans < 1) {
          circle.style("opacity", function(o) {
            return that.isConnected(d, o) ? node_opacity_function(d) : highlight_trans;
          });
          text.style("opacity", function(o) {
            return that.isConnected(d, o) ? node_opacity_function(d) : highlight_trans;
          });
          link.style("opacity", function(o) {
            return o.source.index == d.index || o.target.index == d.index ? link_opacity : highlight_trans;
          });     
        }
      }
    },
    isConnected:function(a, b) {
      return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
    },
    hasConnections:function(a) {
      for (var property in linkedByIndex) {
        s = property.split(",");
        if ((s[0] == a.index || s[1] == a.index) && linkedByIndex[property]) return true;
      }
      return false;
    }
  }

  

  function vis_by_node_citation(citation) {
    if (isNumber(citation)) {
      if (keyh == 1) return (citation >= 10000);
      else if (keym == 1) return (citation >= 2000);
      else if (keyl == 1) return (citation >= 0);
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

