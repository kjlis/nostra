import {states} from '../common/USStates';
import {employmentLengthOptions} from '../common/employmentOptions';
import {loanTypes} from '../common/loanTypes';

export class HomeCtrl {
    /*@ngInject;*/
    constructor($rootScope, $scope, $state, $mdDialog, $resource) {
        this._scope = $scope;

        this.currentNavItem = $state.current.name;

        this._mdDialog = $mdDialog;

        this.loanTypes = loanTypes;

        this.homeOwnershipTypes = ['Mortgage', 'Own', 'Rent', 'Other'];

        this.employmentLengthOptions = employmentLengthOptions;

        this.states = states;

        this.searchText = null;

        this.openForm = false;

        this.Loan = $resource('/pd/:id', {id: '@_id'}, {
            calculatePD: {method: 'POST'},
            saveDecision: {method: 'POST'}
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
        if (isValid) {
            console.log(this.loanDetails);
            this.currentLoan = this.Loan.calculatePD({loanDetails: this.loanDetails});
            console.log(this.currentLoan);
            this._mdDialog.show({
                clickOutsideToClose: false,
                escapeToClose: false,
                scope: this._scope,
                preserveScope: true,
                templateUrl: './dist/templates/pd_dialog.tpl.html'
            });
        }
    }

    acceptLoan(isAccepted) {
        console.log('Loan accepted: ' + isAccepted);
        this._mdDialog.hide();
        this.currentLoan.accepted = isAccepted;
        this.currentLoan.$save();
    }

}
