# Google Apps Script - OpenBadges

Google Apps Script for OpenBadges.me containing Google Forms and Google Sheets add-ons.

**Google Forms add-on** - Create activity events when a form is completed which could be configured to automatically issue badges to the user who created the response.

**Google Sheets add-on** - Create multiple activity events in bulk and manually trigger the processing of the events. Could be configured to automatically issue badges to many users.

## How to run

1. Clone this repository.
2. Run `npm install` to install the dependencies for the add-ons.
3. Create a `.env` file at the root level for this package with the following keys:

    | Key | Description |
    |--|--|
    | SENDGRID_URL | The URL for SendGrid's mail send API. |
    | SENDGRID_KEY | Your private SendGrid API key. |
    | ERROR_EMAIL | The email address which error emails should be sent from. |

4. Run `npm run build` to transpile and bundle the add-ons.
5. Copy `forms.js` or `sheets.js` from `dist` to Google Apps Scripts.

## Google App Script limitations

The limitations of Google Apps Script are easily seen when trying to run the Forms add-on as it requires access to the `OnFormSubmit` trigger. This trigger requires full authorization permissions which can only be obtained by installing the add-on from the Google Marketplace. **You will have to install the Myknowledgemap version of the Forms add-on or deploy your own to the marketplace (unlisted/private/public).**

The sheets add-on is a lot easier to work with as it does not rely on automatic triggers meaning the user can run the script when needed.

Due to [quota][1] limitations on Google App Scripts this add-on uses SendGrid API however it can be easily modified to any email service or use the default Google MailApp.

[1]: https://developers.google.com/apps-script/guides/services/quotas