import angular from 'angular';
import { HomeCtrl } from './home/HomeCtrl';
import { GeoCtrl } from './geo/GeoCtrl';
import { LoansCtrl } from './loans/LoansCtrl';

require('angular-google-chart');
require('angular-animate');
require('angular-aria');
require('angular-messages');
require('angular-material');

require('angular-tag-cloud');

angular.module('nostra', [
    require('angular-ui-router'),
    require('angular-resource'),
    'ngMaterial',
    'ngMessages',
    'googlechart',
    'ngTagCloud'
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
                templateUrl: './dist/templates/loans.tpl.html',
                controller: 'LoansCtrl as loans'
            });

        $urlRouterProvider.otherwise('/geo');
    })
    .controller('HomeCtrl', HomeCtrl)
    .controller('GeoCtrl', GeoCtrl)
    .controller('LoansCtrl', LoansCtrl);
