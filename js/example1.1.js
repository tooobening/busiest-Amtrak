//CODE FROM pointToLayer() FUNCTION
    //build popup content string
    //var popupContent = "<p><b>City:</b> " + feature.properties.City + "</p>"; -->replaced as OOP
    var popupContent = new PopupContent(feature.properties, attribute);//create new popup content

    //change the formatting
    popupContent.formatted = "<h2>" + popupContent.population + " million</h2>";

    //add popup to circle marker
    layer.bindPopup(popupContent.formatted, {
            offset: new L.Point(0,-options.radius)
    });


    
    //add formatted attribute to panel content string
    var year = attribute.split("_")[1];
    popupContent += "<p><b>Population in " + year + ":</b> " + feature.properties[attribute] + " million</p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
          offset: new L.Point(0,-options.radius)
    });

...

//CODE FROM updatePropSymbols() FUNCTION
    //build new popup content string
    var popupContent = createPopupContent(props, attribute);//"<p><b>City:</b> " + props.City + "</p>";
    var popupContent = new PopupContent(props, attribute);

    //add formatted attribute to panel content string
    var year = attribute.split("_")[1];
    popupContent += "<p><b>Population in " + year + ":</b> " + props[attribute] + " million</p>";

    //update popup with new content
    popup = layer.getPopup();
    popup.setContent(popupContent).update();



function createPopupContent(properties, attribute){
    //add city to popup content string
    var popupContent = "<p><b>City:</b> " + properties.City + "</p>";

    //add formatted attribute to panel content string
    var year = attribute.split("_")[1];
    popupContent += "<p><b>Population in " + year + ":</b> " + properties[attribute] + " million</p>";

    return popupContent;
};

//Example 1.2 line 1...PopupContent constructor function
function PopupContent(properties, attribute){
    this.properties = properties;
    this.attribute = attribute;
    this.year = attribute.split("_")[1];
    this.population = this.properties[attribute];
    this.formatted = "<p><b>City:</b> " + this.properties.STNNAME + "</p><p><b>Population in " + this.year + ":</b> " + this.population + " thousand</p>";
};
//----------------//


//create new popup content...Example 1.4 line 1
var popupContent = new PopupContent(feature.properties, attribute);

//create another popup based on the first
var popupContent2 = Object.create(popupContent);

//change the formatting of popup 2
popupContent2.formatted = "<h2>" + popupContent.population + " million</h2>";

//add popup to circle marker
layer.bindPopup(popupContent2.formatted);

console.log(popupContent.formatted) //original popup content