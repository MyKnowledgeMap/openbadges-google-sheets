

export function showConfigurationModal() {
  var template = HtmlService.createTemplate(require("./templates/configuration-modal.html"))

  var propertyService = PropertiesService.getScriptProperties();
  var properties = propertyService.getProperties();

  template.apiKey = properties.apiKey;
  template.authToken = properties.authToken;
  template.openBadgesUrl = properties.openBadgesUrl;

  var html = template.evaluate()
    .setHeight(220)
    .setWidth(250);

  FormApp.getUi().showModalDialog(html, "Configure OpenBadges");
}
