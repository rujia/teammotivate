angular.module('teamMotivate', ['ui.router'], function($httpProvider) {
  // Use x-www-form-urlencoded Content-Type
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

  /**
   * The workhorse; converts an object to x-www-form-urlencoded serialization.
   * @param {Object} obj
   * @return {String}
   */ 
  var param = function(obj) {
    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

    for(name in obj) {
      value = obj[name];

      if(value instanceof Array) {
        for(i=0; i<value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value instanceof Object) {
        for(subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value !== undefined && value !== null)
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    }

    return query.length ? query.substr(0, query.length - 1) : query;
  };

  // Override $http service's default transformRequest
  $httpProvider.defaults.transformRequest = [function(data) {
    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
  }];
})
.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/views/home.html',
      controller: 'MainCtrl',
      resolve: {
			  postPromise: ['projects', function(projects){
			    return projects.getAll();
			  }]
			}
    })
    .state('users', {
    	url: '/users',
    	templateUrl: '/views/users.html',
    	controller: 'UsersCtrl',
    	resolve: {
			  postPromise: ['users', function(users){
			    return users.get();
			  }]
			}
    })
    .state('newUser', {
    	url: '/users/new',
    	templateUrl: '/views/newUser.html',
    	controller: 'NewUsersCtrl'
    })
    .state('sessions', {
    	url: '/sessions',
    	templateUrl: '/views/login.html',
    	controller: 'SessionCtrl'
    })
    .state('projects', {
		  url: '/projects/{id}',
		  templateUrl: '/views/projects.html',
		  controller: 'ProjectsCtrl'
		});

  $urlRouterProvider.otherwise('home');
}])
.factory('users', ['$http', function($http){

  var o = {
    users: []
  };
  
  o.get = function() {
  	console.log('in user get');
    return $http.get('/users').success(function(data){
      angular.copy(data, o.users);
      console.log(o.users);
    });
  };

  o.post = function(userData) {
  	console.log('in user post');
  	console.log(userData);
  	return $http.post('/users', userData).success(function(data) {
  		console.log(data);
  		angular.copy(data, o.success);
  	})
  }
  return o;
}])

.factory('projects', ['$http', function($http){
  var o = {
    projects: []
  };
  
  o.getAll = function() {
    return $http.get('/projects').success(function(data){
  		console.log('in project factory');
      angular.copy(data.projects, o.projects);
      console.log(o.projects);
    });
  };
  return o;
}])
.controller('UsersCtrl', [
	'$http',
	'$scope',
	'users',
	function($http, $scope, users) {
		console.log(users.users);
		$scope.users = users.users;
	}
])
.controller('NewUsersCtrl', [
	'$http',
	'$scope',
	'users',
	function($http, $scope, users) {
		console.log(users);
		$scope.users = users.users;

		$scope.addUser = function() {
			if ($scope.name === '') { return; }
			var newUser = {
				username: $scope.name,
				password: $scope.password
			}
			console.log(newUser);
			users.post(newUser);
			$scope.name='';
			$scope.password='';
		}
	}
])
.controller('SessionCtrl', [
	'$http',
	'$scope',
	'$location',
	function($http, $scope, $location) {

		$scope.authenticate = function() {
			var user = '';
			if ($scope.name === '') { return; }
			var userFields = {
				username: $scope.name,
				password: $scope.password
			}
			console.log(userFields);
			$http.post('/sessions', userFields).success(function(response) {
			  	console.log(response);
			  	if (response.success === true) {
			  		user = $scope.name;
			  	}
			  });
			$scope.name='';
			$scope.password='';
			$location.path('home');
		}
	}
])
.controller('MainCtrl', [
	'$scope',
	'projects',
	function($scope, projects){
	console.log(projects);
	$scope.projects = projects.projects;
	// $scope.projects.push({
	//   title: $scope.title,
	//   link: $scope.link,
	//   upvotes: 0,
	//   comments: [
	//     {author: 'Joe', body: 'Cool post!', upvotes: 0},
	//     {author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
	//   ]
	// });

	$scope.incrementUpvotes = function(post) {
	  post.upvotes += 1;
	};

	$scope.addPost = function(){
	  if($scope.title === '') { return; }
	  $scope.projects.push({
	    title: $scope.title,
	    link: $scope.link,
	    upvotes: 0
	  });
	  //reset values
	  $scope.title = '';
	  $scope.link = '';
	};
}])
.controller('ProjectsCtrl', [
	'$scope',
	'$stateParams',
	'projects',
	function($scope, $stateParams, projects){
		console.log(projects);
		console.log($stateParams);
		$scope.post = projects.projects[$stateParams.id];
		console.log(projects.projects);
		console.log($scope);
		$scope.addTask = function(){
		  if($scope.body === '') { return; }
		  $scope.project.comments.push({
		    body: $scope.body,
		    author: 'user',
		    upvotes: 0
		  });
		  $scope.body = '';
		};
}]);
