class WaiterWidget {
    constructor(text, parentElement) {
        this._element = document.createElement("div");
        this._element.className = "waiter-widget";
        this._element.style = "position:absolute; top:50%; left:0px; color:white; font-size:1.5em;\
            width:100%; height:50px; text-align:center;";
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
