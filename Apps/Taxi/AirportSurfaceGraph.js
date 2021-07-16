import { Aeroway_e, Position_e, GeoPoint, Aeroway } from './AerowayUtils.js'
import LineHelper from './LineHelper.js'

export class NodeLink {
    ParentWay;
    Name;

    IndexFrom;
    IndexTo;

    From;
    To;


    /// <summary>
    /// Gets the length in meters.
    /// </summary>
    /// <value>
    /// The length in meters.
    /// </value>
    get Length() {
        //Convert Degrees to Nauttical Miles to KM
        return this.From.Position.DistanceFrom(this.To.Position) * 60.0 * 1852.0;
    }

    /// <summary>
    /// Gets the length in meters.
    /// </summary>
    /// <value>
    /// The length in meters.
    /// </value>
    get LengthDegress() {
        //Convert Degrees to Nauttical Miles to KM
        return this.From.Position.DistanceFrom(this.To.Position);
    }

    constructor(parentWay, fromIndex, toIndex) {
        this.ParentWay = parentWay;
        this.IndexFrom = fromIndex;
        this.IndexTo = toIndex;

        this.Name = parentWay.Name;
        
        var runwayIds = this.Name.split('/');

        if (this.ParentWay.WayType == Aeroway_e.runway && runwayIds.length > 0) {
            if ((this.IndexTo - this.IndexFrom) > 0) {
                this.Name = runwayIds[0];
            }
            else {
                this.Name = runwayIds[1];
            }
        }
    }
}

export class GraphNode {
    Name

    Position;

    links;

    static #nextId = 1;

    constructor(position) {

        if (typeof GraphNode.nextId == 'undefined') {
            GraphNode.nextId = 1;
        }
        
        this.Name = `ID_${GraphNode.nextId++}`;
        this.Position = position;
        this.links = [];
    }

    AddLink(toNode, link) {
        this.links.push(link);

        link.From = this;
        link.To = toNode;
    }

    ContainsStopway()
    {
        var results = this.links.filter(l => l.ParentWay.WayType==Aeroway_e.stopway);
        
        return (results.length>0) ? true: false;
    }
}

export class GraphRoute {
    /// <summary>
    /// Gets or sets the route length.
    /// </summary>
    /// <value>
    /// The length in nautical miles.
    /// </value>
    Length;

    /// <summary>
    /// Gets or sets the route.
    /// </summary>
    /// <value>
    /// The route as a series of GraphNodes.
    /// </value>
    Route;

    #_visited;

    HasVisited(node) {
        return this._visited.includes(node);
    }
    
    constructor(clone=null) {
        if (clone == null) {
            this.Length = 0;
            this._visited = [];
            this.Route = [];
        }
        else {
            this.Length = clone.Length;
            this._visited = [...clone._visited];
            this.Route = [...clone.Route];
        }
    }

    AddLink(link) {
        this.Length += link.Length;
        this.Route.push(link);
        this._visited.push(link.From);
    }

    toString() {
        var sout;
        sout += `Route Length=${this.Length}`;
        for (link in Route) {
            sout += `${link.ParentWay.WayType} ${link.Name} ${link.From.Name} -> ${link.To.Name}`;
        }
        return sout;
    }
}

export class AirportSurfaceGraph {
    #_nodes;
    #_aeroways;
    #_taxiways;
    #_runways;
    #_stops;

    FindNode(position) {

        if (this._nodes.has(position.key)) {
            return this._nodes.get(position.key);
        }

        var result = new GraphNode(position);        
        this._nodes.set(position.key, result);
        return result;
    }

