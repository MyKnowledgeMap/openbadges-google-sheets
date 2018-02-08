/**
 * The onInstall event function which runs when the app script is installed.
 * @export
 */
export function onInstall() {
  onOpen();
}

/**
 * The onOpen event function which runs when the document/form
 * that the app script has been installed is opened.
 * @export
 */
export function onOpen() {
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
 * The onSaveConfiguration event function which runs when the user has
 * saved their OpenBadges configuration within the google app.
 * @export
 * @param {any} configuration
 */
export function onSaveConfiguration(configuration) {
  const propertyService = PropertiesService.getScriptProperties();
  const properties = {
    OB_API_KEY: configuration.apiKey,
    OB_URL: configuration.openBadgesUrl,
    OB_AUTH_TOKEN: configuration.authToken
  };
  propertyService.setProperties(properties);
}

/**
 * The onFormSubmit event function which runs when a form is submitted.
 * @export
 */
export function onFormSubmit() {
  // Get the OpenBadges configuration.
  const propertyService = PropertiesService.getScriptProperties();
  const keys = propertyService.getKeys();

  // If the required properties are not present the app script cannot continue.
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
    activityId: "Activity ADAM",
    activityTime: "03/02/2018",
    userId: "harrymitchinson@icloud.com",
    text1: "This is text 1",
    text2: "This is text 2",
    firstName: "Harry",
    lastName: "Mitchinson",
    email: "harrymitchinson@icloud.com",
    int1: "1234",
    int2: "5678",
    date1: "03/08/2018"
  };

  // Use the request headers and payload to create the fetch params.
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
