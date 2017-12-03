var express = require('express');
var router = express.Router();
var path = require('path');
var app = require('../app');
var temperatures = [];
var humidities = [];

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.sendFile(path.resolve('views/index.html'));
    // res.send(temperatures.toString() + " " + humidities.toString());
});

router.post('/', function(req, res){
    console.log(req.body);
    var temperature = req.body.temperature;
    var humidity = req.body.humidity;
    var year = req.body.year;
    var month = req.body.month;
    var day = req.body.day;
    var hour = req.body.hour;
    var city = req.body.city;

    temperatures.push(temperature);
    if (temperatures.length > 10) {
        temperatures.shift();
    }
    humidities.push(humidity);
    if (humidities.length > 10) {
        humidities.shift();
    }
    var newData = new app.TemperatureAndHumidity({
        temperature: temperature,
        humidity: humidity,
        year: year,
        month: month,
        day: day,
        hour: hour,
        city: city
    });

    newData.save(function(err, result) {
        if (err) throw err;
        console.log(result);
    });


    console.log(temperature + " " + humidity);
    res.send(temperature + " " + humidity);
});

router.get('/closest', function (req, res) {
    res.send({temperature: temperatures, humidity: humidities});
});

router.get('/year', function (req, res) {
    var year = req.query.year;
    var city = req.query.city;
    console.log(typeof year);
    app.TemperatureAndHumidity.find({year: year, city: city}, {_id: false, temperature: true, humidity: true, month: true}, function(err, result) {
        if (err) throw err;
        console.log(result);
        res.send(result);
    });
});

router.get('/month', function (req, res) {
    var month = req.query.month;
    var city = req.query.city;
    app.TemperatureAndHumidity.find({month: month, city: city}, {_id: false, temperature: true, humidity: true, day: true}, function(err, result) {
        if (err) throw err;
        console.log(result);
        console.log(typeof result);
        res.send(result);
    });
});

router.get('/day', function (req, res) {
    var day = req.query.day;
    var city = req.query.city;
    app.TemperatureAndHumidity.find({day: day,city: city}, {_id: false, temperature: true, humidity: true, hour: true}, function(err, result) {
        if (err) throw err;
        console.log(result);
        console.log(typeof result);
        res.send(result);
    });
});

module.exports = router;
