export class LoansCtrl {
    constructor($resource) {
        'ngInject';
        const statusResource = $resource('/stats/status/:countryCode', {countryCode: 'US'});
        const purposeResource = $resource('/stats/purpose/:countryCode', {countryCode: 'US'});
        const gradesResource = $resource('/stats/grades/:countryCode', {countryCode: 'US'});
        const employmentResource = $resource('/stats/employment/:countryCode', {countryCode: 'US'});
        const ownershipResource = $resource('/stats/ownership/:countryCode', {countryCode: 'US'});

        function mapStats(response) {
            let statsObj = {};
            return new Promise((resolve) => {
                response.otherStats.forEach((stat) => {
                    if (statsObj[stat._id.key] && statsObj[stat._id.key].hasOwnProperty('defaulted')) {
                        statsObj[stat._id.key].defaulted[stat._id.defaulted] = stat.count;
                    } else {
                        statsObj[stat._id.key] = {
                            defaulted: []
                        };
                        statsObj[stat._id.key].defaulted[stat._id.defaulted] = stat.count;
                    }
                });
                resolve(statsObj);
            });
        }

        function convertToDataTable(mappedStats, chartObj) {
            let rows = [];
            for (let property in mappedStats) {
                if (mappedStats.hasOwnProperty(property)) {
                    rows.push([
                            property,
                            mappedStats[property].defaulted[0],
                            mappedStats[property].defaulted[1],
                            ''
                        ]
                    );
                }
            }
            chartObj.data = [['Quality', 'Good', 'Defaulted', {role: 'annotation'}]].concat(rows);
        }

        this.statusStats = [];
        statusResource.get((response) => {
            response.otherStats.forEach((stat) => {
                    if (stat._id != 'Fully Paid' && stat._id != 'Current') {
                        this.statusStats.push({
                            c: [
                                {v: stat._id},
                                {v: stat.count}
                            ]
                        })
                    }
                }
            );
        });

        this.statusChart = {
            type: 'ColumnChart',
            data: {
                cols: [
                    {id: 't', label: 'Status', type: 'string'},
                    {id: 's', label: '# loans', type: 'number'}
                ],
                rows: this.statusStats
            }
        };

        const chartDef = {
            type: 'ColumnChart',
            options: {
                legend: {position: 'top', maxLines: 2},
                isStacked: 'percent'
            }
        };

        this.purposeChart = {};
        this.gradesChart = {};
        this.employmentChart = {};
        this.ownershipChart = {};
        Object.assign(this.purposeChart, chartDef);
        Object.assign(this.gradesChart, chartDef);
        Object.assign(this.employmentChart, chartDef);
        Object.assign(this.ownershipChart, chartDef);

        [[purposeResource, this.purposeChart], [gradesResource, this.gradesChart], [employmentResource, this.employmentChart], [ownershipResource, this.ownershipChart]]
            .forEach((pair) => {
                pair[0].get((response) => {
                    mapStats(response).then((mappedStats) => {
                        convertToDataTable(mappedStats, pair[1]);
                    });
                });
            });

    };
}
