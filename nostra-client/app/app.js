import angular from 'angular';
import { HomeCtrl } from './home/HomeCtrl';
import { GeneralCtrl } from './general/GeneralCtrl';

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
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: './app/home/home.tpl.html',
                controller: 'HomeCtrl as home',
                abstract: true
            })
            .state('home.general', {
                url: 'general',
                templateUrl: './app/general/general.tpl.html',
                controller: 'GeneralCtrl as general',
            })
            .state('home.loans', {
                url: 'loans',
                templateUrl: './app/loans/loans.tpl.html'
            })
            .state('home.investors', {
                url: 'investors',
                templateUrl: './app/investors/investors.tpl.html'
            });

        $urlRouterProvider.otherwise('/general');
    })
    .controller('HomeCtrl', HomeCtrl)
    .controller('GeneralCtrl', GeneralCtrl)
;