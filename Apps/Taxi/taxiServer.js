'use strict';

import GoogleJSON from './GoogleJSON.js'
import { NodeLink, GraphNode, GraphRoute, AirportSurfaceGraph } from './AirportSurfaceGraph.js'
import { Aeroway, GeoPoint, Aeroway_e } from './AerowayUtils.js'

export class AirportDB {
    geoData;
    airport;
    airportGraph;

    constructor(jsonData) {
        this.geoData = new GoogleJSON(jsonData);
        this.airport = this.geoData.FindAerodrome();

        this.airportGraph = new AirportSurfaceGraph();
        this.airportGraph.Process(this.geoData.Aeroways);
    }

    get runways() {
        return this.airportGraph.FindRunwayNodes();
    }

    get startNodes() {
        return this.airportGraph.FindStartNodes();
    }

    FindRoute(startNode, endNode) {
        return this.airportGraph.FindRoute(startNode, endNode);
    }
}

export function GenerateCesiumRoute(viewer, airportDB, fromNode, toNode) {
    
    //find the airport alitude
    var aerodrome = airportDB.geoData.FindAerodrome();

    
    var airportAltitude =0;
    if("ele" in aerodrome.Tags)
    {
        airportAltitude =  55;//aerodrome.Tags["ele"];
    }

    //find the route
    var possibleRoutes = airportDB.FindRoute(fromNode,toNode);
    var flightData = [];
    
    if(possibleRoutes.length==0)
    {
        return;
    }

    var selectedRoute = possibleRoutes[0];
    selectedRoute.Route[selectedRoute.Route.length-1]

    /* Initialize the viewer clock:
    Assume the radar samples are 30 seconds apart, and calculate the entire flight duration based on that assumption.
    Get the start and stop date times of the flight, where the start is the known flight departure time (converted from PST 
      to UTC) and the stop is the start plus the calculated duration. (Note that Cesium uses Julian dates. See 
      https://simple.wikipedia.org/wiki/Julian_day.)
    Initialize the viewer's clock by setting its start and stop to the flight start and stop times we just calculated. 
    Also, set the viewer's current time to the start time and take the user to that time. 
  */
    //Taxi speed of 30km/h = 8.33333m/sec
    const aircraftTaxiSpeed = 8.33333;
    var totalSeconds = 0;
    const start = Cesium.JulianDate.now();
    
    //Make sure viewer is at the desired time.
    viewer.clock.startTime = start.clone();
    
    viewer.clock.currentTime = start.clone();
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
    viewer.clock.multiplier = 10;

    // The SampledPositionedProperty stores the position and timestamp for each sample along the radar sample series.
    var positionProperty = new Cesium.SampledPositionProperty();
    var positionArray = [];
    for (var index=0; index<=selectedRoute.Route.length; index++) {
        //process the last link twice for the TO link
        if(index==selectedRoute.Route.length) {
            var nodeLink =selectedRoute.Route[index-1];
            var nodePos = nodeLink.To.Position;
        }
        else
        {
            var nodeLink =selectedRoute.Route[index];
            var nodePos = nodeLink.From.Position;
        }
        
        // Declare the time for this individual sample and store it in a new JulianDate instance.
        var time = Cesium.JulianDate.addSeconds(start, totalSeconds, new Cesium.JulianDate());
        var positionData = Cesium.Cartesian3.fromDegrees(nodePos.X, nodePos.Y);
        // Store the position along with its timestamp.
        // Here we add the positions all upfront, but these can be added at run-time as samples are received from a server.
        var nodeColor = nodeLink.From.ContainsStopway()? Cesium.Color.RED : Cesium.Color.YELLOW;
        positionProperty.addSample(time, positionData);
        viewer.entities.add({
            position: positionData,
            point: { pixelSize: 10, color: nodeColor, 
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND },
            
        });
        positionArray.push(positionData);
        

        if(nodeLink.From.ContainsStopway() && index<selectedRoute.Route.length)
        {
            
            var dx = ((nodeLink.To.Position.X - nodeLink.From.Position.X)/nodeLink.LengthDegress)/(60.0 * 1852.0)*0.5;
            var dy = ((nodeLink.To.Position.Y - nodeLink.From.Position.Y)/nodeLink.LengthDegress)/(60.0 * 1852.0)*0.5;
            
            positionData = Cesium.Cartesian3.fromDegrees(nodePos.X+dx, nodePos.Y+dy);
            totalSeconds+=10;
            time = Cesium.JulianDate.addSeconds(start, totalSeconds, new Cesium.JulianDate());
            positionProperty.addSample(time, positionData);
        }

        totalSeconds += nodeLink.Length/aircraftTaxiSpeed;
    }
    const stop = Cesium.JulianDate.addSeconds(start, totalSeconds, new Cesium.JulianDate());
    viewer.clock.stopTime = stop.clone();
    //Set timeline to simulation bounds
    viewer.timeline.zoomTo(start, stop);

    //Actually create the entity
    var entity = viewer.entities.add({
        //Set the entity availability to the same interval as the simulation time.
        availability: new Cesium.TimeIntervalCollection([
            new Cesium.TimeInterval({
                start: start,
                stop: stop,
            }),
        ]),

        //Use our computed positions
        position: positionProperty, 
               

        //Automatically compute orientation based on position movement.
        orientation: new Cesium.VelocityOrientationProperty(positionProperty),

        //Load the Cesium plane model to represent the entity
        model: {
            uri: "../../Data/model-cessna-208.glb",
            minimumPixelSize: 64,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, 
            //clampToGround: true,           
        },

        polyline: {
            clampToGround: true,
            positions: positionArray,
            width: 5,
            material: new Cesium.PolylineOutlineMaterialProperty({
              color: Cesium.Color.ORANGE,
              outlineWidth: 2,
              outlineColor: Cesium.Color.BLACK,
            }),
          },

       
    });

//    var entity = viewer.entities.add({

    
}

