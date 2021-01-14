const I18n = require("./I18n.js");
const Tour = require("./Tour.js");
let TourData = require("./TourData.js");

class TourFactory {
    static start(parentElement, tourData) {
        TourData.init(tourData);
        I18n.SetLang(TourData.getLang());

        let tour = new Tour(parentElement);
        tour.start();
        return tour;
    }
}

module.exports = TourFactory;
