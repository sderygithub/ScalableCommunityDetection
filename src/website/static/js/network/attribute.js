current_journal = 'Neuroimage'
current_cluster = '2'

function build_tsv_path(journal, cluster) {
    return "../static/journal/" + journal + "_" + cluster + ".json"
}

var supported_measurements = ['pyr','nop']
var displayed_measurement = supported_measurements[0];

function journal_list_click(e) {
    var selected = $(e.target)
    var journal = selected.attr('class')
    update_title(journal)
    load_new_journal(journal, current_cluster)
}

function load_new_cluster(e) {
    var selected = $(e.target)
    var cluster = selected.attr('class')
    current_cluster = cluster
    load_new_journal(current_journal, current_cluster)
}

function update_title(journal) {
    $('#journal_title_id').text(journal)
}

function load_new_journal(journal, cluster) {
    $('#cluster_description').text('')
    current_cluster = cluster
    current_journal = journal.toLowerCase()
    current_journal = current_journal.replace(/ /g,'_')
    load_tsv_file(build_tsv_path(current_journal, current_cluster))
}

function name(d) {
    return ''
}

function make_x_axis() {        
    return d3.svg.axis()
        .scale(x)
         .orient("bottom")
         .ticks(3)
}

function make_y_axis() {        
    return d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(3)
}

function mousemove() {
    var new_mouse_x = Math.floor(x.invert(d3.mouse(this)[0]))
    // Update mouse position
    if (new_mouse_x != mouse_x) {
        mouse_x = new_mouse_x
    }
    // Update tooltip position
    if (tooltip_is_visible > 0) {
        div.style("left", (d3.event.pageX + 10) + "px")     
            .style("top", (d3.event.pageY - 10) + "px")
    }
}

var mouse_x = 0;
var tooltip_is_visible = 0
var width = document.getElementById("chart").offsetWidth;
var height = 150;//document.getElementById("viewport").offsetHeight;

var margin = {top: 20, right: 20, bottom: 30, left: 30};
width = width - margin.left - margin.right;
height = height - margin.top - margin.bottom;

var g;
var loaded_data;
var vertical_axis_control;
var measurement;

var x = d3.scale.linear().range([0, width]);
var y = d3.scale.linear().range([height, 0]);
var bisectDate = d3.bisector(function(d) { return d.year; }).left

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(5)
    .tickFormat(d3.format("d"));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.value); });

var div = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .attr("id", "tooltip-div-id")

var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

