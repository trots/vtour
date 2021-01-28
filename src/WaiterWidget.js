/**
 * @classdesc
 * Provides the waiting (loading) widget to covers the all tour content
 */
class WaiterWidget {
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
        this._element.className = "vt-waiter-widget";
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

module.exports = WaiterWidget;
