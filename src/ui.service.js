import { BaseService } from "./base.service";
import { TemplateProvider } from "./template.provider";

/**
 * The user interfaces managed by the app script.
 * @export
 * @class UserInterfaces
 */
export class UiService extends BaseService {
  /**
   * The showConfigurationModal user interface.
   * @memberof UserInterfaces
   */
  showConfigurationModal() {
    const template = HtmlService.createTemplate(
      TemplateProvider.configurationModal
    );

    const boundTemplate = this.bindPropertiesToTemplate(template);

    const html = boundTemplate
      .evaluate()
      .setHeight(650)
      .setWidth(450);

    FormApp.getUi().showModalDialog(html, "Configure OpenBadges");
  }

  /**
   * Fetches the user properties and binds them to the provided template.
   * @param {any} template
   * @return {any} boundTemplate
   * @memberof UiService
   */
  bindPropertiesToTemplate(template) {
    const properties = PropertiesService.getUserProperties().getProperties();

    return {
      ...template,
      apiKey: properties["OB_API_KEY"] || "",
      authToken: properties["OB_AUTH_TOKEN"] || "",
      openBadgesUrl: properties["OB_URL"] || "",
      activityId: properties["OB_ACTIVITY_ID"] || "",
      activityTime: properties["OB_ACTIVITY_TIME"] || "",
      firstName: properties["OB_FIRST_NAME"] || "",
      lastName: properties["OB_LAST_NAME"] || "",
      userId: properties["OB_USER_ID"] || "",
      text1: properties["OB_TEXT_1"] || "",
      text2: properties["OB_TEXT_2"] || "",
      email: properties["OB_EMAIL"] || "",
      int1: properties["OB_INT_1"] || "",
      int2: properties["OB_INT_2"] || "",
      date1: properties["OB_DATE_1"] || ""
    };
  }
}
