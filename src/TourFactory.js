const I18n = require("./I18n.js");
const Tour = require("./Tour.js");
let TourData = require("./TourData.js");

/**
 * @classdesc
 * The class is the entry point of the virtual tour engine. Use it to run a virtual tour
 */
class TourFactory {
    /**
     * Runs the virtual tour engine with the specified configuration
     * 
     * @param {HTMLElement} [parentElement] - An HTMLElement to host a scene
     * @param {object} [tourData] - A configuration object of a virtual tour
     * @param {string} [tourData.type="cylindrical"] - A panorama geometry type. Cylindrical is only supported
     * @param {string} [tourData.assetsPath=""] - Path to the library assets files. Root is default
     * @param {string} [tourData.lang="en"] - Language of the standard text elements. Can be "en", "ru"
     * @param {number} [tourData.zoomMin=1.0] - Minimum scene zoom coefficient
     * @param {number} [tourData.zoomMax=3.0] - Maximum scene zoom coefficient
     * @param {number} [tourData.zoomSpeed=0.02] - Speed of scene zoom changing
     * @param {boolean} [tourData.enableKeyboard=true] - Enable/disable keyboard controlling of panorama view
     * @param {boolean} [tourData.enableInformativeDestinationTooltips = true] - Show tooltips with scene objects names
     * @param {string} [tourData.exitUrl=""] - Specify the destination URL for an exit button. If it's empty, no button is shown
     * @param {string} [tourData.entrySceneUid] - A scene UID where a virtual tour should be started
     * @param {Array} [tourData.scenes] - An array of the scenes objects
     * @param {string} [tourData.scenes[..].uid] - The scene UID string
     * @param {string} [tourData.scenes[..].image] - Path to the scene panorama image
     * @param {string} [tourData.scenes[..].title] - The scene title text
     * @param {Array} [tourData.scenes[..].transitions] - An array of the scene transitions
     * @param {Array} [tourData.scenes[..].transitions[..].toUid] - The destination scene UID
     * @param {Array} [tourData.scenes[..].transitions[..].point] - The transition button position point (cylindrical coords)
     * @param {Array} [tourData.scenes[..].transitions[..].point.radius] - The transition button radius coordinate (close/far)
     * @param {Array} [tourData.scenes[..].transitions[..].point.height] - The transition button height coordinate (up/down)
     * @param {Array} [tourData.scenes[..].transitions[..].point.angle] - The transition button angle coordinate (left/right)
     * @param {Array} [tourData.scenes[..].photos] - An array of the scene additional pictures
     * @param {Array} [tourData.scenes[..].photos[..].title] - The picture title text
     * @param {Array} [tourData.scenes[..].photos[..].image] - The picture image path
     * @param {Array} [tourData.scenes[..].photos[..].point] - The picture button position point (cylindrical coords)
     * @param {Array} [tourData.scenes[..].photos[..].point.radius] - The picture button radius coordinate (close/far)
     * @param {Array} [tourData.scenes[..].photos[..].point.height] - The picture button height coordinate (up/down)
     * @param {Array} [tourData.scenes[..].photos[..].point.angle] - The picture button angle coordinate (left/right)
     */
    static start(parentElement, tourData) {
        TourData.init(tourData);
        I18n.SetLang(TourData.getLang());

        let tour = new Tour(parentElement);
        tour.start();
        return tour;
    }
}

module.exports = TourFactory;
