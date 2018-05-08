export { onInstall } from "./on-install";
export { onRun } from "./on-run";
export { onOpen } from "./on-open";
export { onSaveConfiguration } from "./on-save-configuration";
export { showSettingsSidebar } from "./show-settings-sidebar";

export interface Global {
  showSettingsSidebar: () => void;
  onRun: () => void;
  onSaveConfiguration: (props: DocumentProperties) => void;
  onInstall: () => void;
  onOpen: () => void;
}
