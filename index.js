require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var _ = require('lodash');
const http = require("https");

const app = express();
var cityName ='';

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://aarm_user:travelogue@mongoDB@cluster0.uo37s.mongodb.net/Travelogue?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('connected', () =>{
  console.log("Mongose is connected!!!!");
});
const citySchema = new mongoose.Schema({
  city: String,
  state: String,
  description: String,
  category: String,
  spots: {
    Thriller: String,
    Spiritual: String
  },
  imageUrl: String
});
const City = mongoose.model("City", citySchema);


app.get("/cities", function (req, res) {
City.find({}, function (err, cities) {
  if(!err){
    res.render("cities", {
      cities: cities
    });
    }
  else {
    console.log(err);
  }
});
});


app.get('/places', function (req, res) {
  const options = {
  	"method": "GET",
  	"hostname": "travel-advisor.p.rapidapi.com",
  	"port": null,
  	"path": "/locations/search?query="+cityName+"&limit=30&offset=0&units=km&location_id=1&currency=USD&sort=relevance&lang=en_US",
  	"headers": {
  		"x-rapidapi-key": "60d5520338msh876e8fef602878bp1db719jsn24c1f26bab71",
  		"x-rapidapi-host": "travel-advisor.p.rapidapi.com",
  		"useQueryString": true
  	}
  };
http.get(options, function(response){
  const travel = [];
  response.on("data", function(data){
    travel.push(data);
  });
  response.on("end", function () {
  		const body = Buffer.concat(travel);
  		travelData = JSON.parse(body);
      res.render("places", {
        travelData: travelData
      });
      // res.send(travelData);
  	});

});

});


app.get("/", function(req, res) {
    res.render("home");
});
app.post("/", function(req, res){
  cityName = req.body.search_in;
  res.redirect('/places')

});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
