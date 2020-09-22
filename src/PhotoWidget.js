class PhotoWidget {
    constructor(parentElement) {
        this._element = document.createElement("div");
        this._element.className = "photo-container";
        parentElement.appendChild(this._element);

        this._imageElement = document.createElement("img");
        this._imageElement.className = "photo-widget";
        this._imageElement.style = "position:absolute; top:0px; left:0px; background-color: #aaaaaaaa;\
            width:100%; height:100%; object-fit:contain;";
        this._element.appendChild(this._imageElement);

        this._closeElement = document.createElement("div");
        this._closeElement.className = "photo-close-item";
        this._closeElement.style = "position:absolute; top:5px; right:10px; color:white; font:20px Arial;\
            cursor:pointer;";
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
