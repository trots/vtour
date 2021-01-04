class Button {
    constructor(parentElement) {
        this._element = document.createElement("div");
        this._element.className = "vt-button";
        parentElement.appendChild(this._element);
    }

    show() {
        this._element.style.visibility = "visible";
    }

    hide() {
        this._element.style.visibility = "hidden";
    }

    setToolTip(text) {
        this._element.title = text;
    }

    addClassName(name) {
        this._element.className += " " + name;
    }

    addClickEventListener(callback) {
        this._element.addEventListener("click", callback);
        this._element.addEventListener("touchend", callback);
    }
}

module.exports = Button;
