
(function(){

  var Maps = function(elt) {
    // 
    var dom = $(elt)
    var _links = dom
    var loadedgraphsvg = SocialNetwork();
    var c10 = d3.scale.category10();

    var val = "field"
    var result = "not_found"
    var tmp = [];
    location.search
    //.replace ( "?", "" ) 
    // this is better, there might be a question mark inside
    .substr(1)
        .split("&")
        .forEach(function (item) {
        tmp = item.split("=");
        if (tmp[0] === val) result = decodeURIComponent(tmp[1]);
    });

    var _maps = {
      graph_neuroimaging:{title:"Neuroimaging", color:c10(5)},
      graph_nanotechnologies:{title:"Nanotechnology", color:c10(6)},
      graph_epidemiology:{title:"Epidemiology", color:c10(7)},
      graph_machinelearning:{title:"Machine Learning", color:c10(8)},
      graph_ebola:{title:"Data Science", color:c10(9)}
    }
    
    var that = {
      init:function(){
        // Add link for each stored maps
        $.each(_maps, function(stub, map){
          //_links.append('<button class="btn btn-default" style="color:#fff; background-color: ' + map.color + '"> <input class="' + stub + '" type="radio" name="options"><a class="' + stub + '" style="color:#fff">' + map.title +'</a></button>')
          //_links.append('<button class="btn btn-default"> <a class="' + stub + '">' + map.title +'</a></button>')
          _links.append('<div class="btn-group"> \
            <button type="button" style="background-color:' + map.color + '" class="btn"><a style="color: #fff;" class="journal_graph_' + map.title.toLowerCase().replace(' ','_') + '_500" >' + map.title + '</a></button> \
            <button type="button" style="color: #fff; background-color:' + map.color + '" class="btn dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"> \
                <span class="caret"></span> \
                <span class="sr-only">Toggle Dropdown</span> \
            </button> \
            <ul class="dropdown-menu"> \
                <li><a class="journal_graph_' + map.title.toLowerCase().replace(' ','_') + '_100" >100</a></li> \
                <li><a class="journal_graph_' + map.title.toLowerCase().replace(' ','_') + '_250" >250</a></li> \
                <li><a id="journal_graph_' + map.title.toLowerCase().replace(' ','_') + '_500" class="journal_graph_' + map.title.toLowerCase().replace(' ','_') + '_500">500</a></li> \
                <li><a class="journal_graph_' + map.title.toLowerCase().replace(' ','_') + '_1000" >1000</a></li> \
            </ul></div> ')
        })
        _links.find('a').click(that.dataProviderClick)

        // Default spinner configuration
        var opts = {lines: 11, length: 8, width: 5, radius: 9, corners: 1, rotate: 0, direction: 1, color: '#000', speed: 1, trail: 60, shadow: false, hwaccel: false, className: 'spinner', zIndex: 2e9, top: '50%', left: '50%' };
        that.spinner = new Spinner(opts).spin();
        $("#spinner-div").append(that.spinner.el);
        $("#search-timer").removeClass('fa-spin')
        $("#search-timer").addClass('hidden');
        that.spinner.stop();

        if (result != "not_found") {
          console.log("#journal_graph_" + result + "_500")
          if (result == "neuroimaging" || result == "nanotechnology" || result == "epidemiology" || result == "machine_learning" || result == "data_science")
          $("#journal_graph_" + result + "_500").click();
        }
        else {
          $("#journal_graph_neuroimaging_500").click();
        }      
        // Search research topic input
        $("#input_search_id").keyup(function(event){
          if(event.keyCode == 13){
            $("#button_search_id").click();
          }
        })        
        $("#button_search_id").click(that.searchClick)

        // Search author name input
        $("#input-search-name-id").keyup(function(event) {
          if (event.keyCode == 13){
            $("#button-search-name-id").click();
          }
        })        
        $("#button-search-name-id").click(that.searchAuthorClick)

        return that
      },
      searchAuthorClick: function(e) {
        author = $("#input-search-name-id").val();
        nodes = d3.selectAll(".node").filter(function(d, i){ return (d.name.toLowerCase().search(author.toLowerCase()) >= 0) })
        if (nodes == null) {
          // Message
        } else {
          if (nodes.length > 1) {
            nodes.each(function(d,i) {
              loadedgraphsvg.set_highlight(d)
              loadedgraphsvg.set_focus(d)
            });
          } else {
            nodes.each(function(d,i) {
              loadedgraphsvg.centeron(d)
              loadedgraphsvg.set_highlight(d)
              loadedgraphsvg.set_focus(d)
            });
          }
        }
      },
      searchClick:function(e){
        // Select search results tab
        //that.selectMap('search')
        //_links.find('a').removeClass('active')
        //_links.find('.search').addClass('active')
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
        console.log(newMap)
        //if (newMap in _maps) 
        that.selectDataProvider(newMap)
        //_links.find('a').removeClass('active')
        //selected.addClass('active')
        return false
      },
      selectDataProvider:function(map_id){
        //console.log(loadedgraphsvg)
        //loadedgraphsvg.clear()
        d3.selectAll("svg > *").remove();
        console.log("../static/maps/richclubs/"+map_id+".json")
        loadedgraphsvg.load("../static/maps/richclubs/"+map_id+".json");
        //loadedgraphsvg = SocialNetwork("../static/maps/richclubs/"+map_id+".json");
        //.load("../static/maps/richclubs/"+map_id+".json")
        //console.log(loadedgraphsvg)
        //$.getJSON("../static/maps/richclubs/"+map_id+".json",function(data){
          // load the raw data into the MapImage object
          //mapchart.dataProvider.images = data
          //mapchart.validateData();
        //})
      }
    }
    return that.init()
  }

  // On load
  $(document).ready(function(){
    // Load default map at corresponding element
    var mcp = Maps("#maps")
//    loadgraph("../static/maps/richclubs/neuroimaging.json")
  })
	
})()