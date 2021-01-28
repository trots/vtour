/**
 * @classdesc
 * Singletone class to provide safe access to the configuration object of the virtual tour\
 */
class _TourData {
    /**
     * @constructor
     */
    constructor() {
        /**
         * The user configuration data object
         * @type {object}
         * @default {}
         * @protected
         */
        this._data = {};
    }

    /**
     * Sets the configuration object
     * 
     * @param {object} data - The configuration object of the virtual tour
     * @see TourFactory#start
     */
    init(data) {
        this._data = data;
    }

    /**
     * Returns the panorama domain type
     * 
     * @default "cylindrical"
     * @returns {string} The type string
     */
    getPanoramaType() {
        return this._getValue(this._data, "type", "cylindrical");
    }

    /**
     * Returns the assets path
     * 
     * @default ""
     * @returns {string} The path string
     */
    getAssetsPath() {
        return this._getValue(this._data, "assetsPath", "");
    }

    /**
     * Returns the vtour language name acronim
     * 
     * @default "en"
     * @returns {string} The language name string
     */
    getLang() {
        return this._getValue(this._data, "lang", "en");
    }

    /**
     * Returns the minimum possible zoom value
     * 
     * @default 1.0
     * @returns {number} The zoom value
     */
    getZoomRangeMin() {
        return this._getValue(this._data, "zoomMin", 1.0);
    }

    /**
     * Returns the maximum possible zoom value
     * 
     * @default 3.0
     * @returns {number} The zoom value
     */
    getZoomRangeMax() {
        return this._getValue(this._data, "zoomMax", 3.0);
    }

    /**
     * Returns the zoom changing speed
     * 
     * @default 0.02
     * @returns {number} The zoom speed value
     */
    getZoomSpeed() {
        return this._getValue(this._data, "zoomSpeed", 0.02);
    }

    /**
     * Returns the keyboard enabled/disabled status
     * 
     * @default true
     * @returns {boolean} `true` if the keyboard is enabled and `false` otherwise
     */
    isKeyboardEnabled() {
        return this._getValue(this._data, "enableKeyboard", true);
    }

    /**
     * Returns enabled/disabled status of informative tooltips for scene objects
     * 
     * @default true
     * @returns {boolean} `true` if the informative tooltips is enabled and `false` otherwise
     */
    isInformativeDestinationTooltipsEnabled() {
        return this._getValue(this._data, "enableInformativeDestinationTooltips", true);
    }

    /**
     * Returns the destination URL for an exit button
     * 
     * @default NaN
     * @returns {string} The URL string
     */
    getExitUrl() {
        return this._getValue(this._data, "exitUrl", NaN);
    }

    /**
     * Returns the scene UID from wich the tour will be started
     * 
     * @default ""
     * @returns {string} The UID string
     */
    getEntrySceneUid() {
        return this._getValue(this._data, "entrySceneUid", "");
    }

    /**
     * Returns the scenes count in the tour
     * 
     * @default 0
     * @returns {number} The count number
     */
    getScenesCount() {
        return this._getValue(this._data, "scenes", []).length;
    }

    /**
     * Returns the file name of the scene panorama image
     * 
     * @param {string} uid - The scene UID
     * @default ""
     * @returns {string} The image file path
     */
    getSceneImage(uid) {
        const scene = this._getSceneObject(uid);
        return this._getValue(scene, "image", "");
    }

    /**
     * Returns the scene title
     * 
     * @param {string} uid - The scene UID
     * @default ""
     * @returns {string} The title string
     */
    getSceneTitle(uid) {
        const scene = this._getSceneObject(uid);
        return this._getValue(scene, "title", "");
    }

    /**
     * Returns the transitions count for the scene
     * 
     * @param {string} uid - The scene UID
     * @default 0
     * @returns {number} The count value
     */
    getSceneTransitionsCount(uid) {
        const scene = this._getSceneObject(uid);
        return this._getValue(scene, "transitions", []).length;
    }

    /**
     * Returns the height coordinate of the transition object
     * 
     * @param {string} uid - The scene UID
     * @param {number} index - The transition index
     * @default 0
     * @returns {number} The coordinate value
     */
    getSceneTransitionHeight(uid, index) {
        const scene = this._getSceneObject(uid);
        const transition = this._getValue(scene, "transitions", [])[index];
        const point = this._getValue(transition, "point", {});
        return this._getValue(point, "height", 0);
    }

