const I18n = require("./I18n.js");

class PhotoWidget {
    constructor(parentElement) {
        this._element = document.createElement("div");
        this._element.className = "vt-photo-container";
        parentElement.appendChild(this._element);

        this._imageElement = document.createElement("img");
        this._imageElement.className = "vt-photo-widget";
        this._element.appendChild(this._imageElement);

        this._closeElement = document.createElement("div");
        this._closeElement.title = I18n.Dict.Close;
        this._closeElement.className = "vt-photo-close-item";
        this._closeElement.innerHTML = "X";
        this._element.appendChild(this._closeElement);
    }

    setPhoto(photoPath) {
        this._imageElement.src = photoPath;
    }

    isVisible() {
        return this._element.style.visibility == "visible";
    }

    show() {
        this._element.style.visibility = "visible";
    }

    hide() {
        this._element.style.visibility = "hidden";
    }
}

module.exports = PhotoWidget;
