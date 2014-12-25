﻿/// <reference path="../../Scaffold/Scripts/typings/angularjs/angular.d.ts"/>
/// <reference path="../Models.ts"/>

module KawalDesa {

    export var dashboard = angular.module('dashboard', [
        'angularFileUpload'
    ]);

    dashboard.run(['$location','$rootElement', function ($location, $rootElement) {
        $rootElement.off('click');
    }]);

    dashboard.config(['$locationProvider', function ($locationProvider) {
        $locationProvider.html5Mode(true);
    }]);

}