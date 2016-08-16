var app = angular.module('pop', ['ui.router']);

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('home', {
				url: '/home',
				templateUrl: '/home.html',
				controller: 'Main',
				resolve: {
					postPromise: ['posts', function(posts) {
						return posts.getAll();
					}]
				}
			})
			.state('posts', {
				url: '/posts/{id}',
				templateUrl: '/posts.html',
				controller: 'PostsCtrl',
				resolve: {
					post: ['$stateParams', 'posts', function($stateParams, posts) {
						return posts.get($stateParams.id);
					}]
				}
			});

		$urlRouterProvider.otherwise('home');
	}
]);

app.factory('posts', ['$http', function($http){
	var obj = {
		posts: []
	};

	// gets all posts from backend database
	obj.getAll = function() {
		return $http.get('/posts').success(function(data) {
			angular.copy(data, obj.posts);
		});
	};

	// gets a single post by id
	obj.get = function(id) {
		return $http.get('/posts/' + id).then(function(res) {
			return res.data;
		});
	};

	// create a new post and store in database
	obj.create = function(post) {
		return $http.post('/posts', post).success(function(data) {
			obj.posts.push(data);
		});
	};

	// like a post
	obj.addToLikes = function(post) {
		return $http.put('/posts/' + post._id + '/like').success(function(data) {
			post.likes += 1;
		});
	};

	// add comment
	obj.addComment = function(id, comment) {
		return $http.post('/posts/' + id + '/comments', comment);
	};

	// like a comment
	obj.addToCommentLikes = function(post, comment) {
		return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/like').success(function(data) {
			comment.likes += 1;
		});
	};

	return obj;
}]);

app.controller("Main", [
	'$scope',
	'posts',
	function($scope, posts) {
		$scope.posts = posts.posts;

		$scope.addPost = function() {
			if(!$scope.title || $scope.title === ''){
				alert('Cannot post without a title!');
				return;
			}

			posts.create({
				title: $scope.title,
				link: $scope.link
			});

			$scope.title = '';
			$scope.link = '';
		};

		$scope.addToLikes = function(post) {
			posts.addToLikes(post);
		}
	}
]);
app.controller('PostsCtrl', [
	'$scope',
	'posts',
	'post',
	function($scope, posts, post) {
		$scope.post = post;

		$scope.addComment = function() {
			if($scope.text === ''){
				alert("Cannot post a blank comment");
				return;
			}

			posts.addComment(post._id, {
				text: $scope.text,
				author: 'user'
			}).success(function(comment) {
				$scope.post.comments.push(comment);
			});

			$scope.text = '';
		};

		$scope.addToLikes = function(comment) {
			posts.addToCommentLikes(post, comment);
		};
	}
]);
