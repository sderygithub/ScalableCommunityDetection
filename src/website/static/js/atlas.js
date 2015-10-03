
(function(){

  Renderer = function(canvas){
    canvas = $(canvas).get(0)
    var ctx = canvas.getContext("2d")
    var gfx = arbor.Graphics(canvas)
    var particleSystem = null
    
    var palette = {
      "Alpha": "#D68300",
      "SuperiorTemporal": "#4D7A00",
      "Cortex": "#6D87CF",
      "Occipital": "#D4E200",
      "Search": "#D4E200"
    }

    var that = {
      init:function(system){
        particleSystem = system
        particleSystem.screen({padding:[100, 300, 60, 300], // leave some space at the bottom for the param sliders
                              step:.02}) // have the ‘camera’ zoom somewhat slowly as the graph unfolds 
       $(window).resize(that.resize)
       that.resize()
      
       that.initMouseHandling()
      },
      redraw:function(){
        if (particleSystem===null) return

        ctx.clearRect(0,0, canvas.width, canvas.height)
        ctx.strokeStyle = "#d3d3d3"
        ctx.lineWidth = 1
        ctx.beginPath()
        particleSystem.eachEdge(function(edge, pt1, pt2){
          // edge: {source:Node, target:Node, length:#, data:{}}
          // pt1:  {x:#, y:#}  source position in screen coords
          // pt2:  {x:#, y:#}  target position in screen coords

          var weight = null // Math.max(1,edge.data.border/100)
          var color = null // edge.data.color
          if (!color || (""+color).match(/^[ \t]*$/)) color = null

          if (color!==undefined || weight!==undefined){
            ctx.save() 
            ctx.beginPath()

            if (!isNaN(weight)) ctx.lineWidth = weight
            
            if (edge.source.data.region==edge.target.data.region){
              ctx.strokeStyle = palette[edge.source.data.region]
            }
            
            // if (color) ctx.strokeStyle = color
            ctx.fillStyle = null
            
            ctx.moveTo(pt1.x, pt1.y)
            ctx.lineTo(pt2.x, pt2.y)
            ctx.stroke()
            ctx.restore()
          }else{
            // draw a line from pt1 to pt2
            ctx.moveTo(pt1.x, pt1.y)
            ctx.lineTo(pt2.x, pt2.y)
          }
        })
        ctx.stroke()

        particleSystem.eachNode(function(node, pt){
          // node: {mass:#, p:{x,y}, name:"", data:{}}
          // pt:   {x:#, y:#}  node position in screen coords

          // determine the box size and round off the coords if we'll be 
          // drawing a text label (awful alignment jitter otherwise...)
          var w = ctx.measureText(node.data.label||"").width + 6
          var label = node.data.label
          var mass = node.data.mass
          if (!(label||"").match(/^[ \t]*$/)){
            pt.x = Math.floor(pt.x)
            pt.y = Math.floor(pt.y)
          }else{
            label = null
          }
          // 
          ctx.clearRect(pt.x-w/2, pt.y-7, w,14)
          // draw the text
          if (label){
            ctx.font = "bold 11px Arial"
            ctx.textAlign = "center"
            // if (node.data.region) ctx.fillStyle = palette[node.data.region]
            // else ctx.fillStyle = "#888888"
            ctx.fillStyle = "#888888"
            // ctx.fillText(label||"", pt.x, pt.y+4)
            ctx.fillText(label||"", pt.x, pt.y+4)
          }
          gfx.oval(pt.x-mass/2, pt.y-mass/2, mass, mass, {fill:"#888888"})
        })    		
      },
      
      resize:function(){
        // resize the canvas element to fill the screen
        var w = $(window).width();
        var h = $(window).height();
        canvas.width = w;
        canvas.height = h;
        // inform the system so it can map coords for us
        particleSystem.screenSize(w,h)
        that.redraw()
      },

    	initMouseHandling:function(){
        // no-nonsense drag and drop (thanks springy.js)
      	selected = null;
      	nearest = null;
      	var dragged = null;
        var oldmass = 1

        $(canvas).mousedown(function(e){
      		var pos = $(this).offset();
      		var p = {x:e.pageX-pos.left, y:e.pageY-pos.top}
      		selected = nearest = dragged = particleSystem.nearest(p);
      		if (selected.node !== null){
            dragged.node.fixed = true
      		}
      		return false
      	});

      	$(canvas).mousemove(function(e){
          var old_nearest = nearest && nearest.node._id
      		var pos = $(this).offset();
      		var s = {x:e.pageX-pos.left, y:e.pageY-pos.top};
      		nearest = particleSystem.nearest(s);
          if (!nearest) return
      		if (dragged !== null && dragged.node !== null){
            var p = particleSystem.fromScreen(s)
      			dragged.node.p = {x:p.x, y:p.y}
      		}
          return false
      	});

      	$(window).bind('mouseup',function(e){
          if (dragged===null || dragged.node===undefined) return
          dragged.node.fixed = false
          dragged.node.tempMass = 100
      		dragged = null;
      		selected = null
      		return false
      	});
      	      
      },
            
    }
  
    return that
  }

  var Maps = function(elt){
    var sys = arbor.ParticleSystem(4000, 500, 0.5, 55)
    sys.renderer = Renderer("#viewport") // our newly created renderer will have its .init() method called shortly by sys...
    
    var dom = $(elt)    
    var _links = dom.find('ul')

    var _maps = {
      alpha:{title:"Alpha", p:{stiffness:2}},
      cortex:{title:"Cortex", p:{stiffness:2}},
      occipital:{title:"Occipital", p:{stiffness:2}},
      superiortemporal:{title:"Superior Temporal", p:{stiffness:2}},
      search:{title:"Search results", p:{stiffness:2}},
    }
    
    var that = {
      init:function(){
        $.each(_maps, function(stub, map){
          _links.append("<li><a href='#/"+stub+"' class='"+stub+"'>"+map.title+"</a></li>")
        })
        _links.find('li > a').click(that.mapClick)
        _links.find('.alpha').click()
        var opts = {
          lines: 11, // The number of lines to draw
          length: 8, // The length of each line
          width: 5, // The line thickness
          radius: 9, // The radius of the inner circle
          corners: 1, // Corner roundness (0..1)
          rotate: 0, // The rotation offset
          direction: 1, // 1: clockwise, -1: counterclockwise
          color: '#000', // #rgb or #rrggbb or array of colors
          speed: 1, // Rounds per second
          trail: 60, // Afterglow percentage
          shadow: false, // Whether to render a shadow
          hwaccel: false, // Whether to use hardware acceleration
          className: 'spinner', // The CSS class to assign to the spinner
          zIndex: 2e9, // The z-index (defaults to 2000000000)
          top: '50%', // Top position relative to parent
          left: '50%' // Left position relative to parent
        };
        
        that.spinner = new Spinner(opts).spin();
        $("#spinner-div").append(that.spinner.el);
        $("#search-timer").removeClass('fa-spin')
        $("#search-timer").addClass('hidden');
        that.spinner.stop();

        // Textbox new request
        $("#input_search_id").keyup(function(event){
          if(event.keyCode == 13){
            $("#button_search_id").click();
          }
        })        
        // Search click
        $("#button_search_id").click(that.searchClick)
        return that
      },

      searchClick:function(e){
        // Select search results tab
        that.selectMap('search')
        _links.find('li > a').removeClass('active')
        _links.find('.search').addClass('active')
        // Get text to search
        search_input = $('#input_search_id').val();
        // Rotating glyph
        $("#search-timer").addClass('fa-spin')
        $("#search-timer").removeClass('hidden');
        that.spinner.spin();
        // 
        $.getJSON("/word",{search: search_input},function(data){
          // load the raw data into the particle system as is
          // (since it's already formatted correctly for .merge)
          var nodes = data.nodes
          $.each(nodes, function(name, info){
            info.label = name
          })
          sys.merge({nodes:nodes, edges:data.edges})
          sys.parameters(2000)
          $("#search-timer").removeClass('fa-spin')
          $("#search-timer").addClass('hidden');
          that.spinner.stop();
        })
      },
      mapClick:function(e){
        var selected = $(e.target)
        var newMap = selected.attr('class')
        if (newMap in _maps) that.selectMap(newMap)
        _links.find('li > a').removeClass('active')
        selected.addClass('active')
        return false
      },
      selectMap:function(map_id){
        $.getJSON("../static/maps/"+map_id+".json",function(data){
          // load the raw data into the particle system as is
          // (since it's already formatted correctly for .merge)
          var nodes = data.nodes
          $.each(nodes, function(name, info){
            info.label = name
          })
          sys.graft({nodes:nodes, edges:data.edges})
          sys.parameters(2)
        })
      }
    }
    return that.init()
  }
   
  // On load
  $(document).ready(function(){

    var mcp = Maps("#maps")

  })
  
  

  
  
	
})()