const Button = require("./Button.js");
const I18n = require("./I18n.js");

/**
 * @classdesc
 * The button to switch on/off the fullscreen mode
 * 
 * @extends Button
 */
class FullscreenButton extends Button {
    /**
     * @constructor
     * @param {HTMLElement} [parentElement] - An HTML container for the button 
     */
    constructor(parentElement) {
        super(parentElement);
        this.setToolTip(I18n.Dict.FullscreenTooltip);
        this.addClassName("vt-fullscreen-button");
        this.addClickEventListener((event) => { this._onClicked(event); });
    }

    /**
     * Calls automatically on the button activating
     * 
     * @param {Event} event
     * @private
     */
    _onClicked(event) {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }

        event.stopPropagation();
        event.preventDefault();
    }
}

module.exports = FullscreenButton;