    Process(aeroways) {
        this._aeroways = aeroways;

        this._taxiways = aeroways.filter(w => w.AreaType == Position_e.Line);
        this._stops = aeroways.filter(w => w.WayType == Aeroway_e.stopway);
        this._runways = aeroways.filter(w => w.WayType == Aeroway_e.runway);

        this._nodes = new Map();

        for (let stop of this._stops) {
            var interesction = undefined;

            for (let taxiway of this._taxiways) {
                for (let index = 1; index < taxiway.Points.length && interesction == undefined; index++) {
                    interesction = LineHelper.FindIntersection(
                        stop.Points[0], stop.Points[1],
                        taxiway.Points[index - 1], taxiway.Points[index]);
                    if (interesction != undefined) {
                        //insert the points into the array of the taxi way and stop line
                        stop.Points.splice(1, 0, interesction);
                        taxiway.Points.splice(index, 0, interesction);
                    }
                }

                if (interesction != undefined) {
                    break;
                }
            }
        }

        for (let taxiway of this._taxiways) {
            var previousNode = this.FindNode(taxiway.Points[0]);

            for (let index = 1; index < taxiway.Points.length; index++) {
                var nextNode = this.FindNode(taxiway.Points[index]);

                var link = new NodeLink(taxiway, index - 1, index);
                previousNode.AddLink(nextNode, link);

                link = new NodeLink(taxiway, index, index - 1);
                nextNode.AddLink(previousNode, link);
                
                previousNode = nextNode;

            }
        }

        //Remove nodes with one link if they are a runway
        var toBeRemoved = [];
        this._nodes.forEach(node => {
            if (node.links.length == 1) {
                if (node.links[0].ParentWay.WayType == Aeroway_e.runway) {
                    toBeRemoved.push(node);
                }
            }
        });

        for (let node of toBeRemoved) {
            delete this._nodes.delete(node.Position.key);

            node.links[0].To.links = node.links[0].To.links.filter(function (l) {
                return l.To != node;
            });
        }
    }

    ProcessRoute(route, node, targetNode, completedRoutes) {
        for (let link of node.links) {

            if (link.ParentWay.WayType != Aeroway_e.runway) {
                if (link.To == targetNode) {
                    var newRoute = new GraphRoute(route);
                    newRoute.AddLink(link);

                    completedRoutes.push(newRoute);
                }
                else
                    if (!route.HasVisited(link.To)) {
                        var newRoute = new GraphRoute(route);
                        newRoute.AddLink(link);

                        this.ProcessRoute(newRoute, link.To, targetNode, completedRoutes);
                    }
                    else {
                        //Console.WriteLine("#### Invalid Already Visited ####");
                        //Console.WriteLine(newRoute);
                    }
            }
            else {
                //Console.WriteLine("#### Invalid Way=Runway ####");
                //Console.WriteLine(newRoute);
            }
        }
    }

    FindRoute(From, To) {
        //Console.WriteLine($"Find Route from {From.Name} -> {To.Name}");

        var completedRoutes = [];

        var route = new GraphRoute();
        this.ProcessRoute(route, From, To, completedRoutes);

        completedRoutes.sort(function (a, b) {
            return a.Length - b.Length;
        });


        return completedRoutes;
    }

    


    /// <summary>
    /// Finds all the nodes with a single link
    /// </summary>
    /// <returns>List of Graph Nodes</returns>
    FindStartNodes() {
        var results = [];
        this._nodes.forEach(x => {
            if (x.links.length == 1 && x.links[0].ParentWay.WayType != Aeroway_e.stopway) {
                results.push(x);
            }
        });
        return results;
    }

    /// <summary>
    /// Finds the starting Graph nodes for all the runway.
    /// </summary>
    /// <returns></returns>
    FindRunwayNodes() {
        var runwayNodes = [];

        for (let runway of this._runways) {
            var currentRunwayNodes = [];

            this._nodes.forEach(node => {
                var linkList = node.links.filter(n => n.ParentWay == runway);

                //Only the end of the runway should have a single link
                //Way in the middle of a runway will have 2 links (left,right)
                if (linkList.length == 1) {
                    currentRunwayNodes.push(linkList[0]);
                }

            });

            currentRunwayNodes.sort(function (a, b) {
                return a.IndexFrom - b.IndexFrom;
            });

            if (currentRunwayNodes.length > 0) {
                runwayNodes.push(currentRunwayNodes[0]);
                runwayNodes.push(currentRunwayNodes[currentRunwayNodes.length - 1]);
            }
        }
        return runwayNodes;
    }

    GeneratePlantUML() {
        var buffer;
        buffer = "@startuml Graph\n";
        this._nodes.forEach(node => {
            buffer += `circle ${node.Name}\n`;
        });

        var visited = [];
        this._nodes.forEach(node => {
            for (var link of node.links) {
                var key1 = link.From.Name + link.To.Name;
                var key2 = link.To.Name + link.From.Name;

                if (!visited.includes(key1) || !visited.includes(key2)) {

                    buffer += `${link.From.Name} --> ${link.To.Name} : ${link.ParentWay.WayType} ${link.Name}\n`;

                    visited.push(key1);
                    visited.push(key2);
                }
            }
        });
        buffer += "@enduml\n";

        return buffer;
    }

    FindRunways() {
        return this._aeroways.filter(w => w.AreaType == Position_e.Line);
    }
}