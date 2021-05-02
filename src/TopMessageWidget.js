/**
 * @classdesc
 * Provides the overlap widget with message that covers the all tour content
 */
class TopMessageWidget {
    /**
     * @constructor
     * @param {string} text - The text to display
     * @param {HTMLElement} parentElement - The HTML element container
     */
    constructor(text, parentElement) {
        /**
         * The main HTML element
         * 
         * @type {HTMLElement}
         * @protected
         */
        this._element = document.createElement("div");
        this._element.className = "vt-top-message-widget";
        this._element.innerHTML = text;
        parentElement.appendChild(this._element);
    }

    /**
     * Sets text to display in the widget
     * 
     * @param {string} text - The text string
     */
    setText(text) {
        this._element.innerHTML = text;
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

module.exports = TopMessageWidget;
