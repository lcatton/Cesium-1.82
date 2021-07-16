import { Aeroway_e, Position_e, GeoPoint, Aeroway } from './AerowayUtils.js'

export default class GoogleJSON {
    Aeroways;

    constructor(data) {
        this.Aeroways = [];

        var aeroWaysJObject = data.features.filter(function (item) {
            return item.properties.hasOwnProperty('aeroway');
        });
        
        for (const Placemark of aeroWaysJObject) {
            var taxiway = new Aeroway();
            taxiway.Tags = {};
            taxiway.Points = [];

            this.Aeroways.push(taxiway);
            taxiway.Tags = Placemark.properties;

            taxiway.SetWayType(Placemark.properties.aeroway);

            if ("ref" in taxiway.Tags) {
                taxiway.Name = taxiway.Tags["ref"];
            }
            else
                if ("name" in taxiway.Tags) {
                    taxiway.Name = taxiway.Tags["name"];
                }
                else
                    if ("@id" in taxiway.Tags) {
                        taxiway.Name = taxiway.Tags["@id"].replace('/', '_');
                    }


            //Process the cordinates

            switch (Placemark.geometry.type) {
                case "Polygon":
                    taxiway.AreaType = Position_e.Polygon;
                    var coordinates = Placemark.geometry.coordinates[0];
                    break;

                case "LineString":
                    taxiway.AreaType = Position_e.Line;
                    var coordinates = Placemark.geometry.coordinates;
                    break;

                case "Point":
                    taxiway.AreaType = Position_e.Point;
                    let aPoint = Placemark.geometry.coordinates;
                    taxiway.Points.push(new GeoPoint(aPoint[0], aPoint[1]));
                    break;

            }

            if (taxiway.AreaType != Position_e.Point) {
                for (let point of coordinates) {
                    taxiway.Points.push(new GeoPoint(point[0], point[1]));
                }
            }
        }
    }

    FindAerodrome() {
        var collection = this.Aeroways.filter(w => w.WayType == Aeroway_e.aerodrome);
        
        return collection.length < 1 ? null : collection[0];
    }

    FindRunways() {
        return this.Aeroways.filter(i => i.WayType == Aeroway_e.runway && i.AreaType == Position_e.Line);
    }
}