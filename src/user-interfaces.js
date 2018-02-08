/**
 * The user interfaces managed by the app script.
 * @export
 * @class UserInterfaces
 */
export class UserInterfaces {
  /**
   * The showConfigurationModal user interface.
   * @memberof UserInterfaces
   */
  showConfigurationModal() {
    const template = HtmlService.createTemplate(
      require("./templates/configuration-modal.html")
    );

    const propertyService = PropertiesService.getScriptProperties();
    const properties = propertyService.getProperties();

    template.apiKey = properties["OB_API_KEY"];
    template.authToken = properties["OB_AUTH_TOKEN"];
    template.openBadgesUrl = properties["OB_URL"];
    template.activityId = properties["OB_ACTIVITY_ID"];
    template.activityTime = properties["OB_ACTIVITY_TIME"];
    template.userId = properties["OB_USER_ID"];
    template.text1 = properties["OB_TEXT_1"];
    template.text2 = properties["OB_TEXT_2"];
    template.firstName = properties["OB_FIRST_NAME"];
    template.lastName = properties["OB_LAST_NAME"];
    template.email = properties["OB_EMAIL"];
    template.int1 = properties["OB_INT_1"];
    template.int2 = properties["OB_INT_2"];
    template.date1 = properties["OB_DATE_1"];

    const html = template
      .evaluate()
      .setHeight(600)
      .setWidth(300);

    FormApp.getUi().showModalDialog(html, "Configure OpenBadges");
  }
}
