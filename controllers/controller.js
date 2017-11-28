const express = require('express');
const router = express.Router();

// Routes
const request = require('request');
// Insert Note and Article models
const Note = require('../models/Note.js');
const Article = require('../models/Article.js');
// Mongoose
const mongoose = require('mongoose');
const cheerio = require('cheerio');

if (process.env.MONGODB_URI) {
	mongoose.connect('mongodb://heroku_034xkrn4:31gp5347echph8ru9fjk3f813g@ds121896.mlab.com:21896/heroku_034xkrn4')
} else {
	mongoose.connect('mongodb://localhost/scraper');
}

// Database configuration with mongoose
// mongoose.connect('mongodb://localhost/scraper');
const db = mongoose.connection;

// show any mongoose errors
db.on('error', function(err) {
    console.log('Mongoose Error: ' + err);
});

// once logged in to the db through mongoose, log a success message
db.once('open', function() {
    console.log('Mongoose connection successful!');
});

//Routes
router.get('/', function(req, res) {
	 // first, we grab the body of the html with request
    request('https://news.ycombinator.com/', function(error, response, html) {
        // then, we load that into cheerio and save it to $ for a shorthand selector
        const $ = cheerio.load(html);
        // now, we grab every h2 within an article tag, and do the following:
        //$('article h2').each(function(i, element) {
        $('td.title').each(function(i, element) {
            // save an empty result object
            const result = {};
            // add the text and href of every link,
            // and save them as properties of the result obj
            result.title = $(this).children('a').text();
            result.link = $(this).children('a').attr('href');
            // using our Article model, create a new entry.
            // Notice the (result):
            // This effectively passes the result object to the entry (and the title and link)
            const entry = new Article(result);
            // now, save that entry to the db
            entry.save(function(err, doc) {
                // log any errors
                if (err) {
                    console.log(err);
                }
                // otherwise log the doc
                else {
                    console.log(doc);
                }
            });
        });
    });
    // tell the browser that we finished scraping the text.
    Article.find({},function(err,data) {
         res.render('home');
     });
});

// This will get the articles we scraped from the mongoDB
router.get('/articles', function(req, res) {
    // grab every doc in the Articles array
    Article.find({}, function(err, doc) {
        // log any errors
        if (err) {
            console.log(err);
        }
        // or send the doc to the browser as a json object
        else {
            res.json(doc);
        }
    });
});

// Grab an article by it's ObjectId
router.get('/articles/:id', function(req, res) {
    // using the id passed in the id parameter,
    // prepare a query that finds the matching one in our db...
    Article.findOne({ '_id': req.params.id })
        // and populate all of the notes associated with it.
        .populate('note')
        // now, execute our query
        .exec(function(err, doc) {
            // log any errors
            if (err) {
                console.log(err);
            }
            // otherwise, send the doc to the browser as a json object
            else {
                res.json(doc);
            }
        });
});

// Mongodb to delete notes.
router.post('/deletenote/:id', function(req, res) {
    // using the id passed in the id parameter,
    // prepare a query that finds the matching one in our db...
    console.log(req.params.id);
    Note.findOne({ '_id': req.params.id })
        // and populate all of the notes associated with it.
        .remove('note')
        // now, execute our query
        .exec(function(err, doc) {
            // log any errors
            if (err) {
                console.log(err);
            }
            // otherwise, send the doc to the browser as a json object
            else {
                res.json(doc);
            }
        });
});


// replace the existing note of an article with a new one
// or if no note exists for an article, make the posted note it's note.
router.post('/articles/:id', function(req, res) {
    // create a new note and pass the req.body to the entry.
    const newNote = new Note(req.body);
    // and save the new note the db
    newNote.save(function(err, doc) {
        // log any errors
        if (err) {
            console.log(err);
        }
        // otherwise
        else {
            // using the Article id passed in the id parameter of our url,
            // prepare a query that finds the matching Article in our db
            // and update it to make it's lone note the one we just saved
            Article.findOneAndUpdate({ '_id': req.params.id }, { 'note': doc._id })
                // execute the above query
                .exec(function(err, doc) {
                    // log any errors
                    if (err) {
                        console.log(err);
                    } else {
                        // or send the document to the browser
                        res.send(doc);
                    }
                });
        }
    });
});

module.exports = router;