import { Templates } from "./templates";
import { Helpers } from "./helpers";

/**
 * The user interfaces managed by the app script.
 * @export
 * @class UserInterfaces
 */
export class UiService {
  /**
   * The showConfigurationModal user interface.
   * @memberof UserInterfaces
   */
  showConfigurationModal() {
    const template = HtmlService.createTemplate(
      Templates.configurationModal
    );

    const boundTemplate = Helpers.bindPropertiesToTemplate(template);

    const html = boundTemplate
      .evaluate()
      .setHeight(650)
      .setWidth(450);

    FormApp.getUi().showModalDialog(html, "Configure OpenBadges");
  }
}
