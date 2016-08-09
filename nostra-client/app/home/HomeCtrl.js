import { states } from '../common/USStates';

export class HomeCtrl {
    constructor($rootScope, $state) {
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
        this.currentNavItem = $state.current.name;

        this.openForm = $state.is('home.general');

        this.loanTypes = [
            {
                purpose: 'debt_consolidation',
                title: 'Debt consolidation'
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

        this.homeOwnershipTypes = ['Mortgage', 'Own', 'Rent', 'Other'];

        this.employmentLengthOptions = [
            {
                title: 'N/A',
                value: -1
            },
            {
                title: '< 1 year',
                value: 0
            },
            {
                title: '1 year',
                value: 1
            },
            {
                title: '2 years',
                value: 2
            },
            {
                title: '3 years',
                value: 3
            },
            {
                title: '4 years',
                value: 4
            },
            {
                title: '5 years',
                value: 5
            },

            {
                title: '6 years',
                value: 6
            },
            {
                title: '7 years',
                value: 7
            },
            {
                title: '8 years',
                value: 8
            },
            {
                title: '9 years',
                value: 9
            },
            {
                title: '10+ years',
                value: 10
            },

        ];

        this.states = states;
        this.searchText = null;

        $rootScope.$on('$stateChangeSuccess', () => {
            this.openForm = $state.is('home.general');
        });
    }

    toggleForm() {
        this.openForm = !this.openForm;
    }

    querySearch(query) {
        return query ? this.states.filter(this.createFilterFor(query)) : this.states;
    }

    createFilterFor(query) {
        return function filterFn(state) {
            return (state.name.toLowerCase().indexOf(query.toLowerCase()) === 0);
        };
    }

    calculatePD(isValid) {
        console.log(isValid);
    }

}
