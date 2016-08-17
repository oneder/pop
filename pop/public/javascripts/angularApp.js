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
			})
			.state('register', {
				url: '/register',
				templateUrl: '/register.html',
				controller: 'AuthCtrl',
				onEnter: ['$state', 'auth', function($state, auth) {
					if(auth.isLoggedIn())
						$state.go('home');
				}]
			})
			.state('login', {
				url: '/login',
				templateUrl: '/login.html',
				controller: 'AuthCtrl',
				onEnter: ['$state', 'auth', function($state, auth){
					if(auth.isLoggedIn())
						$state.go('home');
				}]
			});

		$urlRouterProvider.otherwise('home');
	}
]);

app.factory('posts', ['$http', 'auth', function($http, auth){
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
		return $http.post('/posts', post, {
			headers: {Authorization: 'Bearer ' + auth.getToken()}
		}).success(function(data) {
			obj.posts.push(data);
		});
	};
	// like a post
	obj.addToLikes = function(post) {
		return $http.put('/posts/' + post._id + '/like', null, {
			headers: {Authorization: 'Bearer ' + auth.getToken()}
		}).success(function(data) {
			post.likes += 1;
		});
	};

	// add comment
	obj.addComment = function(id, comment) {
		return $http.post('/posts/' + id + '/comments', comment, {
			headers: {Authorization: 'Bearer ' + auth.getToken()}
		});
	};
	// like a comment
	obj.addToCommentLikes = function(post, comment) {
		return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/like', null, {
			headers: {Authorization: 'Bearer ' + auth.getToken()}
		}).success(function(data) {
			comment.likes += 1;
		});
	};

	return obj;
}]);
app.factory('auth', ['$http', '$window', function($http, $window) {
	var auth = {};

	// saves authentication token to the local storage
	auth.saveToken = function(token) {
		$window.localStorage['pop-token'] = token;
	};
	// gets the authentication token from local storage
	auth.getToken = function() {
		return $window.localStorage['pop-token'];
	};

	// check if user is logged in
	auth.isLoggedIn = function() {
		var token = auth.getToken();

		if(token){
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			return payload.exp > Date.now() / 1000;
		}
		else
			return false;
	};
	// returns the username of the current user
	auth.currentUser = function() {
		if(auth.isLoggedIn()){
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.username;
		}
	};

	// creates new user and saves token
	auth.register = function(user) {
		return $http.post('/register', user).success(function(data) {
			auth.saveToken(data.token);
		});
	};
	// attempts to login user and save token
	auth.login = function(user) {
		return $http.post('/login', user).success(function(data) {
			auth.saveToken(data.token);
		});
	};
	// removes token from local storage and logs out the user
	auth.logout = function() {
		$window.localStorage.removeItem('pop-token');
	};

	return auth;
}]);

app.controller("Main", [
	'$scope',
	'posts',
	'auth',
	function($scope, posts, auth) {
		$scope.posts = posts.posts;
		$scope.isLoggedIn = auth.isLoggedIn;

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
	'auth',
	function($scope, posts, post, auth) {
		$scope.post = post;
		$scope.isLoggedIn = auth.isLoggedIn;

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
app.controller('AuthCtrl', [
	'$scope',
	'$state',
	'auth',
	function($scope, $state, auth) {
		$scope.user = {};

		$scope.register = function() {
			auth.register($scope.user).error(function(error) {
				$scope.error = error;
			}).then(function() {
				$state.go('home');
			});
		};

		$scope.login = function() {
			auth.login($scope.user).error(function(error) {
				$scope.error = error;
			}).then(function() {
				$state.go('home');
			});
		};
	}
]);
app.controller('NavCtrl', [
	'$scope',
	'auth',
	function($scope, auth) {
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.currentUser = auth.currentUser;
		$scope.logout = auth.logout;
	}
]);
