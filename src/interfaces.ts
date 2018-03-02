/**
 * Interface for the user's properties.
 * @interface IUserProperties
 */
interface IUserProperties {
  [key: string]: string;
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

interface ISimpleItemResponse {
  title: string;
  response: any;
}
