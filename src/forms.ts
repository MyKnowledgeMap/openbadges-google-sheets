import authEmailTemplate from "./templates/auth.email.html";
import authModalTemplate from "./templates/auth.modal.html";
import settingsSidebarTemplate from "./templates/forms-settings.sidebar.html";

/**
 * The onOpen event function which runs when the document/form is opened.
 */
function onOpen(): void {
  const menu = FormApp.getUi().createAddonMenu();
  // Check whether the user has full auth, otherwise make them authorize.
  const authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  const status = authInfo.getAuthorizationStatus();
  if (status === ScriptApp.AuthorizationStatus.REQUIRED) {
    menu.addItem("Authorize", "showAuthModal");
  } else {
    menu.addItem("Settings", "showSettingsSidebar");
  }
  menu.addToUi();
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
 * @param {FormsUserProperties} props
 */
function onSaveConfiguration(props: IFormsDocumentProperties): void {
  PropertiesService.getDocumentProperties().setProperties(props);
  createTriggerIfNotExist();
}

function createTriggerIfNotExist() {
  // See if we have to create a trigger.
  const authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  const authStatus = authInfo.getAuthorizationStatus();
  if (authStatus !== ScriptApp.AuthorizationStatus.REQUIRED) {
    // Trigger for the onFormSubmit event.
    const triggers = ScriptApp.getProjectTriggers();

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
  const properties = PropertiesService.getDocumentProperties();
  const lastAuthEmailDate = properties.getProperty("lastAuthEmailDate");
  const todayDate = new Date().toDateString();

  // Check whether the user has already received an email for reauth today.
  if (lastAuthEmailDate === todayDate) {
    return;
  }

  // Get the template for the reauthorization email.
  const template = HtmlService.createTemplate(
    authEmailTemplate
  ) as IAuthTemplate;
  template.authUrl = authInfo.getAuthorizationUrl();
  const html = template.evaluate();

  // Send the email with the reauthorization link.
  const recipient = Session.getEffectiveUser().getEmail();
  const subject = "OpenBadges - Authorization is required.";
  const body = html.getContent();
  sendEmail(recipient, subject, body, "text/html");

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
  const props = PropertiesService.getDocumentProperties().getProperties() as IFormsDocumentProperties;

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
 * @param {FormsUserProperties} props
 */
function sendToApi(
  form: GoogleAppsScript.Forms.Form,
  response: GoogleAppsScript.Forms.FormResponse,
  props: IFormsDocumentProperties
): void {
  // Build the request header.
  const headers = {
    Authorization: `Bearer ${props.apiToken}`,
    ApiKey: props.apiKey
  };

  // Build the request payload.
  const payload: ICreateActivityEvent = {
    activityId: props.activityId,
    activityTime: response.getTimestamp().toUTCString(),
    text1: props.text1,
    text2: form.getId(),
    email: response.getRespondentEmail(),
    userId: response.getRespondentEmail(),
    int1: props.int1,
    int2: props.int2,
    date1: props.date1,
    firstName: "",
    lastName: ""
  };

  // Use the request headers and payload to create the request params.
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    contentType: "application/json",
    headers,
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  for (let retry = 0; retry < 3; retry++) {
    // Make the request and get the response.
    const result = UrlFetchApp.fetch(props.apiUrl, options);

    // If the response code is 200 Ok then we can stop processing as it was a successful request.
    const responseCode = result.getResponseCode();
    if (responseCode === 200) {
      return;
    }

    if (retry === 2) {
      Logger.log("Request %s failed. Sending email to Form owner...", retry);
      const recipient = Session.getEffectiveUser().getEmail();
      const subject =
        "OpenBadges - An error occurred after form was submitted.";
      const body = result.getContentText();
      sendEmail(recipient, subject, body, "text/plain");
    } else {
      Logger.log("Request %s failed. Retrying...", retry);
      Utilities.sleep(500);
    }
  }
}

/**
 * Send an email using the SendGrid API.
 * https://sendgrid.com/docs/API_Reference/api_v3.html
 * @param {string} to the email address the email should be sent to.
 * @param {string} subject the subject of the email.
 * @param {string} body the body of the email.
 * @param {string} contentType the content type of the email body.
 */
function sendEmail(
  to: string,
  subject: string,
  body: string,
  contentType: string
): void {
  // Create the header with the api key.
  const headers = {
    Authorization: `Bearer ${process.env.SENDGRID_KEY!}`
  };

  // Create the request payload.
  const payload = {
    personalizations: [
      {
        to: [
          {
            email: to
          }
        ],
        subject
      }
    ],
    from: {
      email: process.env.ERROR_EMAIL!
    },
    content: [
      {
        type: contentType,
        value: body
      }
    ]
  };

  // Create the URL request options.
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    headers,
    contentType: "application/json",
    payload: JSON.stringify(payload)
  };

  // Make the request.
  const response = UrlFetchApp.fetch(process.env.SENDGRID_URL!, options);
}

/**
 * Check for any dynamic properties for the user and fetch them from the response.
 * @param {GoogleAppsScript.Forms.FormResponse} formResponse
 * @param {FormsUserProperties} props
 */
function setDynamicProperties(
  formResponse: GoogleAppsScript.Forms.FormResponse,
  props: IFormsDocumentProperties
) {
  // Regex to check for {{dynamic properties}}.
  const rgx = new RegExp(/{{.+}}/);
  const hasDynamicProps = Object.keys(props).some((x) => rgx.test(props[x]));

  if (hasDynamicProps) {
    // Load all responses so we can find matching ones.
    const responses: ISimpleItemResponse[] = formResponse
      .getItemResponses()
      .map((r) => ({
        title: r.getItem().getTitle(),
        response: r.getResponse()
      }));

    Object.keys(props)
      .map((key) => props[key].toLowerCase())
      .filter((prop) => rgx.test(prop))
      .forEach((prop) => {
        const responseToUse = responses.filter(
          (resp) => prop.indexOf(resp.title.toLowerCase()) !== -1
        )[0];
        if (responseToUse !== undefined) {
          prop = responseToUse.response;
        }
      });
  }
}

/**
 * The showConfigurationModal user interface.
 */
function showSettingsSidebar(): void {
  // Create the app template from the HTML template.
  const template = HtmlService.createTemplate(
    settingsSidebarTemplate
  ) as IFormsSettingsTemplate;

  // Add the bound properties to the template.
  const props = PropertiesService.getDocumentProperties().getProperties() as IFormsDocumentProperties;
  Object.keys(props)
    .map((key) => ({ key, value: props[key] }))
    .forEach((prop) => {
      template[prop.key] = prop.value || "";
    });

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
  const template = HtmlService.createTemplate(
    authModalTemplate
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

export {
  showAuthModal,
  showSettingsSidebar,
  setDynamicProperties,
  sendEmail,
  sendToApi,
  onFormSubmit,
  onAuthorizationRequired,
  onSaveConfiguration,
  onOpen,
  onInstall,
  createTriggerIfNotExist
};
