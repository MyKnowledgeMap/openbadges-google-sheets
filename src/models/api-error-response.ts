/**
 * The api error response model.
 * @interface ApiErrorResponse
 */
export interface ApiErrorResponse {
  message: string;
  errors?: ErrorDetail[];
}

/**
 * The error detail object.
 * @interface ErrorDetail
 */
export interface ErrorDetail {
  property: string;
  message: string;
}
