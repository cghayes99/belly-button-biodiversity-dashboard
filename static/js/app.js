/* global var
============================================= */
const URL_SAMPLE_NAMES    = "/names";
const URL_SAMPLE_WFREQ    = "/wfreq/";
const URL_SAMPLE_VALUES   = "/samples/";
const URL_SAMPLE_METADATA = "/metadata/";

var selectSample = d3.select(".form-control");

//****************** init *****************************//
init();


//****************** Event Listeners ******************//

selectSample.on("change", function() {
    console.log("selectSample => "+this.value);

    plotPie(this.value);
    plotBubble(this.value);
    plotGuage(this.value);

    refreshMetadata(this.value);    
});


/* Functions
============================================= */

/*
 * start the show
 */
function init() {
    renderSelectSample();
    
    //var start = d3.select("#bbb--meta-sample").text();
    start = 940;
    plotPie(start);
    plotBubble(start);
    plotGuage(start);
}

/*
 * makes API call to fetch 
 * sample data names
 */
function renderSelectSample() {
    d3.json(URL_SAMPLE_NAMES).then((obj) => {
        d3.select("#bbb--select-sample")
            .selectAll("option")
            .data(obj)
            .enter()
            .append("option")
            .text(function (d) { return d; });
    });
}

/*
 * update metadata table
 */
function refreshMetadata(sample) {
    var url = URL_SAMPLE_METADATA + sample;
    
    d3.json(url).then((obj) => {
        console.log("obj => "+JSON.stringify(obj));

        d3.select("#bbb--meta-sample").html(sample);
        d3.select("#bbb--meta-age").html(obj.AGE);
        d3.select("#bbb--meta-ethnicity").html(obj.ETHNICITY);
        d3.select("#bbb--meta-gender").html(obj.GENDER.toUpperCase());
        d3.select("#bbb--meta-bbtype").html(obj.BBTYPE);
        d3.select("#bbb--meta-location").html(obj.LOCATION);
        d3.select("#bbb--meta-wfreq").html(obj.WFREQ);
    });
}

/*
 * pie chart plot
 */
function plotPie(sample) {
    var url = URL_SAMPLE_VALUES + sample;
    
    d3.json(url).then((data) => {
        var div = document.getElementById("bbb--pie-chart");

        var labelid = data.otu_ids.slice(0, 10);
        var labels = data.otu_labels.slice(0,10);

        var trace = {
            values: data.sample_values.slice(0, 10),
            labels: labelid,
            type: 'pie',
            text: labels,
            textinfo: 'percent',
            hoverinfo: 'label+text+value+percent'
        };

        var layout = {
            autosize: true,
            showlegend: false,
            title: "<b>Top 10 for Sample: "+ sample + "</b>"
          
        };

        var plotData = [trace];
          
        Plotly.newPlot(div, plotData, layout);
    });
}

/*
 * bubble chart plot
 */
function plotBubble(sample) {
    var url = URL_SAMPLE_VALUES + sample;
    
    d3.json(url).then((data) => {
        var div = document.getElementById("bbb--bubble-chart");

        var trace = {
            x: data.otu_ids,
            y: data.sample_values,
            text: data.otu_labels,
            hoverinfo: "x+y+text",
            mode: "markers",
            marker: {
                size: data.sample_values,
                color: data.otu_ids
            }
        };

        var layout = {
            title: "<b>Sample: "+ sample + "</b>",
            margin: {
                l: 15,
                r: 70,
                pad: 0
            },
        };

        var plotData = [trace];
          
        Plotly.newPlot(div, plotData, layout);
    });
}

/*
 * guage chart plot
 */
function plotGuage(sample) {
    var url = URL_SAMPLE_WFREQ + sample;
    
    d3.json(url).then((data) => {    
        var div = document.getElementById("bbb--gauge-chart");
    
        // Enter a speed between 0 and 9
        var level = data;
        
        // Trig to calc meter point
        var degrees = 180 - level*20,
            radius = 0.5;
        var radians = degrees * Math.PI / 180;
        var x = radius * Math.cos(radians);
        var y = radius * Math.sin(radians);
        
        // Path: may have to change to create a better triangle
        var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
            pathX = String(x),
            space = ' ',
            pathY = String(y),
            pathEnd = ' Z';
        var path = mainPath.concat(pathX, space, pathY, pathEnd);

        var plotData = [{
                type: 'scatter',
                x: [0],
                y: [0],
                marker: {
                    size: 28,
                    color: 'DB5F59'
                },
                showlegend: false,
                name: 'speed',
                text: level,
                hoverinfo: 'text+name'
            },
            {
                values: [50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9,50 / 9, 50 / 9, 50 / 9, 50],
                rotation: 90,
                text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
                textinfo: 'text',
                textposition: 'inside',
        
                marker: {
                    colors: ['rgba(14, 127, 0, .5)',    'rgba(110, 154, 22, .5)', 'rgba(173, 255, 186, .5)',
                             'rgba(170, 202, 42, .5)',  'rgba(202, 209, 95, .5)', 'rgba(122, 255, 142, .5)',
                             'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)','rgba(97, 255, 121, .5)',
                             'rgba(255, 255, 255, 0)'
                    ]
                },
                labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
                hoverinfo: 'label',
                hole: 0.5,
                type: 'pie',
                showlegend: false
            }];

        var layout = {
            autosize: true,
            showlegend: false,
            shapes: [{
                type: 'path',
                path: path,
                fillcolor: 'DB5F59',
                line: {
                    color: 'DB5F59'
                }
            }],
            title: '<b>Belly Button Weekly Washing Frequency</b> <br> Scrubs per Week',
            xaxis: {
                zeroline: false,
                showticklabels: false,
                showgrid: false,
                range: [-1, 1]
            },
            yaxis: {
                zeroline: false,
                showticklabels: false,
                showgrid: false,
                range: [-1, 1]
            }
        };
        
        Plotly.newPlot(div, plotData, layout);
    });        
}

