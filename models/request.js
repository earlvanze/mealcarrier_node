var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var RequestSchema   = new Schema({
    user_id: String,
    time: {type: Date, default: Date.now},
    // pickup_location: {
    // 	type: [Number], // [<longitude>, <latitude>]
    // 	index: '2d',				// create the geospatial index
    //     default: []
    // },
    // dropoff_location: {
    // 	type: [Number], // [<longitude>, <latitude>]
    // 	index: '2d',				// create the geospatial index
    //     default: []
    // },
    pickup_location: Object,
    dropoff_location: Object,
    restaurant_id: String,
    restaurant: Object,
    delivery_notes: String,
    active: {type: Boolean, default: true},
    accepted: {type: Boolean, default: false},
    carrier_id: String
});

module.exports = mongoose.model('Request', RequestSchema);