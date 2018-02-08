/**
 * The app script events used by triggers.
 * @export
 * @class Events
 */
export class Events {
  /**
   * The onOpen event function which runs when the document/form
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
   * The onSaveConfiguration event function which runs when the user has
   * saved their OpenBadges configuration within the google app.
   * @param {any} configuration
   * @memberof Events
   */
  onSaveConfiguration(configuration) {
    const propertyService = PropertiesService.getScriptProperties();
    const properties = {
      OB_API_KEY: configuration.apiKey,
      OB_URL: configuration.openBadgesUrl,
      OB_AUTH_TOKEN: configuration.authToken
    };
    propertyService.setProperties(properties);
  }

  /**
   *  The onFormSubmit event function which runs when a form is submitted.
   * @memberof Events
   */
  onFormSubmit() {
    // Get the OpenBadges configuration.
    const propertyService = PropertiesService.getScriptProperties();
    const keys = propertyService.getKeys();

    // Stop processing If the required properties are not present,
    if (
      keys.indexOf("OB_API_KEY") == -1 ||
      keys.indexOf("OB_URL") == -1 ||
      keys.indexOf("OB_AUTH_TOKEN") == -1
    ) {
      return;
    }

    // Otherwise fetch the actual property values.
    const properties = propertyService.getProperties();

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
    Logger.log(response.getResponseCode());
  }
}
