/**
 * Interface for Settings Template.
 * @interface SettingsTemplate
 * @extends {GoogleAppsScript.HTML.HtmlTemplate}
 */
interface IFormsSettingsTemplate extends GoogleAppsScript.HTML.HtmlTemplate {
  [key: string]: string | any;
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
 * Interface for Settings Template.
 * @interface SheetsSettingsTemplate
 * @extends {FormsSettingsTemplate}
 */
interface ISheetsSettingsTemplate extends GoogleAppsScript.HTML.HtmlTemplate {
  [key: string]: string | any;
  apiKey: string;
  apiUrl: string;
  apiToken: string;
  activityId: string;
  text1: string;
  int1: string;
  int2: string;
  date1: string;
  activityTime: string;
  userId: string;
  firstName: string;
  lastName: string;
}

/**
 * Interface for Auth Template.
 * @interface AuthTemplate
 * @extends {GoogleAppsScript.HTML.HtmlTemplate}
 */
interface IAuthTemplate extends GoogleAppsScript.HTML.HtmlTemplate {
  authUrl: string;
}
