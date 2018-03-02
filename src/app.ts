/**
 * Interface for the user's properties.
 * @interface IUserProperties
 */
interface IUserProperties {
  apiKey: string;
  apiUrl: string;
  apiToken: string;
  activityId: string;
  text1: string;
  int1: string;
  int2: string;
  date1: string;
}

/**
 * Interface for Auth Template.
 * @interface IAuthTemplate
 * @extends {GoogleAppsScript.HTML.HtmlTemplate}
 */
interface IAuthTemplate extends GoogleAppsScript.HTML.HtmlTemplate {
  authUrl: string;
}

/**
 * Interface for Settings Template.
 * @interface ISettingsTemplate
 * @extends {GoogleAppsScript.HTML.HtmlTemplate}
 */
interface ISettingsTemplate extends GoogleAppsScript.HTML.HtmlTemplate {
  apiKey: string;
  apiUrl: string;
  apiToken: string;
  activityId: string;
  text1: string;
  int1: string;
  int2: string;
  date1: string;
}

/**
 * Interface for FormSubmitEvent since it doesn't appear to be included in @types/google-app-script.
 * https://developers.google.com/apps-script/guides/triggers/events
 * @interface IFormSubmitEvent
 */
interface IFormSubmitEvent {
  source: GoogleAppsScript.Forms.Form;
  response: GoogleAppsScript.Forms.FormResponse;
  authMode: GoogleAppsScript.Script.AuthMode;
  triggerUid: number;
}

/**
 * The onOpen event function which runs when the document/form is opened.
 */
const onOpen = (): void => {
  // Check whether the user has full auth, otherwise make them authorize.
  const authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  if (
    authInfo.getAuthorizationStatus() === ScriptApp.AuthorizationStatus.REQUIRED
  ) {
    FormApp.getUi()
      .createAddonMenu()
      .addItem("Authorize", "showAuthModal")
      .addToUi();
  } else {
    FormApp.getUi()
      .createAddonMenu()
      .addItem("Settings", "showSettingsSidebar")
      .addToUi();
  }
};

/**
 * The onInstall event function which runs when the app script is installed.
 */
const onInstall = (): void => {
  onOpen();
};

/**
 * The onSaveconfig event function which runs when the user has
 * saved their OpenBadges config within the google app.
 * @param {any} config
 */
const onSaveConfiguration = (props: IUserProperties): void => {
  // TODO: Validate the provided config, throw errors if validation fails.

  // Save the properties so they can be used later.
  PropertiesService.getDocumentProperties().setProperties(props);

  // See if we have to create a trigger.
  const authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  if (
    authInfo.getAuthorizationStatus() !== ScriptApp.AuthorizationStatus.REQUIRED
  ) {
    // Trigger for the onFormSubmit event.
    const triggers = ScriptApp.getProjectTriggers();
    Logger.log(`Amount of triggers ${triggers.length}`);

    // Check if there is an existing onFormSubmit trigger.
    const triggerExists = triggers.some(
      (trigger) => trigger.getHandlerFunction() === "onFormSubmit"
    );

    // Create the trigger if it does not exist.
    if (!triggerExists) {
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
const onAuthorizationRequired = (
  authInfo: GoogleAppsScript.Script.AuthorizationInfo
): void => {
  if (MailApp.getRemainingDailyQuota() === 0) {
    Logger.log("Daily email quota has been reached.");
    return;
  }

  const properties = PropertiesService.getDocumentProperties();
  const lastAuthEmailDate = properties.getProperty("lastAuthEmailDate");
  const todayDate = new Date().toDateString();

  // Check whether the user has already received an email for reauth today.
  if (lastAuthEmailDate === todayDate) {
    return;
  }

  // Get the template for the reauthorization email.
  const template = HtmlService.createTemplate("auth.email") as IAuthTemplate;
  template.authUrl = authInfo.getAuthorizationUrl();
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
};

/**
 *  The onFormSubmit event function which runs when a form is submitted.
 */
const onFormSubmit = (e: IFormSubmitEvent): void => {
  // Check whether authorization is required for this trigger event.
  const authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  if (
    authInfo.getAuthorizationStatus() === ScriptApp.AuthorizationStatus.REQUIRED
  ) {
    return onAuthorizationRequired(authInfo);
  }

  // Get the script properties which should have been configured.
  const props = PropertiesService.getDocumentProperties().getProperties() as IUserProperties;

  // Stop processing if the properties needed to make a request are not set.
  const requiredProperties = ["apiUrl", "apiToken", "apiKey"];
  const hasRequiredProperties = requiredProperties
    .map((key) => !!props[key])
    .every((result) => result);
  if (!hasRequiredProperties) {
    Logger.log("Request cancelled as required properties are missing.");
    return;
  }

  // Build the request header.
  const headers = {
    Authorization: `Bearer ${props.apiToken}`,
    ApiKey: props.apiKey
  };

  // Get the original form and form response from the event.
  const { source: form, response } = e;

  // Regex to check for $[dynamic properties] .
  const rgx = new RegExp(/\$\[.+\]/g);
  const hasDynamicProperties = Object.keys(props).some((key) =>
    rgx.test(props[key])
  );
  if (hasDynamicProperties) {
    const itemResponses = response.getItemResponses();
  }

  // Build the request payload.
  const payload = {
    activityId: props.activityId,
    activityTime: response.getTimestamp().toUTCString(),
    text1: props.text1,
    text2: form.shortenFormUrl(form.getPublishedUrl()),
    email: response.getRespondentEmail(),
    userId: response.getRespondentEmail(),
    int1: props.int1,
    int2: props.int2,
    date1: props.date1
  };

  // Use the request headers and payload to create the request params.
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    contentType: "application/json",
    headers,
    payload: JSON.stringify(payload)
  };

  Logger.log(JSON.stringify(options));

  // Make the request and get the response.
  const apiResult = UrlFetchApp.fetch(props.apiUrl, options);

  // TODO: Error handling
};

/**
 * The showConfigurationModal user interface.
 */
const showSettingsSidebar = (): void => {
  // Create the app template from the HTML template.
  const template = HtmlService.createTemplateFromFile(
    "settings.sidebar"
  ) as ISettingsTemplate;

  // Add the bound properties to the template.
  const props = PropertiesService.getDocumentProperties().getProperties() as IUserProperties;
  template.apiKey = props.apiKey || "";
  template.apiToken = props.apiToken || "";
  template.apiUrl = props.apiUrl || "";
  template.activityId = props.activityId || "";
  template.text1 = props.text1 || "";
  template.int1 = props.int1 || "";
  template.int2 = props.int2 || "";
  template.date1 = props.date1 || "";

  // Evaluate the template to HTML so bindings are rendered.
  const html = template.evaluate().setTitle("Settings");

  // Create the sidebar from the HTML.
  FormApp.getUi().showSidebar(html);
};

/**
 * The showAuthModal user interface.
 */
const showAuthModal = (): void => {
  // Create the template.
  const template = HtmlService.createTemplateFromFile(
    "auth.modal"
  ) as IAuthTemplate;

  // Add the auth URL to the template.
  const authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  template.authUrl = authInfo.getAuthorizationUrl();

  // Evaluate the template to HTML so bindings are rendered.
  const html = template.evaluate();

  // Create the modal from the HTML.
  FormApp.getUi().showModalDialog(html, "Authorization required");
};
