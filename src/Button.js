/**
 * @classdesc
 * The base HTML button implementation
 */
class Button {
    /**
     * @constructor
     * @param {HTMLElement} [parentElement] - An HTML container for the button
     */
    constructor(parentElement) {
        /**
         * The button HTML element
         * 
         * @type {HTMLElement}
         * @protected
         */
        this._element = document.createElement("div");
        this._element.className = "vt-button";
        parentElement.appendChild(this._element);
    }

    /**
     * Shows the button
     */
    show() {
        this._element.style.visibility = "visible";
    }

    /**
     * Hides the button
     */
    hide() {
        this._element.style.visibility = "hidden";
    }

    /**
     * Sets the button tooltip text
     * 
     * @param {string} text - The tooltip text
     */
    setToolTip(text) {
        this._element.title = text;
    }

    /**
     * Adds a new CSS classname to the existed one
     * 
     * @param {string} name - The class name string
     */
    addClassName(name) {
        this._element.className += " " + name;
    }

    /**
     * Adds a callback function on the button click (touch)
     * 
     * @param {object} callback - A callback function
     */
    addClickEventListener(callback) {
        this._element.addEventListener("click", callback);
        this._element.addEventListener("touchend", callback);
    }
}

module.exports = Button;
