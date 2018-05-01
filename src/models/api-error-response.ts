/**
 * The api error response model.
 * @interface ApiErrorResponse
 */
export interface ApiErrorResponse {
  readonly message: string;
  readonly errors?: ReadonlyArray<ErrorDetail>;
}

/**
 * The error detail object.
 * @interface ErrorDetail
 */
export interface ErrorDetail {
  readonly property: string;
  readonly message: string;
}
