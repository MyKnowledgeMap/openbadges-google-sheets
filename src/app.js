/* global PropertiesService FormApp ScriptApp Logger UrlFetchApp HtmlService Session MailApp */

// Import HTML templates.
import configurationModalTemplate from "./templates/configuration-modal.html";
import authorizationEmailTemplate from "./templates/authorization-email.html";

// HTML template container.
const templates = {
  configurationModal: configurationModalTemplate,
  authorizationEmail: authorizationEmailTemplate
};

// Application container.
const app = {
  /**
   * Fetches the user properties and binds them to the provided template.
   * @param {any} template
   * @return {any} template
   */
  bindPropertiesToTemplate: template => {
    // Get the user properties.
    const properties = PropertiesService.getUserProperties().getProperties();

    /*
    Bind the properties to the template. Would be ideal to use the spread operator
    and make this function immutable however the template object needs a deep copy
    to get all required properties and functions for evaluating the template.
    */
    /* eslint-disable no-param-reassign */
    template.apiKey = properties.apiKey || "";
    template.authToken = properties.authToken || "";
    template.openBadgesUrl = properties.apiUrl || "";
    template.activityId = properties.activityId || "";
    template.activityTime = properties.activityTime || "";
    template.firstName = properties.firstName || "";
    template.lastName = properties.lastName || "";
    template.userId = properties.userId || "";
    template.text1 = properties.text1 || "";
    template.text2 = properties.text2 || "";
    template.email = properties.email || "";
    template.int1 = properties.int1 || "";
    template.int2 = properties.int2 || "";
    template.date1 = properties.date1 || "";
    /* eslint-enable no-param-reassign */
    return template;
  },

  /**
   * Check whether the required properties were set on the
   * provided properties object.
   * @param {any} properties
   * @param {string[]} propertyNames
   * @return {boolean} result
   */
  hasRequiredProperties: (properties, propertyNames) => {
    const results = propertyNames.map(name => !!properties[name]);
    return results.every(result => result);
  },

  /**
   * The onOpen event function hich runs when the document/form
   * that the app script has been installed is opened.
   */
  onOpen: () => {
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
  },

  /**
   * The onInstall event function which runs when the app script is installed.
   */
  onInstall: () => {
    app.onOpen();
  },

  /**
   * The onSaveconfig event function which runs when the user has
   * saved their OpenBadges config within the google app.
   * @param {any} config
   */
  onSaveConfiguration: config => {
    // TODO: Validate the provided config, throw errors if validation fails.

    // Create the property model from the provided config.
    const properties = {
      apiKey: config.apiKey,
      apiUrl: config.openBadgesUrl,
      authToken: config.authToken,
      activtyId: config.activityId,
      // activityTime: config.activityTime,
      // userId: config.userId,
      firstName: config.firstName,
      lastName: config.lastName,
      text1: config.text1,
      text2: config.text2,
      // email: config.email,
      int1: config.int1,
      int2: config.int2,
      date1: config.date1
    };

    // Save the properties so they can be used later.
    PropertiesService.getUserProperties().setProperties(properties);
  },

  /**
   *  The onFormSubmit event function which runs when a form is submitted.
   */
  onFormSubmit: $event => {
    // Check whether authorization is required for this trigger event.
    const authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
    if (authInfo.getAuthorizationStatus() === ScriptApp.AuthorizationStatus.REQUIRED) {
      return app.onAuthorizationRequired(authInfo);
    }

    // Get the script properties which should have been configured.
    const properties = PropertiesService.getUserProperties().getProperties();

    // Stop processing if the properties needed to make a request are not set.
    const requiredProperties = ["apiUrl", "authToken", "apiKey"];
    if (!app.hasRequiredProperties(properties, requiredProperties)) {
      Logger.log("Request cancelled as required properties are missing.");
      return false;
    }

    // Get the original form and form response from the event.
    const { source: form, response } = $event;

    // Build the request header.
    const headers = {
      Authorization: `Bearer ${properties.authToken}`,
      ApiKey: properties.apiKey
    };

    // Build the request payload.
    const payload = {
      activityId: properties.activityId,
      activityTime: response.getTimestamp().toUTCString(),
      // userId: properties.userId,
      text1: properties.text1,
      text2: form.shortenFormUrl(form.getPublishedUrl()),
      // firstName: properties.firstName,
      // lastName: properties.lastName,
      email: response.getRespondentEmail(),
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

    // Make the request and get the response.
    const apiResult = UrlFetchApp.fetch(properties.apiUrl, options);

    return apiResult;
  },

  /**
   * Check whether the user has been recently sent a reauthorization email
   * and send a new email if required containing the reauthorization link.
   */
  onAuthorizationRequired: authInfo => {
    if (MailApp.getRemainingDailyQuota() === 0) {
      return Logger.log("Daily email quota has been reached.");
    }

    const properties = PropertiesService.getUserProperties();
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
  },

  /**
   * The showConfigurationModal user interface.
   */
  showConfigurationModal: () => {
    // Create the app template from the HTML template.
    const template = HtmlService.createTemplate(templates.configurationModal);

    // Add the bound properties to the template.
    const boundTemplate = app.bindPropertiesToTemplate(template);

    // Evaluate the template to HTML so bindings are rendered.
    const html = boundTemplate
      .evaluate()
      .setHeight(650)
      .setWidth(450);

    // Create the modalDialog from the HTML.
    FormApp.getUi().showSidebar(html);
  }
};

/* eslint-disable no-unused-vars */
// Assign the container functions to global variables so GAS can access them.
const {
  onOpen,
  onInstall,
  onSaveConfiguration,
  onFormSubmit,
  onAuthorizationRequired,
  showConfigurationModal,
  bindPropertiesToTemplate,
  hasRequiredProperties
} = app;
/* eslint-enable no-unused-vars */

// Exports are only for testing purposes, these are removed during the build process.
export { app, templates };
