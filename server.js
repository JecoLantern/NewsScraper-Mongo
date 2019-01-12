// Dependencies
var express = require("express");
var path = require("path");
var exphbs = require("express-handlebars");
var favicon = require("serve-favicon");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

// use promises
mongoose.Promise = Promise;

// App Init
var app = express();

// Render Content
app.use(express.static(path.join(__dirname, "public")));

var PORT = process.env.PORT || 3000;

// HandleBss
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Favicon
app.use(favicon(path.join(__dirname, "public/assets/img", "favicon.png")));

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
var routes = require('./controllers/controller');
app.use("/", routes);

// Connect Database
// var connectionString;
// if (process.env.PORT) {
//     connectionString = '';
// } else {
//     connectionString = 'mongodb://localhost/mongonews';
// }

var MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/mongonews'

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Listen
// mongoose.connect(connectionString).then(function() {
//     app.listen(PORT, function() {
//         console.log('Listening on Port ' + PORT);
//     });
// });

app.listen(PORT, function() {
    console.log('Listening on Port ' + PORT);
});
