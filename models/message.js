var mongoose = require("mongoose");
var Scheme = mongoose.Schema;

var MessageSchema = new Schema({
    _id: String,
    from: String,
    to: String,
    text: String,
    modified: {type: Date, default: Date.now}
});
