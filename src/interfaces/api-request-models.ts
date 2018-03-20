/**
 * API model for POST /api/activityevents and /api/activityevents/bulk
 * @interface ICreateActivityEvent
 */
interface ICreateActivityEvent {
  [key: string]: string | any;
  activityId: string;
  activityTime: string;
  text1: string;
  text2: string;
  email: string;
  userId: string;
  firstName: string;
  lastName: string;
  int1: string;
  int2: string;
  date1: string;
  verified: string;
  issued: string;
  rowIndex: number;
}
