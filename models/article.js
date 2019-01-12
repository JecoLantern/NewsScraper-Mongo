var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var articleSchema = new Schema({
    title: {
        type: String,
        trim: true
    },
    link: {
        type: String,
        trim: true
    },
    author: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        trim: true
    },
    articleID: {
        type: String,
        trim: true
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }]
});

var Article = mongoose.model("Article", articleSchema);

module.exports = Article;