/**
 * Sends standard JSON success response matching ReLoop API Specification (Section 19).
 */
export const sendSuccess = (res, data = null, statusCode = 200, message = null) => {
  const payload = {
    success: true,
  };

  if (message) {
    payload.message = message;
  }

  if (data !== null && data !== undefined) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
};

/**
 * Sends standard JSON error response matching ReLoop API Specification (Section 19).
 */
export const sendError = (res, errorPayload, statusCode = 500) => {
  const { code = 'INTERNAL_SERVER_ERROR', message = 'An unexpected error occurred.', details = null } = errorPayload;

  const payload = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details) {
    payload.error.details = details;
  }

  return res.status(statusCode).json(payload);
};

