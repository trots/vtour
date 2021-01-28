const I18n = require("./I18n.js");

/**
 * @classdesc
 * The widget to show an additional picture on the scene
 */
class PhotoWidget {
    /**
     * @constructor
     * @param {HTMLElement} [parentElement] - An HTML container for the widget
     */
    constructor(parentElement) {
        /**
         * The main HTML element
         * 
         * @type {HTMLElement}
         * @protected
         */
        this._element = document.createElement("div");
        this._element.className = "vt-photo-container";
        parentElement.appendChild(this._element);

        /**
         * The image HTML element
         * 
         * @type {HTMLElement}
         * @protected
         */
        this._imageElement = document.createElement("img");
        this._imageElement.className = "vt-photo-widget";
        this._element.appendChild(this._imageElement);

        /**
         * The close button HTML element
         * 
         * @type {HTMLElement}
         * @protected
         */
        this._closeElement = document.createElement("div");
        this._closeElement.title = I18n.Dict.Close;
        this._closeElement.className = "vt-photo-close-item";
        this._closeElement.innerHTML = "X";
        this._element.appendChild(this._closeElement);
    }

    /**
     * Sets a path to the image file
     * 
     * @param {string} photoPath The path string
     */
    setPhoto(photoPath) {
        this._imageElement.src = photoPath;
    }

    /**
     * Returns the widget visibility status
     * 
     * @returns {boolean} `true` if the widget is visible
     */
    isVisible() {
        return this._element.style.visibility == "visible";
    }

    /**
     * Shows the widget
     */
    show() {
        this._element.style.visibility = "visible";
    }

    /**
     * Hides the widget
     */
    hide() {
        this._element.style.visibility = "hidden";
    }
}

module.exports = PhotoWidget;
