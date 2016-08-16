var app = angular.module('pop', ['ui.router']);

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('home', {
				url: '/home',
				templateUrl: '/home.html',
				controller: 'Main'
			})
			.state('posts', {
				url: '/posts/{id}',
				templateUrl: '/posts.html',
				controller: 'PostsCtrl'
			});

		$urlRouterProvider.otherwise('home');
	}
]);

app.factory('posts', [function(){
	var obj = {
		posts: []
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

			$scope.posts.push({
				title: $scope.title,
				link: $scope.link,
				likes: 0,
				comments: [
					{
						author: 'Somebody',
						text: 'This is a default comment!',
						likes: 0
					}
				]
			});

			$scope.title = '';
			$scope.link = '';
		};

		$scope.addToLikes = function(post) {
			post.likes++;
		}
	}
]);
app.controller('PostsCtrl', [
	'$scope',
	'$stateParams',
	'posts',
	function($scope, $stateParams, posts) {
		$scope.post = posts.posts[$stateParams.id];

		$scope.addComment = function() {
			if($scope.text === ''){
				alert("Cannot post a blank comment");
				return;
			}

			$scope.post.comments.push({
				author: 'user',
				text: $scope.text,
				likes: 0
			});

			$scope.text = '';
		};
	}
]);
