const CylindricalScene = require("./CylindricalScene.js");

class Tour {
    constructor(_type) {
        this._scene = new CylindricalScene();
        this._sceneDataMap = new Map();

        this._scene.addEventListener("portalclicked", (event) => {this._onTransitionActivated(event);} );
    }

    setPortalTexture(normalStateImage, hoveredStateImage) {
        this._scene.setPortalTexture(normalStateImage, hoveredStateImage);
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

    resize(width, height) {
        this._scene.resize(width, height);
    }

    mouseMove(event) {
        this._scene.mouseMove(event);
    }

    mouseClick(event) {
        this._scene.mouseClick(event);
    }

    mouseWheel(event) {
        this._scene.mouseWheel(event);
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
