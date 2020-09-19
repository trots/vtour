class PhotoWidget {
    constructor(parentElement) {
        this._element = document.createElement("img");
        this._element.className = "photo-widget";
        this._element.style = "position:absolute; top:0px; left:0px; background-color: #aaaaaaaa;\
            width:100%; height:100%; object-fit:contain;";
        parentElement.appendChild(this._element);
    }

    setPhoto(photoPath) {
        this._element.src = photoPath;
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
