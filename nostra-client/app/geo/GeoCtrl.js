import {states} from '../common/USStates';

export class GeoCtrl {
    /*@ngInject;*/
    constructor($resource, $mdDialog, $scope) {
        this._mdDialog = $mdDialog;
        this._scope = $scope;
        this.geoResource = $resource('/geo/:stateCode', {stateCode: '@stateCode'});
        // this.stateData = this.geoResource.query(() => {
        //     this.stateData.unshift(['State', 'Total loan amn.', 'Avg loan amt.', 'Avg int. rate']);
        // });
        this.stateData = [
            ['State', 'Total', 'Avg loan'],
            ['New York', 100000, 150]
        ];
        this.chart = {
            type: 'GeoChart',
            data: this.stateData,
            options: {
                region: 'US',
                resolution: 'provinces'
            }
        };
    }

    closeDialog() {
        this._mdDialog.hide();
    }

    selectRegion(region) {
        if (region) {
            this.lastSelectedRegionIndex = region.row;
        }

        this.selectedRegion = this.geoResource.get({
            stateCode: states.find((el) => {
                return el.name === this.stateData[this.lastSelectedRegionIndex + 1][0];
            }).code
        });
        this.selectedRegion = {};
        this.selectedRegion.name = 'California';
        this.selectedRegion.stats = [
            {name: 'Avg', value: 1},
            {name: 'Total', value: 5}
        ];
        this._mdDialog.show({
            clickOutsideToClose: true,
            scope: this._scope,
            preserveScope: true,
            templateUrl: './dist/templates/state_statistics_dialog.tpl.html'
        });
    }
}

