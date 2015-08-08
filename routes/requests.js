module.exports = function(router){
    var Request = require('../models/request');
    var Restaurant  = require('../models/restaurant');
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
            console.log("Creating new Request...");
            var request = new Request();            // create a new instance of the Request model
            request.user_id = req.body.user_id;     // set the request name (comes from req)
            request.time = req.body.time;           // set the request timestamp (comes from req)

            var pickup_location = [];
            var dropoff_location = [];
            // pickup_location[0] = req.body.pickup_longitude; // set the request pickup location
            // pickup_location[1] = req.body.pickup_latitude;  // set the request pickup location
            dropoff_location[0] = req.body.dropoff_longitude;   // set the request dropoff location
            dropoff_location[1] = req.body.dropoff_latitude;    // set the request dropoff location
            request.dropoff_location = dropoff_location;
            request.restaurant_id = req.body.restaurant_id;
            request.delivery_notes = req.body.delivery_notes;   // set the special instructions
            request.active = req.body.active;   // set request active (TRUE) or canceled/completed (FALSE)

            // Find restaurant by ID and save as object in request
            // var restaurant = new Restaurant();
            // // use our restaurant model to find the restaurant we want
            // Restaurant.findById(req.body.restaurant_id, { lean: true }, function(err, restaurant) {
            //     if (err)
            //         res.send(err);
            //     console.log(restaurant);
            // });
            // request.restaurant = Restaurant.findById(req.body.restaurant_id)
            // .select('restaurant.center')
            // .lean().stream();
            // request.restaurant = restaurant;
            // pickup_location[0] = restaurant.center[0]; // set the request pickup longitude based on restaurant
            // pickup_location[1] = restaurant.center[1];  // set the request pickup latitude based on restaurant                
            // request.pickup_location = pickup_location;
            // console.log("Restaurant location: " + request.restaurant.center[0] + request.restaurant.center[1]);
            // save the request and check for errors
            request.save(function(err) {
                if (err) {
                    log(err, req, "/requests/create")
                    res.json({"success": false, "message": err});
                }
                else {
                    res.json({"success": true, "message": 'Request created!' });
                }
            });
        });
    // ___________________________________________________________________

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
    	        request.delivery_notes = req.body.delivery_notes;	// update the special instructions
    	        request.active = req.body.active;	// update request active (TRUE) or canceled/completed (FALSE)
                request.accepted = req.body.accepted; // update request accepted (TRUE) or available (FALSE)
                request.carrier_id = req.body.carrier_id;     // update carrier's user_id
                // save the request
                request.save(function(err) {
                    if (err) {
                        log(err, req, "/requests/create")
                        res.json({"success": false, "message": err});
                    }
                    else {
                        res.json({"success": true, "message": 'Request updated!' });
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
                    log(err, req, "/requests/:request_id")
                    res.json({"success": false, "message": err});
                }
                else {
                    res.json({"success": true, "message": 'Request deleted!' });
                }
            });
        });
}