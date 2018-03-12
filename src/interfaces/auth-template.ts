/**
 * Interface for Auth Template.
 * @interface AuthTemplate
 * @extends {GoogleAppsScript.HTML.HtmlTemplate}
 */
interface AuthTemplate extends GoogleAppsScript.HTML.HtmlTemplate {
  authUrl: string;
}
