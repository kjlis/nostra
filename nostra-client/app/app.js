import angular from 'angular';
import { HomeCtrl } from './home/HomeCtrl';
import { GeoCtrl } from './geo/GeoCtrl';

require('angular-google-chart');
require('angular-animate');
require('angular-aria');
require('angular-messages');
require('angular-material');

angular.module('nostra', [
    require('angular-ui-router'),
    require('angular-resource'),
    'ngMaterial',
    'ngMessages',
    'googlechart'
])
    .config(($stateProvider, $urlRouterProvider) => {
        'ngInject';
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: './dist/templates/home.tpl.html',
                controller: 'HomeCtrl as home',
                abstract: true
            })
            .state('home.general', {
                url: 'geo',
                templateUrl: './dist/templates/geo.tpl.html',
                controller: 'GeoCtrl as geo',
            })
            .state('home.loans', {
                url: 'loans',
                templateUrl: './dist/templates/loans.tpl.html'
            })
            .state('home.investors', {
                url: 'investors',
                templateUrl: './dist/templates/investors.tpl.html'
            });

        $urlRouterProvider.otherwise('/geo');
    })
    .controller('HomeCtrl', HomeCtrl)
    .controller('GeoCtrl', GeoCtrl)
;