    /**
     * Returns the radius coordinate of the transition object
     * 
     * @param {string} uid - The scene UID
     * @param {number} index - The transition index
     * @default 0
     * @returns {number} The coordinate value
     */
    getSceneTransitionRadius(uid, index) {
        const scene = this._getSceneObject(uid);
        const transition = this._getValue(scene, "transitions", [])[index];
        const point = this._getValue(transition, "point", {});
        return this._getValue(point, "radius", 0);
    }

    /**
     * Returns the angle coordinate of the transition object
     * 
     * @param {string} uid - The scene UID
     * @param {number} index - The transition index
     * @default 0
     * @returns {number} The coordinate value
     */
    getSceneTransitionAngle(uid, index) {
        const scene = this._getSceneObject(uid);
        const transition = this._getValue(scene, "transitions", [])[index];
        const point = this._getValue(transition, "point", {});
        return this._getValue(point, "angle", 0);
    }

    /**
     * Returns the destination scene UID of the transition object
     * 
     * @param {string} uid - The scene UID
     * @param {number} index - The transition index
     * @default 0
     * @returns {number} The coordinate value
     */
    getSceneTransitionUid(uid, index) {
        const scene = this._getSceneObject(uid);
        const transition = this._getValue(scene, "transitions", [])[index];
        return this._getValue(transition, "toUid", 0);
    }

    /**
     * Returns the photos count for the scene
     * 
     * @param {string} uid - The scene UID
     * @default 0
     * @returns {number} The count value
     */
    getScenePhotosCount(uid) {
        const scene = this._getSceneObject(uid);
        return this._getValue(scene, "photos", []).length;
    }

    /**
     * Returns the height coordinate of the photo object
     * 
     * @param {string} uid - The scene UID
     * @param {number} index - The photo index
     * @default 0
     * @returns {number} The coordinate value
     */
    getScenePhotoHeight(uid, index) {
        const scene = this._getSceneObject(uid);
        const photo = this._getValue(scene, "photos", [])[index];
        const point = this._getValue(photo, "point", {});
        return this._getValue(point, "height", 0);
    }

    /**
     * Returns the radius coordinate of the photo object
     * 
     * @param {string} uid - The scene UID
     * @param {number} index - The photo index
     * @default 0
     * @returns {number} The coordinate value
     */
    getScenePhotoRadius(uid, index) {
        const scene = this._getSceneObject(uid);
        const photo = this._getValue(scene, "photos", [])[index];
        const point = this._getValue(photo, "point", {});
        return this._getValue(point, "radius", 0);
    }

    /**
     * Returns the angle coordinate of the photo object
     * 
     * @param {string} uid - The scene UID
     * @param {number} index - The photo index
     * @default 0
     * @returns {number} The coordinate value
     */
    getScenePhotoAngle(uid, index) {
        const scene = this._getSceneObject(uid);
        const photo = this._getValue(scene, "photos", [])[index];
        const point = this._getValue(photo, "point", {});
        return this._getValue(point, "angle", 0);
    }

    /**
     * Returns the image file name of the photo object
     * 
     * @param {string} uid - The scene UID
     * @param {number} index - The photo index
     * @default 0
     * @returns {string} The file name
     */
    getScenePhotoPath(uid, index) {
        const scene = this._getSceneObject(uid);
        const photo = this._getValue(scene, "photos", [])[index];
        return this._getValue(photo, "image", 0);
    }

    /**
     * Returns the title of the photo object
     * 
     * @param {string} uid - The scene UID
     * @param {number} index - The photo index
     * @default 0
     * @returns {string} The title string
     */
    getScenePhotoTitle(uid, index) {
        const scene = this._getSceneObject(uid);
        const photo = this._getValue(scene, "photos", [])[index];
        return this._getValue(photo, "title", "");
    }

    /**
     * Returns the scene configuration object
     * 
     * @param {string} uid - The scene UID
     * @returns {object} The scene object
     * @protected
     */
    _getSceneObject(uid) {
        const scenes = this._getValue(this._data, "scenes", []);

        for (const scene of scenes) {
            const sceneUid = this._getValue(scene, "uid", "");

            if (sceneUid == uid) {
                return scene;
            }
        }

        return NaN;
    }

    /**
     * Return the configuration value by key
     * 
     * @param {object} data - The object
     * @param {string} key - The field key in the object
     * @param {any} defaultValue - The default return value
     * @returns {any} Founded value or default value if key is not found
     * @protected
     */
    _getValue(data, key, defaultValue) {
        if (data && (key in data)) {
            return data[key];
        }

        return defaultValue;
    }
};

/**
 * The tour configuration data. Singletone object
 * @global
 */
var TourData = new _TourData();
module.exports = TourData;
