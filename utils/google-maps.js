const GOOGLE_API_KEY = require('../config').googleAPIKey;
const GoogleMaps = require('@google/maps').createClient({
    key: GOOGLE_API_KEY,
    Promise: Promise
});

GoogleMapsWrapper = {
    async geocode(...args) {
        let err = null;
        let location = null;
        try {
            let response = await GoogleMaps.geocode(...args).asPromise();
            location = response.json.results[0]
                ? response.json.results[0].geometry.location
                : { lat: '', lng: '' }
        }
        catch (ex) {
            err = ex
        }
        return [err, location]
    },

    async timezone(...args) {
        let err = null;
        let timezone = null;
        try {
            let response = await GoogleMaps.timezone(...args).asPromise();
            timezone = response.json.status === 'OK' ? {
                dstOffset: response.json.dstOffset,
                rawOffset: response.json.rawOffset,
                timeZoneId: response.json.timeZoneId,
                timeZoneName: response.json.timeZoneName
            } : {}
        }
        catch (ex) {
            err = ex
        }
        return [err, timezone]
    }
}

module.exports = GoogleMapsWrapper;