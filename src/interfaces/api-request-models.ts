/**
 * API model for POST /api/activityevents and /api/activityevents/bulk
 * @interface ICreateActivityEvent
 */
interface ICreateActivityEvent {
  [key: string]: string;
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
}
