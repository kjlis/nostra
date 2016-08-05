export class HomeCtrl {
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
        this.currentNavItem = 'home';

        this.loanTypes = [
            {
                purpose: 'debt_consolidation',
                title: 'Debt consolidation'
            },
            {
                purpose: 'credit_card',
                title: 'Credit card refinancing'
            },
            {
                purpose: 'house',
                title: 'House'
            },
            {
                purpose: 'home_improvement',
                title: 'Home improvement'
            },
            {
                purpose: 'credit_card',
                title: 'Credit card'
            },
            {
                purpose: 'major_purchase',
                title: 'Major purchase'
            },
            {
                purpose: 'small_business',
                title: 'Business'
            },
            {
                purpose: 'car',
                title: 'Car'
            },
            {
                purpose: 'educational',
                title: 'Educational'
            },
            {
                purpose: 'medical',
                title: 'Medical'
            },
            {
                purpose: 'moving',
                title: 'Moving'
            },
            {
                purpose: 'renewable_energy',
                title: 'Renewable energy'
            },
            {
                purpose: 'vacation',
                title: 'Vacation'
            },
            {
                purpose: 'wedding',
                title: 'Wedding'
            }
        ];
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
