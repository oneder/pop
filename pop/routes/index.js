var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* PARAM for preloading posts */
router.param('post', function(req, res, next, id) {
	var query = Post.findById(id);

	query.exec(function(err, post) {
		if(err)
			return next(err);
		if(!post)
			return next(new Error('Can\'t find post'));

		req.post = post; // Attaches to req object
		return next();
	});
});
/* PARAM for preloading comments */
router.param('comment', function(req, res, next, id) {
	var query = Comment.findById(id);

	query.exec(function(err, comment) {
		if(err)
			return next(err);
		if(!comment)
			return next(new Error('Can\'t find comment'));

		req.comment = comment;
		return next();
	});
});

/* POST a new post */
router.post('/posts', function(req, res, next) {
	var post = new Post(req.body);

	post.save(function(err, post) {
		if(err)
			return next(err);

		res.json(post);
	});
});
/* POST a new comment */
router.post('/posts/:post/comments', function(req, res, next) {
	var comment = new Comment(req.body);
	comment.post = req.post;

	comment.save(function(err, comment){
		if(err)
			return next(err);

		req.post.comments.push(comment);
		req.post.save(function(err, post) {
			if(err)
				return next(err);

			res.json(comment);
		});
	});
});

/* GET all posts */
router.get('/posts', function(req, res, next) {
	Post.find(function(err, posts){
		if(err)
			return next(err);

		res.json(posts);
	});
});
/* GET a single post by id 
   Note: calls the param function
   above, and attaches the post to
   the req object     
*/
router.get('/posts/:post', function(req, res) {
	req.post.populate('comments', function(err, post){
		if(err)
			return next(err);

		res.json(post);
	});
});

/* PUT 'like' functionality for posts */
router.put('/posts/:post/like', function(req, res, next) {
	req.post.addToLikes(function(err, post) {
		if(err)
			return next(err);

		res.json(post);
	});
});
/* PUT 'like' functionality for comments */
router.put('/posts/:post/comments/:comment/like', function(req, res, next) {
	req.comment.addToLikes(function(err, comment) {
		if(err)
			return next(err);

		res.json(comment);
	})
})

module.exports = router;
