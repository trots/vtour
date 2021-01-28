/**
 * Main dictionary for the virtual tour standard text elements
 */
var Dict = {
    Loading: "Loading...",
    Close: "Close",
    SceneTooltip: "Scene name",
    FullscreenTooltip: "Switch fullscreen",
    VersionLabelTooltip: "Powered by vtour",
    PortalTooltip: "Go",
    PhotospotTooltip: "Look closer",
    ExitTooltip: "Exit",
    ExitQuestion: "Are you sure you want to close the tour?"
};

/**
 * Sets a language for the virtual tour standard text elements
 * 
 * Supported laguages: en, ru
 * 
 * @param {string} lang - The language acronim
 */
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
            Dict.ExitTooltip = "Выйти";
            Dict.ExitQuestion = "Вы действительно хотите закончить виртуальный тур?";
            break;

        default:
            break;
    }
}

module.exports = {Dict, SetLang};
