//Dependencies
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const exphbs  = require('express-handlebars');

// Handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//activates body-parser 
app.use(bodyParser.urlencoded({
  extended: false
}));

// make public a static dir
app.use(express.static('public'));

const routes = require('./controllers/controller.js');
app.use('/', routes);

// listen on port 3000
app.listen(process.env.PORT || 3000,function(){
 process.env.PORT == undefined?
 console.log("Running on PORT 3000"):
 console.log("Running on PORT" + process.env.PORT);
});
