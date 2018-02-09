import { BaseService } from "./base.service";

/**
 * The app script events used by triggers.
 * @export
 * @class Events
 */
export class EventService extends BaseService {
  /**
   * The onOpen event function hich runs when the document/form
   * that the app script has been installed is opened.
   * @memberof Events
   */
  onOpen() {
    // Add the config menu to the UI.
    FormApp.getUi()
      .createAddonMenu()
      .addItem("Settings", "showConfigurationModal")
      .addToUi();

    // Add the onFormSubmit trigger manually.
    ScriptApp.newTrigger("onFormSubmit")
      .forForm(FormApp.getActiveForm())
      .onFormSubmit()
      .create();
  }

  /**
   * The onInstall event function which runs when the app script is installed.
   * @memberof Events
   */
  onInstall() {
    this.onOpen();
  }

  /**
   * The onSaveconfig event function which runs when the user has
   * saved their OpenBadges config within the google app.
   * @param {any} config
   * @memberof Events
   */
  onSaveConfiguration(config) {
    // TODO: Validate the provided config, throw errors if validation fails.

    // Create the property model from the provided config.
    const properties = {
      OB_API_KEY: config.apiKey,
      OB_URL: config.openBadgesUrl,
      OB_AUTH_TOKEN: config.authToken,
      OB_ACTIVITY_ID: config.activityId,
      OB_ACTIVITY_TIME: config.activityTime,
      OB_USER_ID: config.userId,
      OB_FIRST_NAME: config.firstName,
      OB_LAST_NAME: config.lastName,
      OB_TEXT_1: config.text1,
      OB_TEXT_2: config.text2,
      OB_EMAIL: config.email,
      OB_INT_1: config.int1,
      OB_INT_2: config.int2,
      OB_DATE_1: config.date1
    };

    // Save the properties so they can be used later.
    PropertiesService.getUserProperties().setProperties(properties);
  }

  /**
   *  The onFormSubmit event function which runs when a form is submitted.
   * @memberof Events
   * @return {any}
   */
  onFormSubmit() {
    // Get the script properties which should have been configured.
    const properties = PropertiesService.getUserProperties().getProperties();

    // Stop processing if the properties needed to make a request are not set.
    const requiredProperties = ["OB_URL", "OB_AUTH_TOKEN", "OB_API_KEY"];
    if (!this.hasRequiredProperties(properties, requiredProperties)) {
      Logger.log("Request cancelled as required properties are missing.");
      return false;
    }

    // Build the request header.
    const headers = {
      Authorization: "Bearer " + properties["OB_AUTH_TOKEN"],
      ApiKey: properties["OB_API_KEY"]
    };

    // Build the request payload.
    const payload = {
      activityId: properties["OB_ACTIVITY_ID"],
      activityTime: properties["OB_ACTIVITY_TIME"],
      userId: properties["OB_USER_ID"],
      text1: properties["OB_TEXT_1"],
      text2: properties["OB_TEXT_2"],
      firstName: properties["OB_FIRST_NAME"],
      lastName: properties["OB_LAST_NAME"],
      email: properties["OB_EMAIL"],
      int1: properties["OB_INT_1"],
      int2: properties["OB_INT_2"],
      date1: properties["OB_DATE_1"]
    };

    // Use the request headers and payload to create the request params.
    const options = {
      method: "post",
      contentType: "application/json",
      headers: headers,
      payload: JSON.stringify(payload)
    };

    // Make the request and get the response.
    const response = UrlFetchApp.fetch(properties["OB_URL"], options);

    return response;
  }

  /**
   * Check whether the required properties were set on the
   * provided properties object.
   * @param {any} properties
   * @param {string[]} propertyNames
   * @return {boolean} result
   * @memberof Events
   */
  hasRequiredProperties(properties, propertyNames) {
    const results = propertyNames.map(name => !!properties[name]);
    return results.every(result => result);
  }
}
