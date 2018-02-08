export function onInstall() {
  onOpen();
}

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

  onSaveConfiguration({
    apiKey: "52KF0RSTPdmiaq7TSI0u1kHNAEpmyFNGg88QUBrB8XVUEoNLs6ffbguWcEUK",
    authToken:
      "7GNZSDcW996QjNkMGCa7SYEolYLeAVRfw1K97Vyh7VLvHUlP-ufpbZr0jgl4rrCNMnQTejcmUX2eRLjCn5CsJIOWHxPJIGMKMFYAtyqR5lsqm5Srt0PO3I4dSflXdFYM6SpZZaSFrgUIUZenW10iKxLmNWkLfB-o5IGCV7wKhhVRx5hgyE7daFWyTGwMQoKfzD-doP9MRNrW8CsMzRtNs_vAq4-z6cqM4jIiHcDfuZ8WkwQKwMd_UMiGIosz_ajmN81r_HXi0TtOfwUnCVW0tUlbucIifacV7sFdpPPkd8upUlxyvetbBLaUHUACzSiPIVbgK9Ti7vbVi9OAv4oeRI8s89GLO2HX5Akac_WeKthqlhgvEvY3UDMGl1nmUa1qOvEFLLXRSjsk3_bbKiZlzbSaAUmUAcd8A2QD0iG1w0D1-x99uqHD4UOMPHa9D5MzPODUaiTEC2zxb5pSfXkLDd9opt6FBSKv-Ekqf8JpO1ojQSebzoR5CWU1yaOPbA_q7Z7rtsjRAPL1e4iMIF16f3-TKP16Z1ZA4V6o4_J2bUUKV6HYPazqgekJFRBrT0lcbRCeln6kixrJ7CLPosKGoMYrdIA",
    openBadgesUrl: "https://activityevents-dev.mkmapps.com/api/ActivityEvents/"
  });

  onFormSubmit();
}

export function onSaveConfiguration(configuration) {
  var propertyService = PropertiesService.getScriptProperties();
  var properties = {
    OB_API_KEY: configuration.apiKey,
    OB_URL: configuration.openBadgesUrl,
    OB_AUTH_TOKEN: configuration.authToken
  };
  propertyService.setProperties(properties);
}

export function onFormSubmit() {
  // Get the OpenBadges configuration.
  var propertyService = PropertiesService.getScriptProperties();
  var keys = propertyService.getKeys();

  // If the required properties are not present the app script cannot continue.
  if (
    keys.indexOf("OB_API_KEY") == -1 ||
    keys.indexOf("OB_URL") == -1 ||
    keys.indexOf("OB_AUTH_TOKEN") == -1
  ) {
    return;
  }

  // Otherwise fetch the actual property values.
  var properties = propertyService.getProperties();

  // Build the request header.
  var headers = {
    Authorization: "Bearer " + properties["OB_AUTH_TOKEN"],
    ApiKey: properties["OB_API_KEY"]
  };

  // Build the request payload.
  var payload = {
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
  var options = {
    method: "post",
    contentType: "application/json",
    headers: headers,
    payload: JSON.stringify(payload)
  };

  // Make the request and get the response.
  var response = UrlFetchApp.fetch(properties["OB_URL"], options);
  Logger.log(response.getResponseCode());
}
