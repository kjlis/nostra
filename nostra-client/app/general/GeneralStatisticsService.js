export class GeneralStatisticsService {
    constructor($resource) {
       this.generalStatisticsResource = $resource('general');
    }
}
