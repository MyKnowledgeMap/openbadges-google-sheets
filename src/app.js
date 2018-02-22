/* global PropertiesService FormApp ScriptApp Logger UrlFetchApp HtmlService Session MailApp */
/* eslint-disable no-unused-vars */
// Import HTML templates.
import settingsSidebarTemplate from "./templates/settings.sidebar.html";
import authorizationEmailTemplate from "./templates/authorization.email.html";
import authModal from "./templates/auth.modal.html";

// HTML template container.
const templates = {
  settingsSidebar: settingsSidebarTemplate,
  authModal,
  authorizationEmail: authorizationEmailTemplate
};

// Application container.

/**
 * Fetches the user properties and binds them to the provided template.
 * @param {any} template
 * @return {any} template
 */
const bindPropertiesToTemplate = template => {
  // Get the user properties.
  const properties = PropertiesService.getDocumentProperties().getProperties();

  /*
    Bind the properties to the template. Would be ideal to use the spread operator
    and make this function immutable however the template object needs a deep copy
    to get all required properties and functions for evaluating the template.
    */
  /* eslint-disable no-param-reassign */
  template.apiKey = properties.apiKey || "";
  template.apiToken = properties.apiToken || "";
  template.apiUrl = properties.apiUrl || "";
  template.activityId = properties.activityId || "";
  // template.activityTime = properties.activityTime || "";
  // template.firstName = properties.firstName || "";
  // template.lastName = properties.lastName || "";
  // template.userId = properties.userId || "";
  template.text1 = properties.text1 || "";
  // template.text2 = properties.text2 || "";
  // template.email = properties.email || "";
  template.int1 = properties.int1 || "";
  template.int2 = properties.int2 || "";
  template.date1 = properties.date1 || "";
  /* eslint-enable no-param-reassign */
  return template;
};

/**
 * Check whether the required properties were set on the
 * provided properties object.
 * @param {any} properties
 * @param {string[]} propertyNames
 * @return {boolean} result
 */
const hasRequiredProperties = (properties, propertyNames) => {
  const results = propertyNames.map(name => !!properties[name]);
  return results.every(result => result);
};

const showAuthModal = () => {
  const template = HtmlService.createTemplate(templates.authModal);

  const authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  template.authUrl = authInfo.getAuthorizationUrl();

  // Evaluate the template to HTML so bindings are rendered.
  const html = template
    .evaluate()
    .setTitle("OpenBadges")
    .setWidth(300)
    .setHeight(200);

  // Create the sidebar from the HTML.
  FormApp.getUi().showModalDialog(html, "Authorization required");
};

/**
 * The onOpen event function hich runs when the document/form
 * that the app script has been installed is opened.
 */
const onOpen = () => {
  const authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  if (authInfo.getAuthorizationStatus() === ScriptApp.AuthorizationStatus.REQUIRED) {
    FormApp.getUi()
      .createAddonMenu()
      .addItem("Authorize", "showAuthModal")
      .addToUi();
  } else {
    FormApp.getUi()
      .createAddonMenu()
      .addItem("Settings", "showSettingsSidebar")
      // .addItem("Authorize", "showAuthModal")
      .addToUi();
  }
};

/**
 * The onInstall event function which runs when the app script is installed.
 */
const onInstall = () => {
  onOpen();
};

/**
 * The onSaveconfig event function which runs when the user has
 * saved their OpenBadges config within the google app.
 * @param {any} config
 */
const onSaveConfiguration = config => {
  // TODO: Validate the provided config, throw errors if validation fails.

  // Create the property model from the provided config.
  const properties = {
    apiKey: config.apiKey,
    apiUrl: config.apiUrl,
    apiToken: config.apiToken,
    activityId: config.activityId,
    text1: config.text1,
    int1: config.int1,
    int2: config.int2,
    date1: config.date1
  };

  // Save the properties so they can be used later.

  PropertiesService.getDocumentProperties().setProperties(properties);
  const authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  if (authInfo.getAuthorizationStatus() !== ScriptApp.AuthorizationStatus.REQUIRED) {
    // Trigger for the onFormSubmit event.
    const triggers = ScriptApp.getProjectTriggers();
    Logger.log(`Amount of triggers ${triggers.length}`);

    // Check if there is an existing onFormSubmit trigger.
    const ofsTriggerExists = triggers.some(trigger => trigger.getHandlerFunction() === "onFormSubmit");

    // Create the trigger if it does not exist.
    if (!ofsTriggerExists) {
      ScriptApp.newTrigger("onFormSubmit")
        .forForm(FormApp.getActiveForm())
        .onFormSubmit()
        .create();
      Logger.log("Trigger added");
    }
  }
};

