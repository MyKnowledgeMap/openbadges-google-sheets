// Events
import * as Events from "./events";
global.onInstall = Events.onInstall;
global.onOpen = Events.onOpen;
global.onFormSubmit = Events.onFormSubmit;
global.onSaveConfiguration = Events.onSaveConfiguration;

//  UI
import * as UserInterfaces from "./user-interfaces";
global.showConfigurationModal = UserInterfaces.showConfigurationModal;
