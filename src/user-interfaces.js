/**
 * The showConfigurationModal user interface.
 * @export
 */
export function showConfigurationModal() {
  const template = HtmlService.createTemplate(
    require("./templates/configuration-modal.html")
  );

  const propertyService = PropertiesService.getScriptProperties();
  const properties = propertyService.getProperties();

  template.apiKey = properties.apiKey;
  template.authToken = properties.authToken;
  template.openBadgesUrl = properties.openBadgesUrl;

  const html = template
    .evaluate()
    .setHeight(220)
    .setWidth(250);

  FormApp.getUi().showModalDialog(html, "Configure OpenBadges");
}
