// app.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var yelp       = require('./models/yelp');  // call Yelp API
var db         = require('./models/db');    // call mongoDB database connection
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var Restaurant  = require('./models/restaurant');
var Request = require('./models/request');

var port = process.env.PORT || 8000;        //  our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests. Probably want to check authentication here
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening. A request was sent to our API.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://mealcarrier.com:8080/api)
router.get('/', function(req, res) {
    res.json([{ message: 'Welcome to the Meal Carrier API!' },{1:1},{1:1},{1:1},{1:1},{1:1}]);   
});

// more routes for our API will happen here

// ___________________________________________________________________


// on routes that end in /restaurants/last-modified
// check when the last time the restaurants collection was modified
router.route('/restaurants/last-modified')
    .get(function(req, res) {
        Restaurant.find({}).sort('-modified').exec(function(err, restaurants) {
            if (err) {
                log(err, req, "/restaurants/last-modified");
                res.send(null);//res.json({"successful": false, "message": err});
            }
            res.json(restaurants[0].modified);
        });
    });

// on routes that end in /restaurants
// ----------------------------------------------------
router.route('/restaurants')

    // create a restaurant (accessed at POST http://mealcarrier.com:8080/restaurants)
    .post(function(req, res) {
        
        var restaurant = new Restaurant();      // create a new instance of the Restaurant model

        restaurant.name = req.body.name;                    // set the restaurant's name
        restaurant._id = req.body.name;                      // set the restaurant's ID
        restaurant.address = req.body.address;              // set the restaurant's address
        restaurant.cross_streets = req.body.cross_streets;  // set cross streets
        restaurant.neighborhoods = req.body.neighborhoods.toString().split(", "); // set the neighborhoods array
        restaurant.city = req.body.city;                    // set the restaurant's city
        restaurant.state_code = req.body.state_code;        // set the restaurant's state
        restaurant.postal_code = req.body.postal_code;      // set the restaurant's zip code
        restaurant.country_code = req.body.country_code;    // set the restaurant's country code

        // var center = [];
        // center[0] = req.body.latitude;  // update the restaurant location's latitude
        // center[1] = req.body.longitude; // update the restaurant location's longitude

        // update latitude and longitude of restaurant
        restaurant.center = {
            "latitude": parseFloat(req.body.latitude),
            "longitude": parseFloat(req.body.longitude)
        };

        // set the restaurant's display address
        var display_address = [];
        display_address[0] = restaurant.address;
        display_address[1] = restaurant.cross_streets;
        display_address[2] = restaurant.neighborhoods;
        display_address[3] = restaurant.city + ', ' + restaurant.state_code + ' ' + restaurant.postal_code;
        restaurant.display_address = display_address;

        restaurant.phone = req.body.phone;                  // set the restaurant's phone number
        restaurant.display_phone = req.body.phone;          // FIX LATER so it's in +1-234-567-8901" format
        restaurant.is_closed = req.is_closed;               // set the restaurant's business status
        restaurant.image_url = req.image_url;               // set the restaurant's image URL

        // save the restaurant and check for errors
        restaurant.save(function(err) {
            if (err) {
                log(err, req, "/requests/create")
                res.json({"successful": false, "message": err});
            }
            else {
                res.json({"successful": true, "message": 'Restaurant created!' });
            }
        });
        
    })

    // get all the restaurants (accessed at GET http://mealcarrier.com:8080/restaurants)
    .get(function(req, res) {
        Restaurant.find(function(err, restaurants) {
            if (err) {
                log(err, req, "/restaurants");
                res.send(null);//res.json({"successful": false, "message": err});
            }
            res.json(restaurants);
        });
	    // var limit = req.query.limit || 15;

	    // // get the max distance or set it to 0.2 kilometers
	    // var maxDistance = req.query.distance || 0.1;

	    // // we need to convert the distance to radians
	    // // the radius of Earth is approximately 6371 kilometers
	    // maxDistance /= 6371;

	    // // get coordinates [ <longitude> , <latitude> ]
	    // var coords = [];
	    // coords[0] = req.query.dropoff_longitude;
	    // coords[1] = req.query.dropoff_latitude;

	    // // find a restaurant
	    // Restaurant.find({
	    //   center: {
	    //     $near: coords,
	    //     $maxDistance: maxDistance
	    //   }
	    // }).limit(limit).exec(function(err, restaurants) {
	    //   if (err) {
	    //     return res.json(500, err);
	    //   }

	    //   res.json(200,restaurants);
	    // });
	});

