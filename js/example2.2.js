//Create new sequence controls
function createSequenceControls(attributes){   
    var SequenceControl = L.Control.extend({ //to add properties and methods to the class prototype object;the revised object becomes the prototype for SequenceControl
        options: {
            position: 'bottomleft'
        },

        onAdd: function () { //onnAdd() always is required for a new Leaflet control!
            // create the control container div with a particular class name; more convenient than document.createElement() method.
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //create range input element (slider)
            $(container).append('<input class="range-slider" type="range">');


            // ... initialize other DOM elements

            return container;
        }
    });

    map.addControl(new SequenceControl());

    // add listeners after adding control

}