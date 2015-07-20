var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var RestaurantSchema   = new Schema({
    _id: String,
    name: String,
    address: String,
    cross_streets: String,
    neighborhoods: [String],
    city: String,
    state_code: {type: String, default: 'NY'},
    postal_code: Number,
    country_code: {type: String, default: 'US'},
    // center: {
    // 	type: [Number], // [<longitude>, <latitude>]
    // 	index: '2d'		// create the geospatial index
    // },
    center: Object,
    display_address: [String],
    phone: Number,
    display_phone: String,
    is_closed: {type: Boolean, default: false},
    image_url: String,
    modified: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);