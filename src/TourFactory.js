const Tour = require("./Tour.js");

class TourFactory {
    static start(tourData) {
        var tour = new Tour(tourData.type);
        tour.setPortalTexture(tourData.normalPortalImage, tourData.hoveredPortalImage);
        tour.setZoom(tourData.zoomMin, tourData.zoomMax, tourData.zoomSpeed);
        tour.setLang(tourData.lang);

        for (let i = 0; i < tourData.scenes.length; i++) {
            const sceneData = tourData.scenes[i];
            tour.addScene(sceneData);
        }

        tour.start(tourData.entrySceneUid);
        return tour;
    }
}

module.exports = TourFactory;
