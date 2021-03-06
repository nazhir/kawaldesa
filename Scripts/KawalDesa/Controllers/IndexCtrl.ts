﻿/// <reference path="../../../Scaffold/Scripts/typings/angularjs/angular.d.ts"/>
/// <reference path="../../gen/Models.ts"/>
/// <reference path="../KawalDesa.ts"/>


module App.Controllers {

    export interface ICurrentUser {
        Id: string;
        FacebookId: String;
        Name: String;
        fkOrganizationId: number;
        Roles: String[];
        Scopes: string[];
    }

    interface MyWindow extends Window {
        CurrentUser: ICurrentUser;
    }

    declare var window: MyWindow;

    import Models = App.Models;
    import Controllers = App.Controllers.Models;

    var CHILD_NAMES = [
        "Daerah",
        "Provinsi",
        "Kabupaten / Kota",
        "Kecamatan",
        "Desa"
    ];

    var ROUTES = [
        ["/dd/", "dd", true],
        ["/add/", "add", true],
        ["/bhpr/", "bhpr", true],
        ["/p/", "transfer", true],
        ["/r/", "realization", true],
        ["/dashboard", "dashboard", false],
        ["/orgs", "orgs", false],
        ["/u/", "users", false],
        ["/login", "login", false],
    ];

    export class IndexCtrl {

        regionTree: Models.Region[];
        region: Models.Region;
        childName: string;
        type = "transfer";
        currentUser: ICurrentUser;
        regionId: string;
        isPathReplacing = false;
        currentPath = null;

        static $inject = ["$scope", "$location"];

        constructor(public $scope, public $location){
            var ctrl = this;
            var scope = this.$scope;
            this.currentUser = window.CurrentUser;

            if(!ctrl.isPathReplacing)
                ctrl.onLocationChange();
            ctrl.isPathReplacing = false;

            $scope.$on('$locationChangeSuccess', function () {
                if(!ctrl.isPathReplacing)
                    ctrl.onLocationChange();
                ctrl.isPathReplacing = false;
            });
        }


        onLocationChange() {
            var path = this.$location.path();
            if (path == this.currentPath)
                return;
            var regionId:string = null;
            var regionKey = null;
            this.type = null;
            if (path == "/" || path == "") {
                regionId = "0";
                this.type = "transfer";
            } else {
                var matched : any[] = ROUTES.filter(r => path.indexOf(r[0]) == 0);
                if (matched[0]) {
                    this.type = matched[0][1] ;
                    if (matched[0][2]) {
                        regionId = path.replace(matched[0][1], "");
                    }
                }
            }
            if (this.type == null) {
                this.type = "realization";
                regionKey = path.substring(1);
            }

            if(regionId != null || regionKey)
                this.loadRegion(regionId, regionKey);

            if (regionId == null && !regionKey)
                regionId = "0";
            this.regionId = regionId;
            this.currentPath = path;
        }

        changeType(type, $event) {
            if (this.type != 'dashboard') {
                $event.preventDefault();
                var matched : any[] = ROUTES.filter(r => r[1] == type);
                var path = matched[0][0] + this.region.Id;
                this.$location.path(path);
            }
        }

        changeRegion(regionId, $event) {
            $event.preventDefault();
            this.$scope.$broadcast("regionChangeBefore");
            var type = this.type;
            var matched : any[] = ROUTES.filter(r => r[1] == type);
            var path = matched[0][0] + regionId;
            this.$location.path(path);
        }

        hasAnyVolunteerRoles() {
            return this.currentUser != null
                && this.currentUser.Roles.some(r => r.indexOf("volunteer_") != -1);
        }

        isInRole(roleName) {
            if (!this.currentUser) {
                return false;
            }
            return this.currentUser.Roles.some(r => roleName == r);
        }

        isInScope(entityId) {
            var regionId = this.regionTree.map(r => r.Id);
            regionId.push(entityId);
            return regionId.some(rid => this.currentUser.Scopes.some(id => rid == id));
        }

        isInRoleAndScope(roleName, entityId) {
            return this.isInRole(roleName) && this.isInScope(entityId);
        }

        modal(selector, action) {
            var modal: any = $(selector);
            modal.modal(action);
        }

        loadRegion(parentId?: string, parentKey?: string) {
            var ctrl = this;

            this.regionTree = [];
            this.childName = CHILD_NAMES[0];

            var promise = null;
            if (parentId != null)
                promise = Controllers.RegionController.Get(parentId);
            else if (parentKey)
                promise = Controllers.RegionController.GetByURLKey(parentKey);

            promise.done((region: Models.Region) => {
                ctrl.$scope.$apply(() => {
                    ctrl.region = region;
                    ctrl.regionId = region.Id;
                    var regionTree = [];
                    var cur : Models.IRegion = region;
                    while (cur) {
                        regionTree.push(cur);
                        cur = cur.Parent;
                    }
                    ctrl.regionTree = regionTree.reverse();
                    if (regionTree.length < CHILD_NAMES.length)
                        ctrl.childName = CHILD_NAMES[regionTree.length];

                    setTimeout(() => {
                        ctrl.$scope.$apply(() => {
                            ctrl.$scope.$broadcast("regionChangeSuccess");
                        });
                    }, 0);
                    if (region.UrlKey && ctrl.$location.path() != "/" + region.UrlKey) {
                        ctrl.isPathReplacing = true;
                        ctrl.$location.path("/" + region.UrlKey);
                        ctrl.$location.replace();
                    }
                });
            });
        }

    }

    kawaldesa.controller("IndexCtrl", IndexCtrl);
}