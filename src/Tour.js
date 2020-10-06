const SceneObjectStateEnum = require("./SceneObjectStateEnum.js");
const SceneObjectEnum = require("./SceneObjectEnum.js");
const CylindricalScene = require("./CylindricalScene.js");

class Tour {
    constructor(parentElement, _type) {
        this._parentElement = parentElement;
        this._scene = new CylindricalScene(this._parentElement);
        this._sceneDataMap = new Map();

        window.addEventListener("resize", (event) => {this._onResize(event);});
        this._parentElement.addEventListener("mousemove", (event) => {this._onMouseMove(event);});
        this._parentElement.addEventListener("click", (event) => {this._onClick(event);});
        this._parentElement.addEventListener("wheel", (event) => {this._onMouseWheel(event);});
        this._parentElement.addEventListener("touchend", (event) => {this._onTouchEnd(event);});
        this._scene.addEventListener("portalclicked", (event) => {this._onTransitionActivated(event);} );

        this._scene.resize(this._parentElement.offsetWidth, this._parentElement.offsetHeight);
    }

    setPortalTexture(normalStateImage, hoveredStateImage) {
        this._scene.setSceneObjectTexture(SceneObjectEnum.Portal, SceneObjectStateEnum.Normal, normalStateImage);
        this._scene.setSceneObjectTexture(SceneObjectEnum.Portal, SceneObjectStateEnum.Hovered, hoveredStateImage);
    }

    setPhotoTexture(normalStateImage, hoveredStateImage) {
        this._scene.setSceneObjectTexture(SceneObjectEnum.Photo, SceneObjectStateEnum.Normal, normalStateImage);
        this._scene.setSceneObjectTexture(SceneObjectEnum.Photo, SceneObjectStateEnum.Hovered, hoveredStateImage);
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
        this._scene.mouseWheel(event);
    }

    _onTouchEnd(event) {
        this._scene.click(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        event.preventDefault();
    }

    _onTransitionActivated(event) {
        if (!this._sceneDataMap.has(event.uid)) {
            throw new Error("Unable start a tour. Unknown scene UID");
        }

        const data = this._sceneDataMap.get(event.uid);
        this._scene.init(data);
    }
}

module.exports = Tour;
