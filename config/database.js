const express = require('express');
const mongoose = require('mongoose');

 function mongoDB_connection() {
mong_config = mongoose.connect("mongodb+srv://"+user+"r:"+password+"@cluster0.uo37s.mongodb.net/Travelogue?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('connected', () =>{
    console.log("Mongose is connected!!!!");
  });
}
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

const aboutCity = new mongoose.Schema({
  city: String,
  state: String,
  author: String,
  description: String
  });
const Contribute = mongoose.model("Contribute", aboutCity);


module.exports = {
  mongoDB_connection, City, Contribute,
}
