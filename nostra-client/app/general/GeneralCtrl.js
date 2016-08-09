export class GeneralCtrl {
    constructor () {
        this.chart = {
            type: 'GeoChart',
            data: [
                ['State', 'Popularity'],
                ['Texas', 200],
                ['New York', 300],
                ['US-IA', 20],
                ['US-RI', 150]
            ],
            options: {
                region: 'US',
                resolution: 'provinces'
            }
        };
    }

    selectRegion(region) {
        if (region) {
            console.log(this.chart.data[region.row + 1]);
            this.lastSelectedRegionIndex = region.row;
        } else {
            console.log(this.chart.data[this.lastSelectedRegionIndex + 1]);
        }
    }
}

