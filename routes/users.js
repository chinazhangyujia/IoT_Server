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

    temperatures.push(Number(temperature));
    if (temperatures.length > 10) {
        temperatures.shift();
    }
    humidities.push(Number(humidity));
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
        city: city,
        time: new Date()
    });

    newData.save(function(err, result) {
        if (err) throw err;
        console.log(result);
    });


    console.log(temperature + " " + humidity);
    res.send(temperature + " " + humidity);
});

router.get('/closest', function (req, res) {
    if (temperatures.length === 0 || humidities.length === 0) {
        app.TemperatureAndHumidity.find({}, {_id: false, temperature: true, humidity: true},{sort : {time: -1}},
            function (err, result) {
            if (err) throw err;
            console.log(result);
            for (var i = 0; i < Math.min(10, result.length); i++) {
                temperatures.push(result[i].temperature);
                humidities.push(result[i].humidity);
            }
            console.log("read from database");
            res.send({temperature: temperatures, humidity: humidities});
            });
    } else {
        console.log("read from memory");
        res.send({temperature: temperatures, humidity: humidities});
    }
});

router.get('/year', function (req, res) {
    var year = req.query.year;
    var city = req.query.city;
    // app.TemperatureAndHumidity.find({year: year}, {_id: false, temperature: true, humidity: true, month: true}).
    app.TemperatureAndHumidity.aggregate({$match : {year : Number(year)}},
        {$group : {_id : "$month", avg_temperature : {$avg : "$temperature"}, avg_humidity : {$avg : "$humidity"}}},
        function(err, result) {
        if (err) throw err;
        console.log(result);
        res.send(result);
    });
});

router.get('/month', function (req, res) {
    var year = (new Date()).getFullYear();
    var month = req.query.month;
    var city = req.query.city;
    // app.TemperatureAndHumidity.find({year: year, month: month}, {_id: false, temperature: true, humidity: true, day: true},
    app.TemperatureAndHumidity.aggregate({$match : {year : Number(year), month : Number(month)}},
        {$group : {_id : "$day", avg_temperature : {$avg : "$temperature"}, avg_humidity : {$avg : "$humidity"}}},
        function(err, result) {
        if (err) throw err;
        console.log(result);
        console.log(typeof result);
        res.send(result);
    });
});

// router.get('/day', function (req, res) {
//     var day = req.query.day;
//     var city = req.query.city;
//     app.TemperatureAndHumidity.find({day: day}, {_id: false, temperature: true, humidity: true, hour: true}, function(err, result) {
//         if (err) throw err;
//         console.log(result);
//         console.log(typeof result);
//         res.send(result);
//     });
// });

module.exports = router;
