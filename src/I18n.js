var Dict = {
    Loading: "Loading...",
    Close: "Close",
    SceneTooltip: "Scene name",
    FullscreenTooltip: "Switch fullscreen",
    VersionLabelTooltip: "Powered by vtour",
    PortalTooltip: "Go",
    PhotospotTooltip: "Look closer"
};

var SetLang = function(lang) {
    switch (lang) {
        case "ru":
            Dict.Loading = "Загрузка...";
            Dict.Close = "Закрыть";
            Dict.SceneTooltip = "Название сцены";
            Dict.FullscreenTooltip = "Переключить режим полного экрана";
            Dict.VersionLabelTooltip = "Создано с использоанием vtour";
            Dict.PortalTooltip = "Перейти";
            Dict.PhotospotTooltip = "Рассмотреть";
            break;

        default:
            break;
    }
}

module.exports = {Dict, SetLang};
