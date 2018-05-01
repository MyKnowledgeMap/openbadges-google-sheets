import { DocumentProperties } from "./models/document-properties";

// The menu used by the add-on.
export const MENU = [
  { name: "Settings", functionName: "showSettingsSidebar" },
  { name: "Run", functionName: "onRun" }
];

// The default properties.
export const DEFAULT_PROPS = {
  apiKey: "",
  apiUrl: "",
  apiToken: "",
  activityId: "",
  text1: "",
  text2: "",
  int1: "",
  int2: "",
  date1: "",
  activityTime: "",
  userId: "",
  firstName: "",
  lastName: "",
  verified: "",
  issued: ""
} as DocumentProperties;
