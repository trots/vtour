class WaiterWidget {
    constructor(text, parentElement) {
        this._element = document.createElement("div");
        this._element.className = "vt-waiter-widget";
        this._element.innerHTML = text;
        parentElement.appendChild(this._element);
    }

    setText(text) {
        this._element.innerHTML = text;
    }

    show() {
        this._element.style.visibility = "visible";
    }

    hide() {
        this._element.style.visibility = "hidden";
    }
}

module.exports = WaiterWidget;
