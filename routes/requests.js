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
                    res.send(null);
                    res.json({"successful": false, "message": err});
                }
                res.json(requests);
            });
        });

    // on routes that end in /requests/available
    // ----------------------------------------------------
    router.route('/requests/available')

        // get currently open requests (accessed at GET http://mealcarrier.com:8080/requests/available)
        .get(function(req, res) {
            Request.find({'accepted': false}, function(err, requests) {
                if (err) {
                    log(err, req, "/requests/available");
                    res.send(null);
                    res.json({"successful": false, "message": err});
                }
                // console.log(typeof requests[0].accepted);
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
            // request.active = req.body.active;   // set request active (TRUE) or canceled/completed (FALSE)
            // Defaults to true. Set to false when delivery is completed.
            // request.accepted = req.body.accepted;   // set request accepted (TRUE) or not yet accepted (FALSE) defaults to false

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
                Restaurant.findById(request.restaurant_id, function(err, restaurant) {
                    if (err)
                        res.send(err);
                    if (restaurant == null) {
                        res.json(null);
                    }
                    else {
                        request.pickup_location = restaurant.center; // update the request pickup location
                        res.json(request);
                    }
                })
            });
        })

        // update the request with this id (accessed at PUT http://mealcarrier.com:8080/requests/:request_id)
        .put(function(req, res) {

            // use our request model to find the request we want
            Request.findById(req.params.request_id, function(err, request) {
                if (err)
                    res.send(err);

                // Loop through request for any field being changed, and then set the request accordingly
                for (var key in req.body) {
                    // TODO: Implement whitelist or blacklist so that people cannot change the restaurant_id, _id, or user_id
                    request[key] = req.body[key];
                }
                console.log(request);
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