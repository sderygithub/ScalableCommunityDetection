
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
    
    var that = {
      init:function(){
        // Add link for each stored maps
        _links.append('<div class="btn-group"> \
            <button type="button" style="background-color:' + c10(5) + '" class="btn"><a style="color: #fff;">Journals</a></button> \
            <button type="button" style="color: #fff; background-color:' + c10(5) + '" class="btn dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"> \
                <span class="caret"></span> \
                <span class="sr-only">Toggle Dropdown</span> \
            </button> \
            <ul class="dropdown-menu"> \
                <li><a class="journal_graph_neuroimage">NeuroImage</a></li> \
                <li><a class="journal_graph_science">Science</a></li> \
                <li><a class="journal_graph_pnas">PNAS</a></li> \
                <li><a class="journal_graph_nature">Nature</a></li> \
            </ul></div> ')
        _links.find('a').click(that.dataProviderClick)

        // Search research topic input
        $("#input_search_id").keyup(function(event){
          if(event.keyCode == 13){
            $("#button_search_id").click();
          }
        })        
        $("#button_search_id").click(that.searchClick)

       
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
      dataProviderClick:function(e){
        var selected = $(e.target)
        var newMap = selected.attr('class')
        that.selectDataProvider(newMap)
        return false
      },
      selectDataProvider:function(map_id){
        d3.selectAll("svg > *").remove();
        console.log("../static/maps/richclubs/"+map_id+".json")
        loadedgraphsvg.load("../static/maps/richclubs/"+map_id+".json");
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