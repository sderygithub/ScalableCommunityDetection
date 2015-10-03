
(function(){

  var Maps = function(elt) {
    // svg path for target icon
    var targetSVG = "M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z";
    // svg path for plane icon
    var planeSVG = "M19.671,8.11l-2.777,2.777l-3.837-0.861c0.362-0.505,0.916-1.683,0.464-2.135c-0.518-0.517-1.979,0.278-2.305,0.604l-0.913,0.913L7.614,8.804l-2.021,2.021l2.232,1.061l-0.082,0.082l1.701,1.701l0.688-0.687l3.164,1.504L9.571,18.21H6.413l-1.137,1.138l3.6,0.948l1.83,1.83l0.947,3.598l1.137-1.137V21.43l3.725-3.725l1.504,3.164l-0.687,0.687l1.702,1.701l0.081-0.081l1.062,2.231l2.02-2.02l-0.604-2.689l0.912-0.912c0.326-0.326,1.121-1.789,0.604-2.306c-0.452-0.452-1.63,0.101-2.135,0.464l-0.861-3.838l2.777-2.777c0.947-0.947,3.599-4.862,2.62-5.839C24.533,4.512,20.618,7.163,19.671,8.11z";
    // Basic structure
    var mapchart = AmCharts.makeChart("mapdiv", {
      type: "map",
      pathToImages: "../static/ammap/images/",
      dataProvider: {
        map: "worldLow",
        images: []
      },
      areasSettings: {
          unlistedAreasColor: "#eeeeee"
      },
      imagesSettings: {
          color: "#CC0000",
          rollOverColor: "#CC0000",
          selectedColor: "#000000"
      },
      linesSettings: {
          color: "#CC0000",
          alpha: 0.4
      },
      backgroundZoomsToTop: true,
      linesAboveImages: true
    });

    var dom = $(elt)    
    var _links = dom.find('ul')
    var _maps = {
      alanevans:{title:"Alan Evans", p:{stiffness:2}},
      louiscollins:{title:"Louis Collins", p:{stiffness:2}},
      robertkearney:{title:"Robert Kearney", p:{stiffness:2}},
      jaynadeau:{title:"Jay Nadeau", p:{stiffness:2}},
      davidjuncker:{title:"David Juncker", p:{stiffness:2}},
      sylvainbaillet:{title:"Sylvain Baillet", p:{stiffness:2}},
      search:{title:"Search results", p:{stiffness:2}},
    }
    
    var that = {
      init:function(){
        // Add link for each stored maps
        $.each(_maps, function(stub, map){
          _links.append("<li><a href='#/"+stub+"' class='"+stub+"'>"+map.title+"</a></li>")
        })
        _links.find('li > a').click(that.dataProviderClick)
        _links.find('.alanevans').click()
        
        // Default spinner configuration
        var opts = {lines: 11, length: 8, width: 5, radius: 9, corners: 1, rotate: 0, direction: 1, color: '#000', speed: 1, trail: 60, shadow: false, hwaccel: false, className: 'spinner', zIndex: 2e9, top: '50%', left: '50%' };
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
        /*
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
        })*/
      },
      dataProviderClick:function(e){
        var selected = $(e.target)
        var newMap = selected.attr('class')
        if (newMap in _maps) that.selectDataProvider(newMap)
        _links.find('li > a').removeClass('active')
        selected.addClass('active')
        return false
      },
      selectDataProvider:function(map_id){
        $.getJSON("../static/maps/richclub/"+map_id+".json",function(data){
          // load the raw data into the MapImage object
          mapchart.dataProvider.images = data
          mapchart.validateData();
        })
      }
    }
    return that.init()
  }

  // On load
  $(document).ready(function(){
    // Load default map at corresponding element
    var mcp = Maps("#maps")
  })
	
})()