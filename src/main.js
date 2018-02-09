import { EventService } from "./event.service";
import { UiService } from "./ui.service";

const events = new EventService();
const ui = new UiService();

/**
 * Main entry for app script.
 */
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
