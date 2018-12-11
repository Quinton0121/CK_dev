require('dotenv').config()
const express = require('express');
const fs = require('fs');
const hbs = require('hbs');
const request = require('request-promise');
const bodyParser = require('body-parser');
var app = express();

const port = process.env.PORT || 8080;

hbs.registerPartials(__dirname + '/views/partials');

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));


app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())


app.get('/', (req, res) => {
    res.render('index.hbs');

   
});

app.post('/', (req, res) => {
    //console.log('req', req);
    //console.log(req.body.username,req.body.password)
    const api = {
        url: 'https://maps.googleapis.com/maps/api/geocode/json' + '?address=' + encodeURIComponent(req.body.username) + '&key=' + process.env.google_api,
        json: true
    }
    

    const callback = (obj) => res.render('index.hbs', {
        weather: obj,
        photo: 'https://cdn3.iconfinder.com/data/icons/bebreezee-weather-symbols/561/icon-weather-storm-512.png'
    });

    const callback2 = (obj,show) => {
        let lat = obj.lat
        let lng = obj.lng
        request({
            url: `https://api.darksky.net/forecast/5a625fe80bb92a3321d0076f24b793f2/${lat},${lng}?exclude=currently,flags`,
            json: true
        }).then(obj => show(obj.hourly.summary))
    };

    request(api).then((obj) => {

        //console.log(obj)//.results[0].geometry.location)
        callback2(obj.results[0].geometry.location,callback)
    }).catch(error => console.error(error))
});

app.get('/gallery', (request, response) => {
    response.render('gallery.hbs');
});

app.post('/gallery', (req, res) => {
    
    const api = {
        url: 'https://jsonplaceholder.typicode.com/photos',
        json: true
    }

    let no = req.body.gallery

    const show_photo = (photo) => {
        res.render('gallery.hbs', {
            picture:photo[no].url
        });
    }

    request(api).then((obj) => {

        
        show_photo(obj)
    }).catch(error => console.error(error))
});



app.get('/404', (request, response) => {
    response.send({
        error: 'Page not found'
    })
});


app.listen(port, () => {
    console.log(`Server is up on the port ${port}`);
});

