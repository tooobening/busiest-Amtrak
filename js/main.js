/* Map of GeoJSON data from MegaCities.geojson */
//declare map var in global scope
var mymap;
var minValue;

//step 1 create map
function createMap(){

    //add OSM base tilelayer
    mymap = L.map('mapid').setView([40,-100],4)

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/dark-v10', //https://docs.mapbox.com/api/maps/#mapbox-styles
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoieXVuaW5nbGl1IiwiYSI6ImNrNm9tNDFhcDBpejgzZG1sdnJuaTZ4MzYifQ.qYhM3_wrbL6lyTTccNKx_g' //'your.mapbox.access.token'
    }).addTo(mymap);

    //call getData function
    getData(mymap);
};

//Step 2: Import GeoJSON data
function getData(mymap){
    //load the data
    $.ajax("data/AmtrakStations.geojson", {
        dataType: "json",
        success: function(response){
            //create an attributes array
            var attributes = processData(response);
            minValue = calcMinValue(response);
            createPropSymbols(response, attributes);
            createSequenceControls(attributes); // Important to add parameter at this place!
            createLegend(mymap,attributes);



        }
    });
};

function calcMinValue(data){
     
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var city of data.features){
         //loop through each year
         for(var year = 2012; year <= 2018; year+=1){
               //get population for current year
              var value = city.properties["PASS_"+ String(year)];
              //add value to array
              allValues.push(value);
          }
    }
    
    //get minimum value of our array
    var minValue = Math.min(...allValues)

    return minValue;
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    
    //constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    
    //Flannery Appearance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius

    return radius;
};

//Step 3: Add circle markers for point features to the map
function createPropSymbols(data, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);        }
    }).addTo(mymap);
};
//Convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];

    //create marker options
    var options = {
        fillColor: "#ffffcc",
        color: "#001",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //popupContent += "<p><b>Passenger in " + year + ":</b> " + feature.properties[attribute] + " thousand</p>"; --replaced as OOP
    var popupContent = new PopupContent(feature.properties, attribute);

    //add popup to circle marker
    layer.bindPopup(popupContent.formatted,{
        offset: new L.Point(0,-options.radius)//offset the popup based on its radius not to cover the proportional symbol
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//-------------OOP---------------//
function PopupContent(properties, attribute){
    this.properties = properties;
    this.attribute = attribute;
    this.year = attribute.split("_")[1];
    this.population = this.properties[attribute];
    this.formatted = "<p><b>City:</b> " + this.properties.STNNAME + "</p><p><b>Population in " + this.year + ":</b> " + this.population + " million</p>";
};



//-----------------Panel---------------------//
//Step 1: Create new sequence controls
function createSequenceControls(attributes){
    var SequenceControl = L.Control.extend({ //to add properties and methods to the class prototype object;the revised object becomes the prototype for SequenceControl
        options: {
            position: 'bottomleft' //'topleft', 'topright'(default), 'bottomleft' or 'bottomright'
        },

        onAdd: function () { //onnAdd() always is required for a new Leaflet control!
            // create the control container div with a particular class name; more convenient than document.createElement() method.
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //create range input element (slider)
            $(container).append('<input class="range-slider" type="range">');
            //add skip buttons
            $(container).append('<button class="step" id="reverse" title="Reverse">Reverse</button>');
            $(container).append('<button class="step" id="forward" title="Forward">Forward</button>');

            //disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);

            // ... initialize other DOM elements


            return container;
        }
    });

    mymap.addControl(new SequenceControl());

    // //create range input element (slider)
    // $('#panel').append('<input class="range-slider" type="range">');
    
    //set slider attributes
    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });
    // $('#panel').append('<button class="step" id="reverse">Reverse</button>');
    // $('#panel').append('<button class="step" id="forward">Forward</button>');
    $('#reverse').html('<img src="img/reverse.png">');
    $('#forward').html('<img src="img/forward.png">');
    //Step 5: click listener for buttons

    // Add listeners after adding control
    $('.step').click(function(){
        //get the old index value
        var index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 6 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 6 : index;
        };

        //Step 8: update slider
        $('.range-slider').val(index);
         //Called in both step button and slider event listener handlers
        //Step 9: pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
    });
    

};

function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'topleft'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="130px" height="130px">';

            //add attribute legend svg to container
            $(container).append(svg);

            return container;
        }
    });

    map.addControl(new LegendControl());

    updateLegend(map, attributes[0]);
};

function updateLegend(map,attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //update the layer style and popup
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            // var popupContent = "<p><b>City:</b> " + props.STNNAME + "</p>"; -->replaced as OOP
            var popupContent = new PopupContent(props, attribute);

            //update popup content
            popup = layer.getPopup();
            //create another popup based on the first
            var popupContent2 = Object.create(popupContent);

            //change the formatting of popup 2
            popupContent2.formatted = "<h2>Passenger in" + popupContent.year + ":</h2>";            
            popup.setContent(popupContent2.formatted).update(); //OOP
        };
    });
};




//Step 10: Resize proportional symbols according to new attribute values and renew the popup!
function updatePropSymbols(attribute){
    mymap.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //update the layer style and popup
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            // var popupContent = "<p><b>City:</b> " + props.STNNAME + "</p>"; -->replaced as OOP
            var popupContent = new PopupContent(props, attribute);

            //update popup content
            popup = layer.getPopup();
            popup.setContent(popupContent.formatted).update(); //OOP
        };
    });
};






function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.substr(0,4) === "PASS"){
            attributes.push(attribute)
        }

    };
    return attributes;
};




$(document).ready(createMap);




//function to retrieve the data and place it on the map
//Rather than having to create the data in the script, we bring in our external data and pass it directly to L.geoJson()
// function getData(){
//     //load the data
//     $.getJSON("data/AmtrakStations.geojson", function(response){
//             //create a Leaflet GeoJSON layer and add it to the map
//             // L.geoJson(response).addTo(mymap);

//             //Convert GeoJSON points into Leaflet layers -> showed as a circle marker
//             var geojsonMarkerOptions = {
//                 radius: 10,
//                 fillColor: "#ffffcc", //Yellow
//                 color: "#000",
//                 weight: 1,
//                 opacity: 1,
//                 fillOpacity: 0.8
//             };
//             L.geoJson(response, {
//                 pointToLayer: function (feature, latlng) {
//                     return L.circleMarker(latlng, geojsonMarkerOptions);
//                 }
//             }).addTo(mymap);


//             //Pop up selected feature
//              L.geoJson(response, {
//                 onEachFeature: function (feature,layer) {
//                     var popupContent = ""; //define the string type
//                     if (feature.properties) {
//                         for (var property in feature.properties) {
//                             //select specific properties to be included in the popup window
//                             if (property === 'STNNAME' || 
//                             property ==="PASS_2012" || 
//                             property ==="PASS_2013" || 
//                             property ==="PASS_2014" || 
//                             property ==="PASS_2015" || 
//                             property ==="PASS_2016" || 
//                             property ==="PASS_2017" || 
//                             property ==="PASS_2018" ){
//                                 popupContent += "<p>" + property + ": " + feature.properties[property]+ "</p>";   
//                             }                        
//                         }
//                         popupContent += "Unit: per thousand passengers" // this line might be deleted later for better presentation
//                         return layer.bindPopup(popupContent)
//                     }


//                 }
//              }).addTo(mymap);
//         });
// };



// $(document).ready(createMap);