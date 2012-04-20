// This file is responsible for all html ng-apps variables used in <html ng-app="-app-module-">

// Create a route and resource modules
angular.module('routeAndResource', ['ngResource'], function($routeProvider) {
  $routeProvider.when('', {template: 'includes/index_partial.html', controller: LoadPageCtrl});
});

// Create a resource module
angular.module('resource', ['ngResource']);
