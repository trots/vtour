class _TourData {
    constructor() {
        this._data = {};
    }

    init(data) {
        this._data = data;
    }

    getPanoramaType() {
        return this._getValue(this._data, "type", "cylindrical");
    }

    getAssetsPath() {
        return this._getValue(this._data, "assetsPath", "");
    }

    getLang() {
        return this._getValue(this._data, "lang", "en");
    }

    getZoomRangeMin() {
        return this._getValue(this._data, "zoomMin", 1.0);
    }

    getZoomRangeMax() {
        return this._getValue(this._data, "zoomMax", 3.0);
    }

    getZoomSpeed() {
        return this._getValue(this._data, "zoomSpeed", 0.02);
    }

    isKeyboardEnabled() {
        return this._getValue(this._data, "enableKeyboard", true);
    }

    getExitUrl() {
        return this._getValue(this._data, "exitUrl", NaN);
    }

    getEntrySceneUid() {
        return this._getValue(this._data, "entrySceneUid", "");
    }

    getScenesCount() {
        return this._getValue(this._data, "scenes", []).length;
    }

    getSceneImage(uid) {
        const scene = this._getSceneObject(uid);
        return this._getValue(scene, "image", "");
    }

    getSceneTitle(uid) {
        const scene = this._getSceneObject(uid);
        return this._getValue(scene, "title", "");
    }

    getSceneTransitionsCount(uid) {
        const scene = this._getSceneObject(uid);
        return this._getValue(scene, "transitions", []).length;
    }

    getSceneTransitionHeight(uid, index) {
        const scene = this._getSceneObject(uid);
        const transition = this._getValue(scene, "transitions", [])[index];
        const point = this._getValue(transition, "point", {});
        return this._getValue(point, "height", 0);
    }

    getSceneTransitionRadius(uid, index) {
        const scene = this._getSceneObject(uid);
        const transition = this._getValue(scene, "transitions", [])[index];
        const point = this._getValue(transition, "point", {});
        return this._getValue(point, "radius", 0);
    }

    getSceneTransitionAngle(uid, index) {
        const scene = this._getSceneObject(uid);
        const transition = this._getValue(scene, "transitions", [])[index];
        const point = this._getValue(transition, "point", {});
        return this._getValue(point, "angle", 0);
    }

    getSceneTransitionUid(uid, index) {
        const scene = this._getSceneObject(uid);
        const transition = this._getValue(scene, "transitions", [])[index];
        return this._getValue(transition, "toUid", 0);
    }

    getScenePhotosCount(uid) {
        const scene = this._getSceneObject(uid);
        return this._getValue(scene, "photos", []).length;
    }

    getScenePhotoHeight(uid, index) {
        const scene = this._getSceneObject(uid);
        const photo = this._getValue(scene, "photos", [])[index];
        const point = this._getValue(photo, "point", {});
        return this._getValue(point, "height", 0);
    }

    getScenePhotoRadius(uid, index) {
        const scene = this._getSceneObject(uid);
        const photo = this._getValue(scene, "photos", [])[index];
        const point = this._getValue(photo, "point", {});
        return this._getValue(point, "radius", 0);
    }

    getScenePhotoAngle(uid, index) {
        const scene = this._getSceneObject(uid);
        const photo = this._getValue(scene, "photos", [])[index];
        const point = this._getValue(photo, "point", {});
        return this._getValue(point, "angle", 0);
    }

    getScenePhotoPath(uid, index) {
        const scene = this._getSceneObject(uid);
        const photo = this._getValue(scene, "photos", [])[index];
        return this._getValue(photo, "image", 0);
    }

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

    _getValue(data, key, defaultValue) {
        if (key in data) {
            return data[key];
        }

        return defaultValue;
    }
};

var TourData = new _TourData();
module.exports = TourData;
