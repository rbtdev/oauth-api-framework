//
//  Common Library for use in all models
//
const Sequelize = require('sequelize');
const GoogleMaps = require('../utils/google-maps');

const METERS_PER_MILE = 1609.34; // Use for distance calc unit conversion

const Common = {
    Utils: {
        //
        // Hook to use GoogleMaps geocoder to geocode an 'address' field returning
        // a lat/lng location object.
        // 
        // Sets a 'location' postgis column to the lat/lng
        //
        geocode: (addressColumn, locationColumn) => {
            return async (model, options) => {
                if (model[addressColumn]) {
                    let [err, location] = await GoogleMaps.geocode({ address: model[addressColumn] });
                    if (err) return Sequelize.Promise.reject(err);
                    model[locationColumn] = {
                        type: 'Point',
                        coordinates: [location.lng, location.lat],
                        crs: { type: 'name', properties: { name: 'EPSG:4326' } }
                    }
                }
            }
        },

        //
        // Hook to use GoogleMaps timezone to determine a timezone for a specific 
        // a lat/lng location object.
        // 
        // The JSON result is inserted into a JSONB column in the model
        //
        timezone: (locationColumn, timezoneColumn) => {
            return async (model, options) => {
                if (model[locationColumn]) {
                    let location = {
                        lat: model[locationColumn].coordinates[1],
                        lng: model[locationColumn].coordinates[0]
                    }
                    let [err, timezone] = await GoogleMaps.timezone({ location: location });
                    if (err) return Sequelize.Promise.reject(err);
                    model[timezoneColumn] = timezone;
                }
            }
        }
    },
    //
    // Scopes are reusable 'where" clauses which can be applied to 
    // multiple models
    //
    Scopes: {
        //
        // Distance scope: Create where clause for selecting within a radius
        // of a geo point based on a center point
        //
        // Bound to a model and a location column
        // 
        distance: function (locationColumn) {
            // Create a closure with locationColumn captured
            return function (center, radius) {
                // Check units and convert to meters
                if (radius.units && radius.units === 'miles') {
                    radius.value = radius.value * METERS_PER_MILE;
                };

                // Set up geo calculations for where clause and add a virtual column
                let attributes = Object.keys(this.attributes);
                let location = Sequelize.literal(`ST_GeomFromText('POINT(${center.lng} ${center.lat})')`);
                let distance = Sequelize.fn('ST_Distance_Sphere', Sequelize.literal(locationColumn), location);
                attributes.push([distance, 'distance']);

                // Return a where clause for distance
                return {
                    where: {
                        $and: [
                            Sequelize.where(distance, { $lte: radius.value })
                        ]
                    }
                }
            }
        },

        //
        // Define a region scope which takes a rectangular region and 
        // finds all rows which are within the rectangle
        //
        region: function (locationColumn) {
            // Create a closure with locationColumn captured
            return function (region) {
                // Create a geo envelope for the region we're interested in
                let top = region.latitude - region.latitudeDelta / 2;
                let bottom = region.latitude + region.latitudeDelta / 2;
                let left = region.longitude - region.longitudeDelta / 2;
                let right = region.longitude + region.longitudeDelta / 2;
                // Return a where clause for envelope overlap with location column
                return {
                    where: {
                        location: { $overlap: Sequelize.fn('ST_MakeEnvelope', left, top, right, bottom, 4326) }
                    }
                }
            }
        }
    }
}

module.exports = Common;