const I18n = require("./I18n.js");

class FullscreenButton {
    constructor(parentElement) {
        this._element = document.createElement("div");
        this._element.title = I18n.Dict.FullscreenTooltip;
        this._element.className = "vt-fullscreen-button";
        parentElement.appendChild(this._element);

        this._element.addEventListener("click", (event) => { this._onClicked(event); });
        this._element.addEventListener("touchend", (event) => { this._onClicked(event); });
    }

    show() {
        this._element.style.visibility = "visible";
    }

    hide() {
        this._element.style.visibility = "hidden";
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