/**
 * Check whether the user has been recently sent a reauthorization email
 * and send a new email if required containing the reauthorization link.
 */
const onAuthorizationRequired = authInfo => {
  if (MailApp.getRemainingDailyQuota() === 0) {
    return Logger.log("Daily email quota has been reached.");
  }

  const properties = PropertiesService.getDocumentProperties();
  const lastAuthEmailDate = properties.getProperty("lastAuthEmailDate");
  const todayDate = new Date().toDateString();

  // Check whether the user has already received an email for reauth today.
  if (lastAuthEmailDate === todayDate) {
    return false;
  }

  // Get the template for the reauthorization email.
  const template = HtmlService.createTemplate(templates.authorizationEmail);
  template.url = authInfo.getAuthorizationUrl();
  const html = template.evaluate();

  // Send the email with the reauthorization link.
  const recipient = Session.getEffectiveUser().getEmail();
  const subject = "Authorization required";
  const body = html.getContent();
  const options = {
    name: "OpenBadges",
    htmlBody: body
  };
  MailApp.sendEmail(recipient, subject, body, options);

  // Update the lastAuthEmailDate property.
  properties.setProperty("lastAuthEmailDate", todayDate);
  return true;
};

/**
 *  The onFormSubmit event function which runs when a form is submitted.
 */
const onFormSubmit = e => {
  // Check whether authorization is required for this trigger event.
  const authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  if (authInfo.getAuthorizationStatus() === ScriptApp.AuthorizationStatus.REQUIRED) {
    return onAuthorizationRequired(authInfo);
  }

  // Get the script properties which should have been configured.
  const properties = PropertiesService.getDocumentProperties().getProperties();

  // Stop processing if the properties needed to make a request are not set.
  const requiredProperties = ["apiUrl", "apiToken", "apiKey"];
  if (!hasRequiredProperties(properties, requiredProperties)) {
    Logger.log("Request cancelled as required properties are missing.");
    return false;
  }

  // Get the original form and form response from the event.
  const { source: form, response } = e;

  // Build the request header.
  const headers = {
    Authorization: `Bearer ${properties.apiToken}`,
    ApiKey: properties.apiKey
  };

  // Build the request payload.
  const payload = {
    activityId: properties.activityId,
    activityTime: response.getTimestamp().toUTCString(),
    text1: properties.text1,
    text2: form.shortenFormUrl(form.getPublishedUrl()),
    email: response.getRespondentEmail(),
    userId: response.getRespondentEmail(),
    int1: properties.int1,
    int2: properties.int2,
    date1: properties.date1
  };

  // Use the request headers and payload to create the request params.
  const options = {
    method: "post",
    contentType: "application/json",
    headers,
    payload: JSON.stringify(payload)
  };

  Logger.log(JSON.stringify(options));

  // Make the request and get the response.
  const apiResult = UrlFetchApp.fetch(properties.apiUrl, options);

  return apiResult;
};

/**
 * The showConfigurationModal user interface.
 */
const showSettingsSidebar = () => {
  // Create the app template from the HTML template.
  const template = HtmlService.createTemplate(templates.settingsSidebar);

  // Add the bound properties to the template.
  const boundTemplate = bindPropertiesToTemplate(template);

  // Evaluate the template to HTML so bindings are rendered.
  const html = boundTemplate.evaluate().setTitle("Settings");

  // Create the sidebar from the HTML.
  FormApp.getUi().showSidebar(html);
};
