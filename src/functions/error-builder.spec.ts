import { ApiErrorResponse, ErrorDetail } from "../models";
import { appendError, getPrettyError } from "./error-builder";

describe("getPrettyError", () => {
  const shortResponse: ApiErrorResponse = {
    message: "error"
  };
  const longResponse: ApiErrorResponse = {
    message: "error",
    errors: [
      {
        property: "property",
        message: "message"
      }
    ]
  };
  const short = getPrettyError(shortResponse);
  const long = getPrettyError(longResponse);

  it("should return errror message", () => {
    expect(typeof short).toBe("string");
    expect(typeof long).toBe("string");
  });

  it("should have more detailed message for detailed responses", () => {
    expect(long.length).toBeGreaterThan(short.length);
  });
});

describe("appendError", () => {
  // Arrange
  const input = "";
  const error: ErrorDetail = {
    message: "12345",
    property: "67890"
  };

  // Act
  const result = appendError(input, error);

  // Assert
  it("should not mutate message", () => {
    expect(result).not.toBe(input);
  });
  it("should return new message using error", () => {
    expect(result).toBe("Property: 67890\nReason: 12345\n\n");
  });
});
