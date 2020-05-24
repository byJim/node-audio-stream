const express = require('express');
const morgan = require('morgan');//See the petitions.
const cors = require('cors')//Communicate this server with another one.

const tracksRoutes = require('./routes/tracks.routes.js');

//Initializations
const app = express();

//Middleware
app.use(cors());
app.use(morgan('dev'));

//Routes
app.use(tracksRoutes);

app.listen(3000);
console.log("Server successfully initialized\nOn port 3000")


