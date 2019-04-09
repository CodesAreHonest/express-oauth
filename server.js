let express = require('express');
app = express();

let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let morgan = require('morgan');
let passport = require('passport');
let config = require('./config/main');

let User = require('./app/models/user');
let jwt = require('jsonwebtoken');
let port = 3000;

// use body-parser to get POST request for API Use
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// log request to console
app.use(morgan('dev'));

// Initialize passport
app.use(passport.initialize());

// Connect to db
mongoose.connect(config.database);

// Bring in the passport strategy we just defined
require("./config/passport")(passport);

// Create API Routes
let apiRoutes = express.Router();

// Register new Users
apiRoutes.post('/register', function(req, res) {
   if (!req.body.email || !req.body.password) {
       res.json({success: false, message: 'Please enter a email and password to register.'})
   }

   let newUser = new User({
       email: req.body.email,
       password: req.body.password

   });

   // Attempt to save the new user
    newUser.save(function(err) {
        if (err) {
            return res.json({success: false, message: 'That email address already exists. '});
        }

        res.json ({success: true, message: 'Successfully created new user.'});
    })
});

// Authenticate the user and get a JWT
apiRoutes.post('/authenticate', function (req, res) {
    User.findOne({
        email: req.body.email
    }, function(err, user) {
        if (err) { throw err; }

        if (!user) {
            res.send({success: false, message: 'Authentication failed. User not found.'});
        } else {
            // Check if the password matches
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {

                    // Create the Token
                    let token = jwt.sign(user.toJSON(), config.secret, {
                        expiresIn: 10080 // in seconds.
                    });

                    res.json({success: true, token: 'JWT ' + token});

                }
                else {
                    res.send({success: false, message: 'Authentication failed, password does not match.'});
                }
            })
        }
    })
});

// Protect Dashboard Route with JWT
apiRoutes.get('/dashboard', passport.authenticate('jwt', {session: false}), function (req, res) {
    res.send('It worked! User id is: ' + req.user._id + '.');
});

// Set URL for API Group Routes
app.use('/api', apiRoutes);

// Home Route
app.get('/', function (req, res) {
    res.send('Relax. We will put the home page here later ')
});

app.listen(port);
console.log ('Your server is running on port ' + port + '.');