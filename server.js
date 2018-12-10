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

hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear();
})

hbs.registerHelper('message', (text) => {
    return text.toUpperCase();
})

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())

//app.use((request, response, next)=>{
//    var time = new Date().toString();
//    //console.log(`$(time): ${request.method} ${request.url}`);
//    var log = `${time}: ${request.method} ${request.url}`;
//    fs.appendFile('server.log', log + '\n', (error) => {
//        if (error) {
//            console.log('Unable to log message');
//        }
//    });
//    console.log('right here')
//    //next();
//});

//app.use((request, response, next) => {
//    response.render('maintenance.hbs', {
//        title: 'Error page',
//        year: new Date()
//    })
//    next();
//});


app.get('/', (req, res) => {
    //console.log('req', req);
    //console.log(req.body.username)
    const api = {
        url: 'https://api.nasa.gov/neo/rest/v1/feed?start_date=2015-09-07&end_date=2015-09-08&api_key=DEMO_KEY',
        json: true
    };
    let pic = '';

    const callback = (obj) => res.render('index.hbs', {
        photo: obj.near_earth_objects["2015-09-08"][0].estimated_diameter.meters.estimated_diameter_min
    });

    request(api).then((obj) => {
        
        //console.log(obj.near_earth_objects["2015-09-08"][0].estimated_diameter.meters)
        callback(obj)
    }).catch(error => console.error(error))
});

app.post('/', (req, res) => {
    //console.log('req', req);
    //console.log(req.body.username,req.body.password)
    const api = {
        url: 'https://maps.googleapis.com/maps/api/geocode/json' + '?address=' + encodeURIComponent(req.body.username) + '&key=AIzaSyAwWRCcyyJ0qNnMErUtO4ci-tLYgKu2XJ4',
        json: true
    }
    let pic = '';

    const callback = (obj) => res.render('index.hbs', {
        photo: obj
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

        //console.log(obj.results[0].geometry.location)
        callback2(obj.results[0].geometry.location,callback)
    }).catch(error => console.error(error))
});

app.get('/info', (request, response) => {
    response.render('about.hbs', {
        title: 'About page',
        year: new Date().getFullYear(),
        greeting: 'Morning!',
    });
});


app.get('/404', (request, response) => {
    response.send({
        error: 'Page not found'
    })
});

app.listen(port, () => {
    console.log(`Server is up on the port ${port}`);
});

