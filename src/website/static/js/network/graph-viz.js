
var SocialNetwork = function() {

  var w = document.getElementById("d3-canvas").width;
  var h = document.getElementById("d3-canvas").height;

  var keyc = true, keys = true, keyt = true, keyr = true, keyx = true, keyd = true, keyl = true, keym = true, keyh = true, key1 = true, key2 = true, key3 = true, key0 = true

  var focus_node = null, highlight_node = null;

  var text_center = true;
  var text_opacity = 1.0;
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

  var default_node_color = "#ccc";
  //var default_node_color = "rgb(3,190,100)";
  var default_link_color = "#ccc";
  var nominal_base_node_size = 8;
  var nominal_text_size = 10;
  var max_text_size = 24;
  var nominal_stroke = 2.0;
  var link_opacity = 0.9
  var max_stroke = 4.5;
  var max_base_node_size = 36;
  var min_zoom = 0.001;
  var max_zoom = 25;
  var svg = d3.select("#viewport").append("svg")
              .on("mousedown", mousedown);
  var zoom = d3.behavior.zoom().scaleExtent([min_zoom,max_zoom])
  var zoomfactor = 0.1;

  var value_slider = $("#value_slider");
  var current_sizeencoding = 3;
  
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
      link = svg.selectAll(".link"),
      text = svg.selectAll(".text");
  var tooltip_visible = 0;

  var tocolor = "fill";
  var towhite = "stroke";


  var circle_size_function = function(d,attr) {
    if (attr == 1) return 10 + Math.pow(Math.log(d.numberofcitations),4);
    else if (attr == 2) return 10 + Math.pow(Math.log(d.i10index),6);
    else if (attr == 3) return 10 + Math.pow(Math.log(d.hindex),6);
    else if (attr == 4) return 10 + 100000 * (d.betweenness);
    else if (attr == 5) return 10 + 100000 * (d.centrality);
    else return 10;
  }

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
      zoom = d3.behavior.zoom().scaleExtent([min_zoom,max_zoom])

      d3.json(jsonfile, function(error, graph) {
        g = svg.append("g");

        var force = d3.layout.force()
          .nodes(nodes)
          .linkDistance(function(d) {
            a = d.source;
            b = d.target;
            if (a.community == b.community) return 50;
            else return 1000;
          })
          //.charge(-500)
          .charge(function(d) {
            return -50 * d.hindex;
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

        link = g.selectAll(".link")
          .data(graph.links)
          .enter().append("line")
          .attr("class", "link")
          .style("stroke-width",nominal_stroke)
          .style("stroke", function(d) {
            if (isNumber(d.score) && d.score>=0) return color(d.score);
            else return default_link_color; 
          })
          .style("opacity", link_opacity)

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
              if (isNumber(d.betweenness)) return 10 + 100000 * (d.betweenness);
              else if (isNumber(d.numberofcitations)) return Math.pow(Math.log(d.numberofcitations),4);
              else return 500;
            })
            .type(function(d) { return d.type; }))
          .style(tocolor, function(d) {
            if (isNumber(d.community)) return fill(d.community);
            else if (isNumber(d.group)) return fill(d.group);
            else return default_node_color;
          })
          .style("stroke-width", nominal_stroke)
          .style(towhite, "white");
                      
        text = g.selectAll(".text")
          .data(graph.nodes)
          .enter().append("text")
          .attr("dy", ".35em")
          .style("opacity", function(d) { 
            return text_opacity })

        if (text_center)
          text.text(function(d) { 
            return d.name;
          })
          .style("text-anchor", "middle");
        else
          text.attr("dx", function(d) {
            return (size(d.size));
          })
          .attr("dy", function(d) {
            return (size(d.size));
          })
          .text(function(d) {
            return d.name;
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
          div.html('<div class="row"><div class="col-md-4"> \
            <strong>' + d.name + '</strong><br/>' + '<a href="http://google.com/citations?user=' + d.gs_id + '&hl=en" target="_blank">Link to Google Scholar</a> \
            <br/>Number of citations: ' + d.numberofcitations + ' \
            <br/>hIndex: ' + d.hindex + ' \
            <br/>i10Index: ' + d.i10index + ' \
            </div> <div class="col-md-6"> \
            Cluster ' + d.community + ' \
            <br/>Shared Keywords: ' + d.community_mfw + ' \
            <br/>Personal Keywords: ' + d.fieldofstudy + '</div></div>')
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
              circle.style("opacity", 1);
              text.style("opacity", text_opacity);
              link.style("opacity", 1);
            }
          }
          if (highlight_node === null) that.exit_highlight();
        });

        zoom.on("zoom", function() {
          g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        });
        svg.call(zoom);     
        
        var dcx = (w/2-0*zoomfactor);
        var dcy = (h/2-0*zoomfactor);
        zoom.translate([dcx,dcy]);
        zoom.scale(zoomfactor).event(d3.select("#viewport"));
        g.attr("transform", "translate("+ dcx + "," + dcy  + ")scale(" + zoomfactor + ")");
        
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
            if (upperbound == 50000) upperbound = 1000000
            // Filter links
            link.style("display", function(d) {
              var sourcevalid = d.source.numberofcitations >= lowerbound && d.source.numberofcitations <= upperbound;
              var targetvalid = d.target.numberofcitations >= lowerbound && d.target.numberofcitations <= upperbound;
              var flag = sourcevalid && targetvalid;
              linkedByIndex[d.source.index + "," + d.target.index] = flag;
              return flag ? "inline" : "none";
            });
            
            node.style("display", function(d) {
              return d.numberofcitations >= lowerbound && d.numberofcitations <= upperbound ? "inline" : "none";
            });
            
            text.style("display", function(d) {
              return d.numberofcitations >= lowerbound && d.numberofcitations <= upperbound ? "inline" : "none";
            });
        });

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
          var height = 600;//document.getElementById("viewport").offsetHeight;
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
      circle.attr("d", d3.svg.symbol().size(function(d) { return circle_size_function(d,attr); }))

      if (attr == 1) {
        text.style("font-size", function(d) { return 5 + 0.001 * (Math.pow(Math.log(d.numberofcitations),4)); + "px"; })
      } else if (attr == 2) {
        text.style("font-size", function(d) { return 5 + 0.001 * (Math.pow(Math.log(d.i10index),6)); + "px"; })
      } else if (attr == 3) {
        text.style("font-size", function(d) { return 5 + 0.001 * (Math.pow(Math.log(d.hindex),6)); + "px"; })
      } else if (attr == 4) {
        text.style("font-size", function(d) {  return 5 + 0.001 * (100000 * (d.betweenness)); + "px"; })
      } else if (attr == 5) {
        text.style("font-size", function(d) {  return 5 + 0.001 * (100000 * (d.centrality)); + "px"; })
      }
      current_sizeencoding = attr;
    },
    centeron:function(d) {
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
          return o.source.index == d.index || o.target.index == d.index ? highlight_color : ((isNumber(o.score) && o.score>=0)?color(o.score):default_link_color);
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
          link.style("stroke", function(o) {return (isNumber(o.score) && o.score>=0)?color(o.score):default_link_color});
        }
      }
    },
    set_focus:function(d) {   
      if (d == null) {
        circle.style("opacity", function(o) { return 1; });
        text.style("opacity", function(o) { return text_opacity; });
        link.style("opacity", function(o) { return link_opacity; });
      } else {
        if (highlight_trans < 1) {
          circle.style("opacity", function(o) {
            return that.isConnected(d, o) ? 1 : highlight_trans;
          });
          text.style("opacity", function(o) {
            return that.isConnected(d, o) ? text_opacity : highlight_trans;
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

