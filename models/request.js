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
    special_instructions: String,
    active: {type: Boolean, default: 'TRUE'}
});

module.exports = mongoose.model('Request', RequestSchema);