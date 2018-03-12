/**
 * Interface for the user's properties.
 * @interface UserProperties
 */
interface FormsUserProperties {
  [key: string]: string;
  apiKey: string;
  apiUrl: string;
  apiToken: string;
  activityId: string;
  text1: string;
  int1: string;
  int2: string;
  date1: string;
}

interface SheetsUserProperties extends FormsUserProperties {
  timestamp: string;
}
