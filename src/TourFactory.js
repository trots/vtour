const I18n = require("./I18n.js");
const Tour = require("./Tour.js");

class TourFactory {
    static start(parentElement, tourData) {
        I18n.SetLang(tourData.lang);

        var tour = new Tour(parentElement, tourData.type);
        tour.setAssetsPath(tourData.assetsPath);
        tour.setZoom(tourData.zoomMin, tourData.zoomMax, tourData.zoomSpeed);

        for (let i = 0; i < tourData.scenes.length; i++) {
            const sceneData = tourData.scenes[i];
            tour.addScene(sceneData);
        }

        tour.start(tourData.entrySceneUid);
        return tour;
    }
}

module.exports = TourFactory;
