import {
  Global,
  onInstall,
  onOpen,
  onRun,
  onSaveConfiguration,
  showSettingsSidebar
} from "./globals";

// Assign the top-level functions to the global object which will create top-level functions in the compiled output.
declare const global: Global;
global.onOpen = onOpen;
global.onInstall = onInstall;
global.onSaveConfiguration = onSaveConfiguration;
global.onRun = onRun;
global.showSettingsSidebar = showSettingsSidebar;