// on routes that end in /restaurants/:restaurant_id
// ----------------------------------------------------
router.route('/restaurants/:restaurant_id')

    // get the restaurant with that id (accessed at GET http://mealcarrier.com:8080/restaurants/:restaurant_id)
    .get(function(req, res) {
        Restaurant.findById(req.params.restaurant_id, function(err, restaurant) {
            if (err) {
                log(err, req, "/restaurants/:restaurant_id");
                res.send(null);//res.json({"successful": false, "message": err});
            }
            res.json(restaurant);
        });
    })

    // update the restaurant with this id (accessed at PUT http://mealcarrier.com:8080/restaurants/:restaurant_id)
    .put(function(req, res) {

        // use our restaurant model to find the restaurant we want
        Restaurant.findById(req.params.restaurant_id, function(err, restaurant) {

            if (err)
                res.send(err);

            restaurant.name = req.body.name;                    // update the restaurant's name
            restaurant._id = req.body.name;                      // set the restaurant's ID
            restaurant.address = req.body.address;	            // update the restaurant's address
            restaurant.cross_streets = req.body.cross_streets;  // update cross streets
            restaurant.neighborhoods = req.body.neighborhoods.toString().split(", "); // update the neighborhoods array
            restaurant.city = req.body.city;                    // update the restaurant's city
            restaurant.state_code = req.body.state_code;        // update the restaurant's state
            restaurant.postal_code = req.body.postal_code;      // update the restaurant's zip code
            restaurant.country_code = req.body.country_code;    // update the restaurant's country code

            // var center = [];
            // center[0] = req.body.latitude;  // update the restaurant location's latitude
            // center[1] = req.body.longitude; // update the restaurant location's longitude

            // update latitude and longitude of restaurant
            restaurant.center = {
                "latitude": parseFloat(req.body.latitude),
                "longitude": parseFloat(req.body.longitude)
            };

            // update the restaurant's display address
            var display_address = [];
            display_address[0] = restaurant.address;
            display_address[1] = restaurant.cross_streets;
            display_address[2] = restaurant.neighborhoods;
            display_address[3] = restaurant.city + ', ' + restaurant.state_code + ' ' + restaurant.postal_code;
            restaurant.display_address = display_address;

            restaurant.phone = req.body.phone;                  // update the restaurant's phone number
            restaurant.display_phone = req.body.phone;          // FIX LATER so it's in +1-234-567-8901" format
            restaurant.is_closed = req.is_closed;               // update the restaurant's business status
            restaurant.image_url = req.image_url;               // update the restaurant's image URL
            restaurant.modified = new Date();

            // save the restaurant
            restaurant.save(function(err) {
                if (err) {
                    log(err, req, "/requests/create")
                    res.json({"successful": false, "message": err});
                }
                else {
                    res.json({"successful": true, "message": 'Restaurant ' + restaurant.name + ' updated!' });
                }
            });

        });
    })

    // delete the restaurant with this id (accessed at DELETE http://mealcarrier:8080/api/restaurants/:restaurant_id)
    .delete(function(req, res) {
        Restaurant.remove({
            _id: req.params.restaurant_id
        }, function(err, result) {
            if (err) {
                log(err, req, "/requests/create")
                res.json({"successful": false, "message": err});
            }
            else {
                res.json({"successful": true, "message": 'Restaurant deleted!' });
            }
        });
    });

// ___________________________________________________________________

// on routes that end in /requests
// ----------------------------------------------------
router.route('/requests')

    // get all the requests (accessed at GET http://mealcarrier.com:8080/requests)
    .get(function(req, res) {
        Request.find(function(err, requests) {
            if (err) {
                log(err, req, "/requests");
                res.send(null);//res.json({"successful": false, "message": err});
            }
            res.json(requests);
        });
    });

