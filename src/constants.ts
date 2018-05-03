// The menu used by the add-on.
export const MENU: ReadonlyArray<{ name: string; functionName: string }> = [
  { name: "Settings", functionName: "showSettingsSidebar" },
  { name: "Run", functionName: "onRun" }
];

// The default properties.
export const DEFAULT_PROPS: DocumentProperties = {
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
};
