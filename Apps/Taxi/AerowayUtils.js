/// <summary>
/// Defined here https://wiki.openstreetmap.org/wiki/Aeroways
/// </summary>
export const Aeroway_e = {
    aerodrome: "aerodrome",
    heliport: "heliport",
    runway: "runway",
    stopway: "stopway",
    helipad: "helipad",
    taxiway: "taxiway",
    holding_position: "holding_position",
    apron: "apron",
    aircraft_parking: "aircraft_parking",
    gate: "gate",
    terminal: "terminal",
    hangar: "hangar",
    grass: "grass",
    navigation_aid: "navigation_aid",
    windsock: "windsock",
    public_parking: "public_parking",
    service_road: "service_road",
    tower: "tower",
    spaceport: "spaceport",
    airstrip: "airstrip"
}

/// <summary>
/// Position Enumeration
/// </summary>
export const Position_e = {
    Polygon: "Polygon",
    Line: "Line",
    Point: "Point"
}


export class GeoPoint {
    X;
    Y;
    Z;

    constructor(x, y, z=0) {
        this.X = x;
        this.Y = y;
        this.Z = z;
    }

    /// <summary>
    /// Distances from another point.
    /// </summary>
    /// <param name="from">From position</param>
    /// <returns>Distance in arc degrees</returns>
    DistanceFrom(from) {
        return Math.sqrt(Math.pow(this.X - from.X, 2) + Math.pow(this.Y - from.Y, 2) + Math.pow(this.Z - from.Z, 2));
    }

    get key() {
        return Symbol.for(`Key[${this.X}:${this.Y}:${this.Z}]`);
    }

}


/// <summary>
/// Class defining a Aeroway
/// </summary>
export class Aeroway {

    /// <summary>
    /// Returns the type of the Way
    /// </summary>
    /// <value>
    /// The type of the way.
    /// </value>
    WayType;

    /// <summary>
    /// Gets and Sets the Name
    /// </summary>
    /// <value>
    /// The name.
    /// </value>
    Name;

    /// <summary>
    /// Dictionary of tags
    /// </summary>
    /// <value>
    /// The tags.
    /// </value>
    Tags;

    /// <summary>
    /// List of Points defining this Aeroway
    /// </summary>
    /// <value>
    /// The points.
    /// </value>
    Points

    /// <summary>
    /// Defines how to process Points
    /// </summary>
    /// <value>
    /// The type of the area.
    /// </value>
    AreaType;

    /// <summary>
    /// Converts a string to a Way type
    /// </summary>
    /// <param name="wayValue">String way type</param>
    SetWayType(wayValue) {
        this.WayType = Aeroway_e[wayValue];
    }

    /// <summary>
    /// Returns the ICAO or FAA code for this airport
    /// </summary>
    /// <value>
    /// The icao.
    /// </value>
    get ICAO() {

        if ("icao" in this.Tags)
            return this.Tags["icao"];
        else
            if ("faa" in this.Tags)
                return this.Tags["faa"];

        return this.Name;

    }

    /// <summary>
    /// Generates a String of this class
    /// </summary>
    /// <returns>
    /// A <see cref="System.String" /> that represents this instance.
    /// </returns>
    ToString() {
        return "[" + this.WayType + "," + this.Name + "] " + this.AreaType + " " + this.Points.join();
    }
}