require('dotenv').config();
const mong = require('./config/database')
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
var _ = require('lodash');
const http = require("https");


const app = express();
var cityName = '';
var loclat = 0;
var locLong = 0;
var locID = 0;
var placeName = '';


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mong.mongoDB_connection();
City = mong.City;
Contribution = mong.Contribute;

app.get("/cities", function (req, res) {
  City.find({}, function (err, cities) {
    if (!err) {
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
    "path": "/locations/search?query=" + placeName + "&limit=30&offset=0&units=km&location_id=1&currency=USD&sort=relevance&lang=en_US",
    "headers": {
      "x-rapidapi-key": "60d5520338msh876e8fef602878bp1db719jsn24c1f26bab71",
      "x-rapidapi-host": "travel-advisor.p.rapidapi.com",
      "useQueryString": true
    }
  };
  http.get(options, function (response) {
    const travel = [];
    response.on("data", function (data) {
      travel.push(data);
    });
    response.on("end", function () {
      const body = Buffer.concat(travel);
      travelData = JSON.parse(body);
      res.render("places", {
        travelData: travelData
      });

      //
      // res.send(travelData);
      loclat = travelData.data[0].result_object.latitude;
      locLong = travelData.data[0].result_object.longitude;
      locID = travelData.data[0].result_object.location_id;
    });

  });

});

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/contribute", function (req, res) {
  res.render("contribute")
});




app.get("/hotels", function (req, res) {
  const options = {
    "method": "GET",
    "hostname": "travel-advisor.p.rapidapi.com",
    "port": null,
    "path": "/hotels/list?location_id=" + locID + "&adults=1&rooms=1&nights=2&offset=0&currency=USD&order=asc&limit=30&sort=recommended&lang=en_US",
    "headers": {
      "x-rapidapi-key": "60d5520338msh876e8fef602878bp1db719jsn24c1f26bab71",
      "x-rapidapi-host": "travel-advisor.p.rapidapi.com",
      "useQueryString": true
    }
  };

  http.get(options, function (response) {
    const chunks = [];

    response.on("data", function (chunk) {
      chunks.push(chunk);
    });

    response.on("end", function () {
      const body = Buffer.concat(chunks);
      hotelData = JSON.parse(body);
      res.render("hotels", {
        hotelData: hotelData
      });
    });
  });
});

app.post("/", function (req, res) {
  cityName = _.upperFirst(_.lowerCase(_.toLower(req.body.search_in)));
  res.redirect('/city');
});

app.post("/city", function (req, res) {
  placeName = req.body.places;
  res.redirect('/places');
});

app.get("/city", function (req, res) {
  City.findOne({ city: cityName }, function (err, city) {
    if (!err) {
      Contribution.find({ city: cityName }, function (err, contri) {

        if (!err) {
          res.render("city", { city: city, contribute: contri });
        }
        else {
          console.log(err);
        }
      });
    }
    else {
      console.log("err");
    }
  });


});

app.get("/map", function (req, res) {
  res.render("map");
});



app.post("/contribute", function (req, res) {
  const contribution = new Contribution({
    city: _.upperFirst(_.lowerCase(_.toLower(req.body.inputCity))),
    state: req.body.inputState,
    author: req.body.inputName,
    description: req.body.inputDescription,
  });
  contribution.save(function (err) {
    if (!err) {
      res.redirect("/contribute")
    }
    else {
      console.log(err);
    }
  });
});




let port = process.env.PORT;
if(port==null||port==""){
  port=3000;
}
app.listen(port, function () {
  console.log("Server started Successfully");
});
