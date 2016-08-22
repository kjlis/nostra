require('../common/currencyFormatter');

export class GeoCtrl {
    /*@ngInject;*/
    constructor($resource, $mdDialog, $scope) {
        this._mdDialog = $mdDialog;
        this._scope = $scope;
        const geoResource = $resource('/geo/:countryCode', {countryCode: '@_id'});
        const purposeResource = $resource('/stats/purpose/:countryCode', {countryCode: 'US'});
        const ownershipResource = $resource('/stats/ownership/:countryCode', {countryCode: 'US'});

        function convertToWordcloud(response, targetArray){
            let words = {};
            response.otherStats.forEach((stat) => {
                words[stat._id.key] = words[stat._id.key] || 0;
                words[stat._id.key] += stat.count;
            });
            for(let property in words) {
                if (words.hasOwnProperty(property)){
                    targetArray.push({text: property, weight: words[property]});
                }
            }
            console.log(targetArray);
        }

        this.purposeWordcloud = [];
        purposeResource.get((response) => {
            convertToWordcloud(response, this.purposeWordcloud)
        });

        this.ownershipWordcloud = [];
        ownershipResource.get((response) => {
            convertToWordcloud(response, this.ownershipWordcloud)
        });

        this.stateData = [['State', 'Total loan amnt.']];
        this.chart = {
            type: 'GeoChart',
            data: this.stateData,
            options: {
                region: 'US',
                resolution: 'provinces'
            }
        };
        this.country = geoResource.get({countryCode: 'US'}, () => {
            this.country.stateStats.forEach((stat) => {
                this.stateData.push([stat._id, stat.total]);
            });
        });

        const colsDef = [
            {id: 't', label: 'Region', type: 'string'},
            {id: 's', label: 'State Avg', type: 'number'},
            {id: 's', label: 'US Avg', type: 'number'}
        ];

        this.incomeChart = {
            type: 'BarChart',
            data: {
                cols: colsDef
            }
        };

        this.percentIndicatorsChart = {
            type: 'BarChart',
            data: {
                cols: colsDef
            }
        };

        this.dtiChart = {
            type: 'Gauge',
            options: {
                yellowFrom: 36,
                yellowTo: 45,
                redFrom: 45,
                redTo: 100
            }
        }

    }

    closeDialog() {
        this._mdDialog.hide();
    }

    selectRegion(region) {
        if (region) {
            this.lastSelectedRegionIndex = region.row;
        }

        this.selectedRegion = this.country.stateStats.find((state) => {
            return state._id === this.stateData[this.lastSelectedRegionIndex + 1][0];
        });

        this.incomeChart.data.rows = [
            {
                c: [
                    {v: 'Annual income'},
                    {v: this.selectedRegion.average_income},
                    {v: this.country.countryStats.average_income}
                ]
            },
            {
                c: [
                    {v: 'Laon amnt'},
                    {v: this.selectedRegion.average},
                    {v: this.country.countryStats.average}
                ]
            }
        ];

        this.percentIndicatorsChart.data.rows = [
            {
                c: [
                    {v: 'Interest rate'},
                    {v: this.selectedRegion.average_int},
                    {v: this.country.countryStats.average_int}
                ]
            },
            {
                c: [
                    {v: 'Credit util. rate'},
                    {v: this.selectedRegion.average_revol_util},
                    {v: this.country.countryStats.average_revol_util}
                ]
            }
        ];

        this.dtiChart.data = [
            ['Label', 'Value'],
            ['State', this.selectedRegion.average_dti],
            ['Country', this.country.countryStats.average_dti]
        ];

        this._mdDialog.show({
            clickOutsideToClose: true,
            scope: this._scope,
            preserveScope: true,
            templateUrl: './dist/templates/state_statistics_dialog.tpl.html'
        });
    }
}

