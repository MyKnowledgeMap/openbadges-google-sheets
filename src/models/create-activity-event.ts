/**
 * The DTO which the API will accept for creating an activity event.
 * @export
 * @class CreateActivityEvent
 */
export class CreateActivityEvent {
  [key: string]: any;
  public activityId: string;
  public activityTime: string;
  public text1: string;
  public text2: string;
  public email: string;
  public userId: string;
  public firstName: string;
  public lastName: string;
  public int1: string;
  public int2: string;
  public date1: string;
  public verified: string;
  public issued: string;
  public rowIndex: number;
  constructor(init?: Partial<CreateActivityEvent>) {
    Object.assign(this, init);
  }
}
