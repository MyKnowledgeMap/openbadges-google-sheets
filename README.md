# Google Apps Script - OpenBadges.me

Google Apps Script for OpenBadges.me containing Google Forms and Google Sheets add-ons.

**Google Forms add-on** - Create activity events when a form is completed and automatically issue badges to the user who created the response.

**Google Sheets add-on** - Create activity events in bulk and manually trigger the processing of the events. Could be configured to automatically issue badges to many users.

## How to install

Install the Google Forms add-on on the Google Marketplace.

[forms marketplace link](https://google.com)

Install the Google Sheets add-on on the Google Marketplace.

[sheets marketplace link](https://google.com)

## How to develop

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

### Google App Script limitations

The limitations of Google Apps Script are easily seen when trying to run the Forms add-on which requires access to the `OnFormSubmit` trigger. This trigger requires full authorization permissions which can only be obtained by installing the add-on from the Google Marketplace. **You will have to install the Myknowledgemap version of the Forms add-on from the marketplace or deploy your own to the marketplace (unlisted/private/public).**

The sheets add-on is a lot easier to work with as it does not rely on automatic triggers as the user can run the script when needed.

Due to [quota limits][1] on Google Apps Script this add-on uses the [SendGrid API][2] however it can be easily modified to any email service or use the default Google MailApp.

[1]: https://developers.google.com/apps-script/guides/services/quotas
[2]: https://sendgrid.com/docs/API_Reference/Web_API_v3/Mail/index.html