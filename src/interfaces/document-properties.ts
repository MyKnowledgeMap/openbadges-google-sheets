/**
 * Interface for the user's document properties.
 * @interface ISheetsDocumentProperties
 */
interface ISheetsDocumentProperties {
  [key: string]: string;
  apiKey: string;
  apiUrl: string;
  apiToken: string;
  activityId: string;
  text1: string;
  text2: string;
  int1: string;
  int2: string;
  date1: string;
  activityTime: string;
  userId: string;
  firstName: string;
  lastName: string;
  verified: string;
  issued: string;
}
