# OpenBadges.me Google Apps Script

[![CircleCI](https://circleci.com/gh/MyKnowledgeMap/openbadges-google-sheets.svg?style=svg)](https://circleci.com/gh/MyKnowledgeMap/openbadges-google-sheets) 
[![Coverage Status](https://coveralls.io/repos/github/MyKnowledgeMap/openbadges-google-sheets/badge.svg?branch=master)](https://coveralls.io/github/MyKnowledgeMap/openbadges-google-sheets?branch=master)

Google Apps Scripts for OpenBadges.me containing add-on for Google Sheets.

<!-- @import "[TOC]" {cmd="toc" depthFrom=2 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

* [Summary](#summary)
	* [Forms add-on](#forms-add-on)
	* [Sheets add-on](#sheets-add-on)
* [How to install](#how-to-install)
* [Build your own](#build-your-own)
* [Google Apps Script limitations](#google-apps-script-limitations)
	* [Triggers](#triggers)
	* [Modern Javascript and Typescript](#modern-javascript-and-typescript)
	* [Quotas](#quotas)

<!-- /code_chunk_output -->

## Summary

These add-ons can be used to create *activity events* which are simply records that something has happened. Using OpenBadges.me you can setup rules and automatically issue badges to your users when rule conditions have been met by the activity events.

### Forms add-on

This add-on allows you to create an activity event when a form has been completed.

[View on GitHub](https://github.com/MyKnowledgeMap/openbadges-google-forms)

### Sheets add-on

This add-on allows you to create many activity events and is manually triggered and processed. The add-on can use tracking columns which requires rows to be verified before they are processed. 

[View on GitHub](https://github.com/MyKnowledgeMap/openbadges-google-sheets)

## How to install

[Install the Forms add-on on the Google Marketplace](https://google.com)

[Install the Sheets add-on on the Google Marketplace](https://google.com)

## Build your own

1. Clone this repository.
2. Run `npm install` to install the dependencies for the add-ons.
3. Create a `.env` file in the same folder as the `.env.exampe` file with the following keys:

    | Key | Description |
    |--|--|
    | SENDGRID_URL | The URL for SendGrid's mail send API. |
    | SENDGRID_KEY | Your private SendGrid API key. |
    | ERROR_EMAIL | The email address which error emails should be sent from. |

4. Run `npm run build` to transpile and bundle the add-ons.
5. Copy the code from `forms.js` or `sheets.js` from `dist` to Google Apps Scripts.

## Google Apps Script limitations

Google Apps Script has some limitations which you should be aware of if you're planning on developing or contributing.

### Triggers

If an add-on requires access to the `OnFormSubmit` event trigger, the add-on will require full authorization permissions which can only be obtained by installing the add-on from the Google Marketplace and following the authorization workflow. 

This limitation can be seen in the Forms add-on which means you will have to install the MyKnowledgeMap version from the marketplace or deploy your own to the marketplace to test and use this trigger.

If the add-on does not require access to triggers (or it will be manually triggered by the user) you should find that it is easier to develop and test. An example of this can be seen in the Sheets add-on which uses a manual trigger to start the processing.

### Modern Javascript and Typescript

> Based on JavaScript 1.6 with some portions of 1.7 and 1.8 and provides subset of ECMAScript 5 API.
> -- [*Google Apps Script on Wikipedia*](https://en.wikipedia.org/wiki/Google_Apps_Script)

Google Apps Script does not natively support ES6+ or Typescript. You can transpile Typescript or ES6+ to ES5 which should run provided that you are targeting the correct ECMAScript version when transpiling, some features will not still not work however.

These add-ons are written in Typescript and transpiled to ES5 using Babel with the help of a few plugins to support running in the GAS environment.

- babel-plugin-transform-object-assign (adds polyfill for Object.assign)
- babel-plugin-transform-remove-export (removes export statements).
- babel-plugin-transform-html-import-to-string (html imports become inline strings).
- babel-plugin-transform-inline-environment-variables (env variables are replaced with build-time values).

### Quotas

Google Apps Script has limits on the usage of various Google services and APIs. These can be seen on the [quota limits](https://developers.google.com/apps-script/guides/services/quotas) page. 

The Forms add-on uses a work-around the quota limit for sending emails using the default Google MailApp and instead sends emails using the  [SendGrid API](https://sendgrid.com/docs/API_Reference/Web_API_v3/Mail/index.html), this can easily be modified to use any other mail service or use the default Google MailApp.
