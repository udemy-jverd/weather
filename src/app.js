const path = require('path');
const express = require('express');
const hbs = require('hbs');

const geocode = require('./handlers/geocode');
const forecast = require('./handlers/forecast');

const app = express();
const port = process.env.PORT || 3000;

// Define paths for express config
const publicDirectoryPath = path.join(__dirname, '../public');
const views = path.join(__dirname, '../templates/views');
const partials = path.join(__dirname, '../templates/partials');

// Setuo Handlebars engine & views location
app.set('view engine', 'hbs'); // giving to express the templating engine to use
app.set('views', views);
hbs.registerPartials(partials);

// Setup static directory to serve
app.use(express.static(publicDirectoryPath));

app.get('', (req, res) => {
    res.render('index', {
        title: 'Weather',
        author: 'Joffrey VERD'
    });
});

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About',
        author: 'Joffrey VERD'
    });
});

app.get('/help', (req, res) => {
    res.render('help', {
        title: 'Help',
        author: 'Joffrey VERD',
    });
});

app.get('/weather', (req, res) => {
    const { location } = req.query;
    if (!location) {
        return res.status(400).send({
            message: 'Bad request: the property \'location\' is missing'
        });
    }
    const city = encodeURIComponent(location);
    geocode(city).then((result) => {
        const { latitude, longitude } = result;
        forecast(latitude, longitude).then((forecastData) => {
            const { temperature, weather_icons: icon } = forecastData.current;
            res.status(200).send({ temperature, location, icon: icon[0] });
        }).catch((e) => {
            return res.status(500).send({ message: e });
        });
    }).catch((e) => {
        return res.status(500).send({ message: e });
    });
});

app.get('*', (req, res) => {
    res.render('404', {
        title: '404 Not found',
        author: 'Joffrey VERD',
    });
})

app.listen(port, () => {
    console.log('Server is up on port ' + port);
});
