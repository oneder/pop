var mongoose = reuqire('mongoose');

var CommentSchema = new mongoose.Schema({
	text: String,
	author: String,
	likes: {type: Number, default: 0},
	post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'}
});

mongoose.model('Comment', CommentSchema);