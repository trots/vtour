const Button = require("./Button.js");
const I18n = require("./I18n.js");

class FullscreenButton extends Button {
    constructor(parentElement) {
        super(parentElement);
        this.setToolTip(I18n.Dict.FullscreenTooltip);
        this.addClassName("vt-fullscreen-button");
        this.addClickEventListener((event) => { this._onClicked(event); });
    }

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
