/**
 * The onOpen event function which runs when the document/form is opened.
 */
function onOpen(): void {
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
}

/**
 * The onInstall event function which runs when the app script is installed.
 */
function onInstall(): void {
  onOpen();
}

/**
 * The onSaveconfig event function which runs when the user has
 * saved their OpenBadges config within the google app.
 * @param {IUserProperties} props
 */
function onSaveConfiguration(props: IUserProperties): void {
  // TODO: Validate the provided config, throw errors if validation fails.

  // Save the properties so they can be used later.
  PropertiesService.getDocumentProperties().setProperties(props);

  // See if we have to create a trigger.
  const authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  const authStatus = authInfo.getAuthorizationStatus();
  if (authStatus !== ScriptApp.AuthorizationStatus.REQUIRED) {
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
}

/**
 * Check whether the user has been recently sent a reauthorization email
 * and send a new email if required containing the reauthorization link.
 * @param {GoogleAppsScript.Script.AuthorizationInfo} authInfo
 * @returns {void}
 */
function onAuthorizationRequired(
  authInfo: GoogleAppsScript.Script.AuthorizationInfo
): void {
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
}

/**
 * The onFormSubmit event function which runs when a form is submitted.
 * @param {IFormSubmitEvent} e
 * @returns {void}
 */
function onFormSubmit(e: IFormSubmitEvent): void {
  // Check whether authorization is required for this trigger event.
  const authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  const authStatus = authInfo.getAuthorizationStatus();
  if (authStatus === ScriptApp.AuthorizationStatus.REQUIRED) {
    onAuthorizationRequired(authInfo);
    return;
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

  setDynamicProperties(e.response, props);
  sendToApi(e.source, e.response, props);
}

/**
 * Send the form response to the API
 * @param {GoogleAppsScript.Forms.Form} form
 * @param {GoogleAppsScript.Forms.FormResponse} response
 * @param {IUserProperties} props
 */
function sendToApi(
  form: GoogleAppsScript.Forms.Form,
  response: GoogleAppsScript.Forms.FormResponse,
  props: IUserProperties
): void {
  // Build the request header.
  const headers = {
    Authorization: `Bearer ${props.apiToken}`,
    ApiKey: props.apiKey
  };

  // Build the request payload.
  const payload = {
    activityId: props.activityId,
    activityTime: response.getTimestamp().toUTCString(),
    text1: props.text1,
    text2: form.getId(),
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

  // Make the request and get the response.
  const result = UrlFetchApp.fetch(props.apiUrl, options);

  // TODO: Error handling.
}

/**
 * Check for any dynamic properties for the user and fetch them from the response.
 * @param {GoogleAppsScript.Forms.FormResponse} formResponse
 * @param {IUserProperties} props
 */
function setDynamicProperties(
  formResponse: GoogleAppsScript.Forms.FormResponse,
  props: IUserProperties
) {
  // Regex to check for $[dynamic properties] .
  const rgx = new RegExp(/\$\[.+\]/);
  const hasDynamicProps = Object.keys(props).some((key) =>
    rgx.test(props[key])
  );

  if (hasDynamicProps) {
    // Load all responses so we can find matching ones.
    const itemResponses = formResponse.getItemResponses();
    const simpleResponses: ISimpleItemResponse[] = itemResponses.map((r) => ({
      title: r.getItem().getTitle(),
      response: r.getResponse()
    }));

    Object.keys(props).forEach((key) => {
      const prop = props[key].toLowerCase();
      if (rgx.test(prop)) {
        const responseToUse = simpleResponses.filter(
          (r) => prop.indexOf(r.title.toLowerCase()) !== -1
        )[0];
        if (responseToUse !== undefined) {
          props[key] = responseToUse.response;
        }
      }
    });
  }
}

/**
 * The showConfigurationModal user interface.
 */
function showSettingsSidebar(): void {
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
}

/**
 * The showAuthModal user interface.
 */
function showAuthModal(): void {
  // Create the template.
  const template = HtmlService.createTemplateFromFile(
    "auth.modal"
  ) as IAuthTemplate;

  // Add the auth URL to the template.
  const authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  template.authUrl = authInfo.getAuthorizationUrl();

  // Evaluate the template to HTML so bindings are rendered.
  const html = template
    .evaluate()
    .setHeight(200)
    .setWidth(300);

  // Create the modal from the HTML.
  FormApp.getUi().showModalDialog(html, "Authorization required");
}
