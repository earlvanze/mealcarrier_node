// app.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var cors       = require('cors')            // call cors (from https://github.com/expressjs/cors)
var app        = express();                 // define our app using express
var yelp       = require('yelp');  // call Yelp API
var db         = require('./models/db');    // call mongoDB database connection
var bodyParser = require('body-parser');
var jwt        = require('jsonwebtoken'); // used to create, sign, and verify tokens
var pw_hasher  = require('password-hash');  // call password hasher node package

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.options('*', cors()); // include before other routes to enable CORS pre-flight
app.use(cors());
app.set('superSecret', "p2pdelivery"); // secret variable

var Restaurant  = require('./models/restaurant');
var Request = require('./models/request');
var User   = require('./models/user'); // get our mongoose model

var port = process.env.PORT || 8000;        //  our port

//Enable CORS Header on ExpressJS from http://enable-cors.org/server_expressjs.html
//Comment out if nothing works
// app.use(function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     next();
// });

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests. Probably want to check authentication here
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening. A request was sent to our API.');
    console.log(req.headers.authorization);
    next(); // make sure we go to the next routes and don't stop here
});


// test route to make sure everything is working (accessed at GET http://mealcarrier.com:8080/api)
router.get('/', function(req, res) {
    res.json([{ message: 'Welcome to the Meal Carrier API!' }]);   
});

// more routes for our API will happen here

// ___________________________________________________________________

// on routes that end in /register
// ----------------------------------------------------
router.route('/register') 

    .post(function(req, res) {
        // check if email address (user) already exists
        // currently gives error at next line saying User is not defined
        User.findOne({
            email: req.body.email
        }, function(err, user) {

            if (err) throw err;
            // user email already exists
            if (user) {
                res.json({ success: false, message: 'Email address is already in use!' });
            } else if (!user) {
                // email does not exist - create a new user
                var user = new User();
                // user._id = req.body.email,
                user.first_name =  req.body.first_name; 
                user.last_name =  req.body.last_name;
                user.email = req.body.email;
                // user.password = req.body.password;
                user.confirm_password = req.body.confirm_password;
                user.admin = req.body.admin;
                // check if password confirmation matches
                if (req.body.password != req.body.confirm_password) {
                    res.json({ success: false, message: "Passwords must match.\nPassword: " + 
                        req.body.password + "\nConfirm Password: " + req.body.confirm_password });
                } else {
                    // if passwords match
                    console.log("Authenticating...")
                    console.log(req.body.email)
                    console.log(req.body.password)
                    user.password = pw_hasher.generate(req.body.password);

                    // save the sample user
                    user.save(function(err) {
                        if (err) {
                            log(err, req, "/register")
                            res.json({success: false, "message": err});
                        }
                        else {
                            // create a token
                            var token = jwt.sign(user._id, app.get('superSecret'), {
                                expiresInMinutes: 10080 // expires in 1 week
                            });
                            // return the information including token as JSON
                            res.json({
                                success: true,
                                message: 'User saved successfully! Enjoy your token!',
                                token: token
                            });
                        }
                    });
                }  
            }
        });
    });

// ___________________________________________________________________

// on routes that end in /authenticate
// ----------------------------------------------------
// route to authenticate a user (accessed at POST http://mealcarrier.com:8080/authenticate)
router.route('/authenticate')

    // Using an existing user, generate and return an authentication token
    .post(function(req, res) {
        console.log("Authenticating...")
        // console.log(req)
        console.log(req.body.email)
        console.log(req.body.password)
        // console.log(req)
        // console.log(req.body)
        // find the user
        User.findOne({
            email: req.body.email
        }, function(err, user) {

            if (err) throw err;

            if (!user) {
                res.json({ success: false, message: 'Authentication failed. Email not found.' });
            } else if (user) {
                // check if password matches
                if (!pw_hasher.verify(req.body.password, user.password)) {
                    res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                } else {
                    // if user is found and password is right
                    // create a token
                    var token = jwt.sign(user, app.get('superSecret'), {
                        expiresInMinutes: 10080 // expires in 1 week
                    });

                    // get the decoded payload ignoring signature, no secretOrPrivateKey needed
                    var decoded = jwt.decode(token);

                    // get the decoded payload and header
                    var decoded = jwt.decode(token, {complete: true});

                    // return the information including token as JSON
                    res.json({
                        success: true,
                        message: 'Enjoy your token!',
                        token: token,
                        decoded: decoded
                    });
                }  
            }
        });
    });

require('./routes/restaurants.js')(router);
// require('./routes/requests.js')(router);
// ___________________________________________________________________

// middleware to verify a token - protects all routes below this route
// ----------------------------------------------------
router.use(function(req, res, next) {
    // console.log(req)
  // check header or url parameters or post parameters for token
  var token = req.headers.authorization.split(' ')[1];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
      if (err) {
        log(err, req, token)
        console.log(err)
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
    } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        // console.log(req.decoded);
        // console.log(next());
        next();
    }
});

} else {

    // if there is no token
    // return an error
    console.log("There is no token.")
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
}
});

// ___________________________________________________________________

// on routes that end in /requests
// ----------------------------------------------------

require('./routes/requests.js')(router);

// ___________________________________________________________________

// on routes that end in /users/:user_id
// ----------------------------------------------------
router.route('/users/:user_id') 

    // get the user with that id (accessed at GET http://mealcarrier.com:8080/users/:user_id)
    .get(function(req, res) {
        User.findById(req.params.user_id, function(err, user) {
            if (err)
                res.send(err);
            res.json(user);
        });
    })

    // update the request with this id (accessed at PUT http://mealcarrier.com:8080/users/:user_id)
    .put(function(req, res) {

        // use our request model to find the user we want
        User.findById(req.params.user_id, function(err, user) {

            if (err)
                res.send(err);

            user.first_name = req.body.first_name, 
            user.last_name = req.body.last_name,
            user.email = req.body.email,
            user.password = req.body.password,
            user.admin = req.body.admin;

            // save the sample user
            user.save(function(err) {
                if (err) {
                    log(err, req, "/users/:user_id")
                    res.json({success: false, "message": err});
                }
                else {
                    res.json({success: true, "message": 'User updated successfully!' });
                }
            });
        });
    })

    // delete the user with this id (accessed at DELETE http://mealcarrier:8080/api/requests/:request_id)
    .delete(function(req, res) {
        User.remove({
            _id: req.params.user_id
        }, function(err, result) {
            console.log(request);
            if (err) {
                log(err, req, "/users/:user_id")
                res.json({success: false, "message": err});
            }
            else {
                res.json({success: true, "message": 'User deleted!' });
            }
        });
    });




// ___________________________________________________________________

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /
app.use('/', router);


// START THE SERVER
// =============================================================================
app.listen(port, 'localhost', function() {
  console.log("Meal Carrier running on port " + port);
});

log = function(err, req, route){
    console.log(Date.now);
    console.log(req);
    console.log(err);
    console.log("From:" + route);
}