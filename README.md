# Google App Script - OpenBadges

Google App Script for OpenBadges.me containing Google Forms and Google Sheets add-ons.

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
5. Copy `forms.js` or `sheets.js` from `dist` to Google App Scripts.