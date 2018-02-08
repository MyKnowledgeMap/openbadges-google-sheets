// Events
import { Events } from "./events";

const events = new Events();
global.onInstall = events.onInstall;
global.onOpen = events.onOpen;
global.onFormSubmit = events.onFormSubmit;
global.onSaveConfiguration = events.onSaveConfiguration;

//  UI
import { UserInterfaces } from "./user-interfaces";
const ui = new UserInterfaces();
global.showConfigurationModal = ui.showConfigurationModal;
