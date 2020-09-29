class FullscreenButton {
    constructor(parentElement) {
        this._element = document.createElement("div");
        this._element.className = "fullscreen-button";
        this._element.style = "position:absolute; top:5px; right:5px; background-color:#a6a6a687;\
            width:32px; height:24px; border:2px solid white; border-radius:5px; cursor:pointer;";
        parentElement.appendChild(this._element);

        this._element.addEventListener("click", (event) => { this._onClicked(event); });
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
    }
}

module.exports = FullscreenButton;
