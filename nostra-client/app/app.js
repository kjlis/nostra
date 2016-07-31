import angular from 'angular';
import { HomeCtrl } from './home/HomeCtrl';

require('angular-google-chart');
require('angular-animate');
require('angular-aria');
require('angular-messages');
require('angular-material');

angular.module('nostra', [
    require('angular-ui-router'),
    require('angular-resource'),
    'ngMaterial',
    'googlechart'
])
    .config(($stateProvider, $urlRouterProvider) => {
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: './app/home/home.tpl.html',
                controller: 'HomeCtrl as home'
            });

        $urlRouterProvider.otherwise('/');
    })
    .controller('HomeCtrl', HomeCtrl)
;