/**
 * A dynamic property with key, value and the associated column index.
 * @export
 * @class DynamicProperty
 */
export class DynamicProperty {
  public columnIndex: number;
  public key: string;
  public value: string;
  constructor(init?: Partial<DynamicProperty>) {
    Object.assign(this, init);
  }
}
