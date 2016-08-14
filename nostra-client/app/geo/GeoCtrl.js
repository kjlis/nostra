import {states} from '../common/USStates';

export class GeoCtrl {
    /*@ngInject;*/
    constructor($resource, $mdDialog, $scope) {
        this._mdDialog = $mdDialog;
        this._scope = $scope;
        this.geoResource = $resource('/loan/:stateCode', {stateCode: '@stateCode'});
        this.stateData = [['State', 'Total loan amnt.']];
        this.chart = {
            type: 'GeoChart',
            data: this.stateData,
            options: {
                region: 'US',
                resolution: 'provinces'
            }
        };
        this.geoResource.query((statistics) => {
            statistics.forEach((stat) => {
                this.stateData.push([stat._id, stat.total]);
            });
        });

    }

    closeDialog() {
        this._mdDialog.hide();
    }

    selectRegion(region) {
        if (region) {
            this.lastSelectedRegionIndex = region.row;
        }

        this.selectedRegion = this.geoResource.get({
            stateCode: this.stateData[this.lastSelectedRegionIndex + 1][0]
        });

        this._mdDialog.show({
            clickOutsideToClose: true,
            scope: this._scope,
            preserveScope: true,
            templateUrl: './dist/templates/state_statistics_dialog.tpl.html'
        });
    }
}

