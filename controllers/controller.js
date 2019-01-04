// Dependencies
var express = require("express");
var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");

// Express Router
var router = express.Router();

// Models
var Article = require("../models/article");
var Comment = require("../models/comment");

// Pulls article from the dtbase then render to index
router.get('/', function(req, res) {
    // Find articles
    Article.find({}).sort({_id: 'desc'}).exec(function(err, data) {
        // Create array
        var resultData = [];
        // Create object that handleB will use to render article
        data.forEach(function(article) {
            resultData.push({
                title: article.title,
                link: article.link,
                blurb: article.blurb,
                author: article.author,
                image: article.image,
                articleID: article.articleID
            });
        });
        // Index based on result object
        res.render('index', {result: resultData});
    });
});

// Pull comment from the dtbase then render to comment page
router.get('/:id', function(req, res){
    // Article ID
    var articleID = req.params.id;
    // Find Comments for article ID
    Article.find({articleID: articleID}).populate('comments').exec(function(err, data) {
        if (err) {
            console.log(err);
        } else {
            if (data.length > 0) {
                var commentData = [];
                data[0].comments.forEach(function(comment) {
                    commentData.push({
                        id: comment._id,
                        author: comment.author,
                        text: comment.text,
                        timestamp: comment.timestamp,
                        articleID: articleID
                    });
                });

                var articleTitle = data[0].title;
                var link = data[0].link;
                commentData.push({articleID: articleID, articleTitle: articleTitle, link: link});

                res.render('comment', {commentData: commentData});
            } else {
                res.redirect('/')
            }
        }
    });
});

// Scrapes data 
router.get('/api/news', function(req, res) {
    // Request
    request('http://www.vox.com/news', function(error, response, html) {

        // Load html
        var $ = cheerio.load(html);

        // find div
        //
        $('.m-block').each(function(i, element) {

            // Grab Title
            var title = $(element).children('.m-block__body').children('header').children('h3').text();

            // Grab article URL
            var link = $(element).children('.m-block__body').children('header').children('h3').children('a').attr('href');

            // Grab article blurb
            var blurb = $(element).children('.m-block__body').children('.m-block__body__blurb').text();

            // Create author
            var author = [];

            // Grab section
            var authorsObject = $(element).children('.m-block__body').children('.m-block__body__byline').children('a');

            // sets text to author var if only one item
            if (authorsObject.length === 1) {
                author = authorsObject.text();
            // multiple items
            } else {
                // loop items, push text to author object
                for (var j = 0; j < authorsObject.length; j++) {
                author.push(authorsObject[j].children[0].data);
            }
                // join authors
                author = author.join(' & ');
            }

            // Grab image URL
            var image = $(element).children('.m-block__image').children('a').children('img').data('original');

            // Grab article ID
            var articleID = $(element).children('.m-block__body').children('.m-block__body__byline').children('span').data('remote-admin-entry-id');

            // Save results in object then save to MongoDB
            var newArticle = {
                title: title,
                link: link,
                blurb: blurb,
                author: author,
                image: image,
                articleID: articleID
            };

            // Access collection for an article by ID
            var query = {articleID: articleID};

            // Run query
            Article.findOneAndUpdate(query, newArticle, {upsert: true}, function(err) {
                if (err) {
                    console.log(err);
                }
            });
        });

        res.redirect('/');

    });
});

// Add new comment
router.post('/api/comment/:article', function(req, res) {
    var articleID = req.params.article;
    var text = req.body.text;
    var author = req.body.author;

    var newComment = {
        text: text,
        author: author
    };

    Comment.create(newComment, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            Article.findOneAndUpdate({articleID: articleID}, { $push: {'comments': data._id}}, {new: true}, function(error) {
                if (error) {
                    console.log(error);
                } else {
                    res.redirect('/' + articleID);
                }
            });
        }
    });
});

// Delete comment
router.get('/api/commment/:article/:comment', function(req, res) {
    var id = req.params.comment;
    var articleID = req.params.article;
    Comment.remove({_id: id}, function(err) {
        if (err) {
            console.log(err);
        } else {
            Article.findOneAndUpdate({articleID: articleID}, {$pull: {comments: id}}, {safe: true}, function(error, data) {
                if (error) {
                    console.log(error);
                } else {
                    console.log(data);
                    res.redirect('/' + articleID);
                }
            });
        }
    });
});

// Default route
router.use('*', function(req, res) {
    res.redirect('/');
});

// Export
module.exports = router;