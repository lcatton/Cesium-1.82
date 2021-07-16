'use strict';

//import { loadTaxiDatabase } from "./taxiServer.js";


function startup(Cesium) {    
    // Your access token can be found at: https://cesium.com/ion/tokens.
    // Replace `your_access_token` with your Cesium ion access token.

    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3YzFlNmNhYS0xZDMxLTQzMmQtOTIzNy05Zjg4NWU2NDI0MDgiLCJpZCI6NTk2NjcsImlhdCI6MTYyNDM3NTQyNn0.FOpayHaVdsO_uDP7XI_qq0uUqtN65NWBvm8OJz5RrKk';

    // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
    const viewer = new Cesium.Viewer('cesiumContainer', {
      terrainProvider: Cesium.createWorldTerrain()
    });       
    // Add Cesium OSM Buildings, a global 3D buildings layer.
    const buildingTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings());   
    // Fly the camera to San Francisco at the given longitude, latitude, and height.
    viewer.camera.flyTo({
      destination : Cesium.Cartesian3.fromDegrees(-121.600682, 37.0793549, 1000),
      orientation : {
        heading : Cesium.Math.toRadians(0.0),
        pitch : Cesium.Math.toRadians(-15.0),
      }
    });

    var viewModel = {
    emissionRate: 5.0
    };

//     Cesium.loadJson('../../Data/SanMartin.geojson').then(function(jsonData) {

//         var node = document.createElement("td");                 // Create a <li> node
//         var textnode = document.createTextNode("Water");         // Create a text node
//         node.appendChild(textnode);                              // Append the text to <li>
//         document.getElementById("CurrentPath").appendChild(node);     // Append <li> to <ul> with id="myList"

//     // // Do something with the JSON object
//     // var listGps = loadTaxiDatabase(jsonData);

//     // viewer.entities.add({
//     //     polyline: {
//     //       positions: Cesium.Cartesian3.fromDegreesArray(listGps),
//     //       clampToGround: true,
//     //       width: 5,
//     //       material: new Cesium.PolylineOutlineMaterialProperty({
//     //         color: Cesium.Color.ORANGE,
//     //         outlineWidth: 2,
//     //         outlineColor: Cesium.Color.BLACK,
//     //       }),
//     //     },
//     //   });

//     //   viewer.camera.flyTo({
//     //     destination: Cesium.Cartesian3.fromDegrees(listGps[0], listGps[1], 15000.0),
//     // });
// }).otherwise(function(error) {

//     var node = document.createElement("td");                 // Create a <li> node
//         var textnode = document.createTextNode(error);         // Create a text node
//         node.appendChild(textnode);                              // Append the text to <li>
//         document.getElementById("CurrentPath").appendChild(node);     // Append <li> to <ul> with id="myList"

//     // an error occurred
//     window.alert(error);
// });

//     Cesium.knockout.track(viewModel);
//     var toolbar = document.getElementById("toolbar");
//     Cesium.knockout.applyBindings(viewModel, toolbar);

//     Sandcastle.addToggleButton("Enabled", true);
//     Sandcastle.addToolbarButton("Lewis", function(){        
//         var node = document.createElement("td");                 // Create a <li> node
//         var textnode = document.createTextNode("Water");         // Create a text node
//         node.appendChild(textnode);                              // Append the text to <li>
//         document.getElementById("CurrentPath").appendChild(node);     // Append <li> to <ul> with id="myList"

//     });
//     Sandcastle.addToolbarButton("Clear", function(){        
//         document.getElementById("CurrentPath").textContent = '';

//     });

//     //Sandcastle_End
//     Sandcastle.finishedLoading();
}

// Since ES6 modules have no guaranteed load order,
// only call startup if it's already defined but hasn't been called yet
if (!window.startupCalled && typeof startup === "function") {
    startup(Cesium);
  }