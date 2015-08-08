module.exports = function(router){
    var Restaurant  = require('../models/restaurant');
    // ___________________________________________________________________

    // on routes that end in /restaurants/last-modified
    // check when the last time the restaurants collection was modified
    router.route('/restaurants/last-modified')
    .get(function(req, res) {
        Restaurant.find({}).sort('-modified').exec(function(err, restaurants) {
            if (err) {
                log(err, req, "/restaurants/last-modified");
                res.send(null);//res.json({success: false, "message": err});
            }
            res.json(restaurants[0].modified);
        });
    });

    // ___________________________________________________________________

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
                    res.json({success: false, "message": err});
                }
                else {
                    res.json({success: true, "message": 'Restaurant created!' });
                }
            });
            
        })

        // get all the restaurants (accessed at GET http://mealcarrier.com:8080/restaurants)
        .get(function(req, res) {
            Restaurant.find(function(err, restaurants) {
                if (err) {
                    log(err, req, "/restaurants");
                    res.send(null);//res.json({success: false, "message": err});
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

    // ___________________________________________________________________

    // on routes that end in /restaurants/:restaurant_id
    // ----------------------------------------------------
    router.route('/restaurants/:restaurant_id')

        // get the restaurant with that id (accessed at GET http://mealcarrier.com:8080/restaurants/:restaurant_id)
        .get(function(req, res) {
            Restaurant.findById(req.params.restaurant_id, function(err, restaurant) {
                if (err) {
                    log(err, req, "/restaurants/:restaurant_id");
                    res.send(null);//res.json({success: false, "message": err});
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
                restaurant.address = req.body.address;              // update the restaurant's address
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
                        res.json({success: false, "message": err});
                    }
                    else {
                        res.json({success: true, "message": 'Restaurant ' + restaurant.name + ' updated!' });
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
                    res.json({success: false, "message": err});
                }
                else {
                    res.json({success: true, "message": 'Restaurant deleted!' });
                }
            });
        });
}