// ___________________________________________________________________

// on routes that end in /requests/create
// ----------------------------------------------------
router.route('/requests/create')

    // create a request (accessed at POST http://mealcarrier.com:8080/requests)
    .post(function(req, res) {
        console.log("hello");
        var request = new Request();            // create a new instance of the Request model
        request.user_id = req.body.user_id;     // set the request name (comes from req)
        request.time = req.body.time;           // set the request timestamp (comes from req)

        var pickup_location = [];
        var dropoff_location = [];
        pickup_location[0] = req.body.pickup_longitude; // set the request pickup location
        pickup_location[1] = req.body.pickup_latitude;  // set the request pickup location
        dropoff_location[0] = req.body.dropoff_longitude;   // set the request dropoff location
        dropoff_location[1] = req.body.dropoff_latitude;    // set the request dropoff location
        request.pickup_location = pickup_location;
        request.dropoff_location = dropoff_location;

        request.special_instructions = req.body.special_instructions;   // set the special instructions
        request.active = req.body.active;   // set request active (TRUE) or canceled/completed (FALSE)

        // save the request and check for errors
        request.save(function(err) {
            if (err) {
                log(err, req, "/requests/create")
                res.json({"successful": false, "message": err});
            }
            else {
                res.json({"successful": true, "message": 'Request created!' });
            }
        });
        
    });

// on routes that end in /requests/:request_id
// ----------------------------------------------------
router.route('/requests/:request_id')

    // get the request with that id (accessed at GET http://mealcarrier.com:8080/requests/:request_id)
    .get(function(req, res) {
        Request.findById(req.params.request_id, function(err, request) {
            if (err)
                res.send(err);
            res.json(request);
        });
    })

    // update the request with this id (accessed at PUT http://mealcarrier.com:8080/requests/:request_id)
    .put(function(req, res) {

        // use our request model to find the request we want
        Request.findById(req.params.request_id, function(err, request) {

            if (err)
                res.send(err);

	        request.user_id = req.body.user_id;  // update the request name (comes from req)
	        request.time = req.body.time; // update the request timestamp (comes from req)

            var pickup_location = [];
            var dropoff_location = [];
            pickup_location[0] = req.body.pickup_longitude; // set the request pickup location
            pickup_location[1] = req.body.pickup_latitude;  // set the request pickup location
            dropoff_location[0] = req.body.dropoff_longitude;   // set the request dropoff location
            dropoff_location[1] = req.body.dropoff_latitude;    // set the request dropoff location

	        request.pickup_location = req.body.pickup_location;	// update the request pickup location
	        request.dropoff_location = req.body.dropoff_location;	// update the request dropoff location
	        request.special_instructions = req.body.special_instructions;	// update the special instructions
	        request.active = req.body.active;	// update request active (TRUE) or canceled/completed (FALSE)

            // save the request
            request.save(function(err) {
                if (err) {
                    log(err, req, "/requests/create")
                    res.json({"successful": false, "message": err});
                }
                else {
                    res.json({"successful": true, "message": 'Request updated!' });
                }
            });

        });
    })

    // delete the request with this id (accessed at DELETE http://mealcarrier:8080/api/requests/:request_id)
    .delete(function(req, res) {
        Request.remove({
            _id: req.params.request_id
        }, function(err, result) {
            console.log(request);
            if (err) {
                log(err, req, "/requests/create")
                res.json({"successful": false, "message": err});
            }
            else {
                res.json({"successful": true, "message": 'Request deleted!' });
            }
        });
    });

// ___________________________________________________________________

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /
app.use('/', router);

// Enable CORS Header on ExpressJS from http://enable-cors.org/server_expressjs.html
//app.use(function(req, res, next) {
//  res.header("Access-Control-Allow-Origin", "*");
//  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//  next();
//});

// START THE SERVER
// =============================================================================
app.listen(port, 'localhost', function() {
  console.log("Meal Carrier running on port " + port);
});

log = function(error_message, req, route){
    console.log(Date.now);
    console.log(req);
    console.log(err);
    console.log("From:" + route);
}