function load_tsv_file(tsv_file) {

    function highlight_path(d) {
        // Highlight time series
        d3.selectAll("path").style("opacity", 0.4)
        d3.select(".C"+d.region).style("opacity", 1.0);
        d3.select(".C"+d.region).style("stroke-width", 4.0);
        $('#cluster_description').find('.D' + d.region).css("font-weight", "bold");
        $('#cluster_description').find('.D' + d.region).css("font-size", "14px");
    }

    function unhighlight_path(d) {
        // Highlight time series
        d3.selectAll("path").style("opacity", 1.0)
        d3.select(".C"+d.region).style("stroke-width", 2.0);
        $('#cluster_description').find('.D' + d.region).css("font-weight", "normal");
        $('#cluster_description').find('.D' + d.region).css("font-size", "12px");
    }

    function reveal_tooltip(d) {
        // For mousemove
        tooltip_is_visible = tooltip_is_visible + 1
        
        highlight_path(d)
        
        // Transition to visible opacity
        div.transition()
            .duration(100)
            .style("opacity", .9)
            .disabled
    }

    function path_mouseenter(d) {
        //
        reveal_tooltip(d)

        index = 0
        d.year.forEach(function(v) {
            if (v < mouse_x) index = index + 1;
        })
        nop = d.number_of_paper[index]
        ypr = d.yearly_paper_ratio[index] * 100
        ypr = ypr.toFixed(0);

        // Update content
        div.html('Cluster ' + parseInt(d.region + 1) + 
            '<br>Year: ' + d.year[index] + 
            '<br>Number of papers: ' + nop + 
            '<br>Yearly paper ratio: ' + ypr + '%')
            .style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY - 10) + "px")
    }

    function clustername_mouseenter(d) {
        //
        reveal_tooltip(d)

        // Update content
        div.html('Cluster ' + parseInt(d.region + 1) + 
            '<br>Cumulative number of papers: ' + d.total_number_of_papers + 
            '<br>' + concatenaned_terms(d))
            .style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY - 10) + "px")
    }

    function tooltip_mouseleave(d) {
        // For mousemove
        tooltip_is_visible = tooltip_is_visible - 1
        
        // Unhighlight time series
        unhighlight_path(d)

        // Transition to invisible opacity
        div.transition()
            .duration(100)
            .style("opacity", 0.0)
            .disabled

        div.html('')
            .style("left", (0) + "px")
            .style("top", (0) + "px")
    }

    function concatenaned_terms(d) {
        concatenated_description = ''
        d.terms.forEach(function(t) {
            concatenated_description = concatenated_description + t + ' '
        })
        return concatenated_description;
        $('#cluster_description').append('<div style="color:' + color(d.name) + '">Cluster ' + parseInt(d.region + 1) + ': ' + concatenated_description + '</div>')
    }

    function get_graph_values(d) {
        if (displayed_measurement == 'pyr') return d.pyr_values;
        else if (displayed_measurement == 'nop') return d.nop_values;
    }

    function get_graph_y_axis_name() { 
        if (displayed_measurement == 'pyr') return "";
        else if (displayed_measurement == 'nop') return "";
    }

    function measurement_list_click(e) {
        var selected = $(e.target)
        var measurement = selected.attr('class')
        // Update displayed measurement
        displayed_measurement = measurement;
        // Changing measurement is likely to change axis
        init_axis(loaded_data)
        // Redraw everything
        redraw(loaded_data)
    }

    function set_vertical_axis_control(value) {
        vertical_axis_control.setValue(value)
    }

    function adjust_vertical_axis() {
        y.domain([0, vertical_axis_control.getValue()]);
        
        yAxis = d3.svg.axis().scale(y).orient("left");

        redraw(loaded_data)
    }

    function roundHundred(value){
        if (value < 100) return Math.ceil(value/10)*10
        else return Math.ceil(value/100)*100
    }   

    function init_axis(data) {
        /*
        year_offset = 5
        x.domain([d3.min(data, function(c) {
            max_nonzero = c.values[0].date;
            c.values.forEach(function(v) {
                if (v.value == 0 && v.date > max_nonzero) max_nonzero = v.date
            })
            return max_nonzero - year_offset }), 
            data[0].year[data[0].year.length-1]]);
        */

        x.domain([data[0].year[0], data[0].year[data[0].year.length-1]])

        // Define range
        var min_range = d3.min(data, function(c) { return d3.min(get_graph_values(c), function(v) { return v.value; }); })
        var max_range = d3.max(data, function(c) { return d3.max(get_graph_values(c), function(v) { return v.value; }); })
        
        max_range = roundHundred(Math.floor(max_range))
        y.domain([min_range,max_range]);

        // Update axis object
        yAxis = d3.svg.axis().scale(y).ticks(4).orient("left");
    }

    function redraw(data) {

        d3.selectAll("svg > *").remove();

        g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .on("mousemove", mousemove)

        g.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

        g.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text(get_graph_y_axis_name());

        g.append("g")         
          .attr("class", "x grid")
          .attr("transform", "translate(0," + height + ")")
          .call(make_x_axis()
              .tickSize(-height, 0, 0)
              .tickFormat(""))

        g.append("g")         
          .attr("class", "y grid")
          .call(make_y_axis()
              .tickSize(-width, 0, 0)
              .tickFormat(""))

        var city = g.selectAll(".city")
          .data(data)
        .enter().append("g")
          .attr("class", "city");

        city.append("path")
            .attr("class", function(d) { return "line C" + d.region; })
            .attr("d", function(d) { return line(get_graph_values(d)); })
            .style("stroke", function(d) { return color(d.name); })
            .style("stroke-width", 2.0)
            .on("mouseenter", function(d) {
                return path_mouseenter(d);
            })
            .on("mouseleave", function(d) {
                return tooltip_mouseleave(d);
            })
            .on("mousemove", mousemove);

        var points = city.append("g")
                        .attr("class", "line-point");

        points.selectAll(".point")
            .data(function(d){ return get_graph_values(d)})
          .enter().append("circle")
            .attr("r", 2)
            .attr("cx", function(d) { return x(d.date) })
            .attr("cy", function(d) { return y(d.value) })
            .style("fill", function(d) { return color(this.parentNode.__data__.name); })
            .style("opacity", 0.4)
            //.style("stroke", function(d) { return color(d.name); });

        city.append("text")
            .data(data)
            .attr("transform", function(d) { 
                values = get_graph_values(d);
                return "translate(" + x(values[values.length - 1].date) + "," + y(values[values.length - 1].value) + ")"; })
            .attr("x", 3)
            .attr("dy", ".35em")
            .attr("fill", function(d) { return color(d.name); })
            .text(function(d) { return name(d) } )
            .on("mouseenter", function(d) {
                return clustername_mouseenter(d);
            })
            .on("mouseleave", function(d) {
                return tooltip_mouseleave(d);
            })
            .on("mousemove", mousemove);
    }

    // 
    //supported_measurements.forEach(function(e) {
    //    $('#measurement_list').append('<li><a class="' + e + '"href="#">' + e + '</a></li>')
    //}) 
    //$('#measurement_list').find('a').click(measurement_list_click)
    $('.pyr').click(measurement_list_click)
    $('.nop').click(measurement_list_click)


    d3.json(tsv_file, function(error, data) {

        if (error) throw error;

        // Create new data for format
        var data = data.map(function(d) {
            //
            number_of_paper_result = [], i = -1;
            while (d.year[++i]) number_of_paper_result.push([d.year[i], d.number_of_paper[i]]);
            // 
            yearly_paper_ratio_result = [], i = -1;
            while (d.year[++i]) yearly_paper_ratio_result.push([d.year[i], d.yearly_paper_ratio[i]]);

            return {
                region: d.region,
                name: d.name,
                terms: d.terms,
                total_number_of_papers: d.total_number_of_papers,
                year: d.year,
                number_of_paper: d.number_of_paper,
                yearly_paper_ratio: d.yearly_paper_ratio,
                nop_values: number_of_paper_result.map(function(v) {
                    return {
                        date: v[0],
                        value: v[1]
                    }
                }),
                pyr_values: yearly_paper_ratio_result.map(function(v) {
                    return {
                        date: v[0],
                        value: v[1] * 100
                    }
                }),
            };
        });

        // Keep track for visual update
        loaded_data = data

        // Reset cluster description
        data.forEach(function(d) { 
            string = concatenaned_terms(d);
            $('#cluster_description').append('<div class="D' + parseInt(d.region) + '" style="color:' + color(d.name) + '">Cluster ' + parseInt(d.region + 1) + ': ' + string + '</div>')
            $('#cluster_description').find('.D' + d.region).mouseenter(function(div) { 
                // Highlight time series
                highlight_path(d)
            })
            $('#cluster_description').find('.D' + d.region).mouseleave(function(div) { 
                // Unhighlight time series
                unhighlight_path(d)
            })
        })

        init_axis(data)

        redraw(data)

        function resize() {
            var width = document.getElementById("chart").offsetWidth;
            var height = 200;//document.getElementById("viewport").offsetHeight;
            var margin = {top: 20, right: 80, bottom: 30, left: 50};
            //width = width - margin.left - margin.right;
            //height = height - margin.top - margin.bottom;
            //svg.attr("width", width).attr("height", height);
        }
        //window.onresize = resize;
        d3.select(window).on("resize", resize);

    });
}

load_tsv_file('../static/trends/neuroimage_3.json')
