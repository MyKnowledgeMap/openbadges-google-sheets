import { EventService } from "./event.service";
import { UiService } from "./ui.service";
import { TemplateProvider } from "./template.provider";

const events = new EventService(
  FormApp,
  ScriptApp,
  UrlFetchApp,
  PropertiesService,
  Logger
);

const ui = new UiService(
  FormApp,
  HtmlService,
  new TemplateProvider(),
  PropertiesService,
  Logger
);

function bootstrap() {
  // Register the trigger events.
  global.onInstall = events.onInstall;
  global.onOpen = events.onOpen;
  global.onFormSubmit = events.onFormSubmit;
  global.onSaveConfiguration = events.onSaveConfiguration;

  // Register the user interfaces.
  global.showConfigurationModal = ui.showConfigurationModal;
}

// Start the app script.
bootstrap();