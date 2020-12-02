const SceneObjectStateEnum = require("./SceneObjectStateEnum.js");
const SceneObjectEnum = require("./SceneObjectEnum.js");
const CylindricalScene = require("./CylindricalScene.js");

class Tour {
    constructor(parentElement, _type) {
        this._parentElement = parentElement;
        this._touchDistance = 0.0;

        window.addEventListener("resize", (event) => {this._onResize(event);});
        this._parentElement.addEventListener("mousemove", (event) => {this._onMouseMove(event);});
        this._parentElement.addEventListener("click", (event) => {this._onClick(event);});
        this._parentElement.addEventListener("wheel", (event) => {this._onMouseWheel(event);});
        this._parentElement.addEventListener("touchstart", (event) => {this._onTouchStart(event);});
        this._parentElement.addEventListener("touchmove", (event) => {this._onTouchMove(event);});
        this._parentElement.addEventListener("touchend", (event) => {this._onTouchEnd(event);});

        this._sceneDataMap = new Map();
        this._scene = new CylindricalScene(this._parentElement);
        this._scene.addEventListener("portalclicked", (event) => {this._onTransitionActivated(event);} );

        this._scene.resize(this._parentElement.offsetWidth, this._parentElement.offsetHeight);
    }

    setAssetsPath(assetsPath) {
        this._scene.setAssetsPath(assetsPath);
    }

    setZoom(zoomMin, zoomMax, zoomSpeed) {
        this._scene.setZoom(zoomMin, zoomMax, zoomSpeed);
    }

    setLang(lang) {
        this._scene.setLang(lang);
    }

    addScene(sceneData) {
        this._sceneDataMap.set(sceneData.uid, sceneData);
    }

    start(entrySceneUid) {
        if (!this._sceneDataMap.has(entrySceneUid)) {
            throw new Error("Unable start a tour. Unknown scene UID");
        }

        const data = this._sceneDataMap.get(entrySceneUid);
        this._scene.init(data);
    }

    _onResize(_event) {
        this._scene.resize(this._parentElement.offsetWidth, this._parentElement.offsetHeight);
    }

    _onMouseMove(event) {
        this._scene.hover(event.clientX, event.clientY);
    }

    _onClick(event) {
        this._scene.click(event.clientX, event.clientY);
        event.stopPropagation();
    }

    _onMouseWheel(event) {
        event.preventDefault();
        const zoomStep = 3;
        this._scene.zoom(event.deltaY > 0 ? zoomStep : -zoomStep);
    }

    _onTouchStart(event) {
        if (event.touches.length == 2) {
            this._touchDistance = this._getTouchDistance(event);
        }
    }

    _onTouchMove(event) {
        const ZoomStep = 2;
        const TouchDeltaSensitivity = 2;

        if (event.touches.length == 2) {
            event.preventDefault(); // to prevent scrolling
            event.stopPropagation();
            const touchDistance = this._getTouchDistance(event);
            const delta = this._touchDistance - touchDistance;

            if (Math.abs(delta) < TouchDeltaSensitivity) {
                return; // to prevent scene vibrations
            }

            this._scene.zoom(delta > 0 ? ZoomStep : -ZoomStep);
            this._touchDistance = touchDistance;
        }
    }

    _onTouchEnd(event) {
        if (event.touches.length == 2) {
            this._touchDistance = 0.0;
        } else {
            this._scene.click(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
            event.preventDefault();
        }
    }

    _onTransitionActivated(event) {
        if (!this._sceneDataMap.has(event.uid)) {
            throw new Error("Unable start a tour. Unknown scene UID");
        }

        const data = this._sceneDataMap.get(event.uid);
        this._scene.init(data);
    }

    _getTouchDistance(event) {
        return Math.hypot(event.touches[0].clientX - event.touches[1].clientX,
                          event.touches[0].clientY - event.touches[1].clientY);
    }
}

module.exports = Tour;
