const I18n = require("./I18n.js");
const CylindricalScene = require("./CylindricalScene.js");
let TourData = require("./TourData.js");
const Scene = require("./Scene.js");

/**
 * @classdesc
 * Class provides the virtual tour controlling
 */
class Tour {
    /**
     * @constructor
     * @param {HTMLElement} parentElement - An HTML container of the virtual tour
     */
    constructor(parentElement) {
        /**
         * The main HTML container
         * 
         * @type {HTMLElement}
         * @protected
         */
        this._parentElement = parentElement;

        /**
         * The last distance between two touches on the screen
         * 
         * @type {number}
         * @default 0
         * @protected
         */
        this._touchDistance = 0.0;

        window.addEventListener("resize", (event) => {this._onResize(event);});
        this._parentElement.addEventListener("mousemove", (event) => {this._onMouseMove(event);});
        this._parentElement.addEventListener("click", (event) => {this._onClick(event);});
        this._parentElement.addEventListener("wheel", (event) => {this._onMouseWheel(event);});
        this._parentElement.addEventListener("touchstart", (event) => {this._onTouchStart(event);});
        this._parentElement.addEventListener("touchmove", (event) => {this._onTouchMove(event);});
        this._parentElement.addEventListener("touchend", (event) => {this._onTouchEnd(event);});
        this._parentElement.addEventListener("keydown", (event) => {this._onKeyDown(event);});

        /**
         * The scene object. There is a panorama image is rendered
         * 
         * @type {Scene}
         * @protected
         */
        this._scene = new CylindricalScene(this._parentElement);
        this._scene.addEventListener("portalclicked", (event) => {this._onTransitionActivated(event);} );
        this._scene.addEventListener("exit", (event) => {this._onExitClicked(event);} );

        this._scene.resize(this._parentElement.offsetWidth, this._parentElement.offsetHeight);
    }

    /**
     * Runs the virtual tour from the entry scene
     */
    start() {
        this._scene.init(TourData.getEntrySceneUid());
    }

    /**
     * Calls automatically when the view is resized
     * 
     * @param {Event} _event - The resize event
     * @protected
     */
    _onResize(_event) {
        this._scene.resize(this._parentElement.offsetWidth, this._parentElement.offsetHeight);
    }

    /**
     * Calls automatically when the mouse is moved
     * 
     * @param {Event} event - The mouse move event
     * @protected
     */
    _onMouseMove(event) {
        this._scene.hover(event.clientX, event.clientY);
    }

    /**
     * Calls automatically when the mouse button is clicked
     * 
     * @param {Event} event - The mouse click event
     * @protected
     */
    _onClick(event) {
        this._scene.click(event.clientX, event.clientY);
        event.stopPropagation();
    }

    /**
     * Calls automatically when the mouse wheel is moved
     * 
     * @param {Event} event - The mouse wheel event
     * @protected
     */
    _onMouseWheel(event) {
        event.preventDefault();
        const zoomStep = 3;
        this._scene.zoom(event.deltaY < 0 ? zoomStep : -zoomStep);
    }

    /**
     * Calls automatically when the touch is started
     * 
     * @param {Event} event - The touch event
     * @protected
     */
    _onTouchStart(event) {
        if (event.touches.length == 2) {
            this._touchDistance = this._getTouchDistance(event);
        }
    }

    /**
     * Calls automatically when the touch is changing
     * 
     * @param {Event} event - The touch event
     * @protected
     */
    _onTouchMove(event) {
        const ZoomStep = 2;
        const TouchDeltaSensitivity = 2;

        if (event.touches.length == 2) {
            event.preventDefault(); // to prevent scrolling
            event.stopPropagation();
            const touchDistance = this._getTouchDistance(event);
            const delta = touchDistance - this._touchDistance;

            if (Math.abs(delta) < TouchDeltaSensitivity) {
                return; // to prevent scene vibrations
            }

            this._scene.zoom(delta > 0 ? ZoomStep : -ZoomStep);
            this._touchDistance = touchDistance;
        }
    }
    
    /**
     * Calls automatically when the touch is ended
     * 
     * @param {Event} event - The touch event
     * @protected
     */
    _onTouchEnd(event) {
        if (event.touches.length == 2) {
            this._touchDistance = 0.0;
        } else {
            this._scene.click(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
            event.preventDefault();
        }
    }

    /**
     * Calls automatically when the keyboard key is pressed
     * 
     * @param {Event} event - The key down event
     * @protected
     */
    _onKeyDown(event) {
        const RotateStep = 0.05;
        const ZoomStep = 2;

        if (!TourData.isKeyboardEnabled()) {
            return;
        }

        switch (event.keyCode) {
            case 27: // Key ESC
                if (this._scene.isPhotoVisible()) {
                    this._scene.setPhotoVisibility(false);
                }
                break;

            case 37: // Key LEFT
                this._scene.rotateY(RotateStep);
                break;
            
            case 39: // Key RIGHT
                this._scene.rotateY(-RotateStep);
                break;

            case 38: // Key UP
                // TODO: Rotation is disabled because of the scene controls object will be invalidated after that.
                // `controls.update()` is not working in this case.
                // Uncomment cases 38 and 40 when the problem with controls will be fixed.
                // this._scene.rotateX(RotateStep);
                break;

            case 40: // Key DOWN
                // this._scene.rotateX(-RotateStep);
                break;

            case 107: // Key + (numpad)
                this._scene.zoom(ZoomStep);
                break;

            case 109: // Key - (numpad)
                this._scene.zoom(-ZoomStep);
                break;

            case 61: // Key = (firefox)
            case 187: // Key =
                if (event.shiftKey) {
                    this._scene.zoom(ZoomStep);
                }
                break;

            case 173: // Key -
                if (!event.shiftKey) {
                    this._scene.zoom(-ZoomStep);
                }
                break;

            default:
                break;
        }
    }

    /**
     * Calls automatically when the transition between scenes was activated
     * 
     * @param {Event} event - The "portalclicked" event
     * @protected
     */
    _onTransitionActivated(event) {
        this._scene.init(event.uid);
    }

    /**
     * Calls automatically when the exit button is pressed
     * 
     * @param {Event} _event - The click event
     * @protected
     */
    _onExitClicked(_event) {
        if (confirm(I18n.Dict.ExitQuestion)) {
            window.location = TourData.getExitUrl();
        }
    }

    /**
     * Returns current distance between two touches
     * 
     * @param {Event} _event - The touch event
     * @returns {number} The distance value in pixels
     * @protected
     */
    _getTouchDistance(event) {
        return Math.hypot(event.touches[0].clientX - event.touches[1].clientX,
                          event.touches[0].clientY - event.touches[1].clientY);
    }
}

module.exports = Tour;
