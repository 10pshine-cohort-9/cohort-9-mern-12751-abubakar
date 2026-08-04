const chai = require('chai');
const app = require('../app');

const { expect } = chai;

/**
 * Returns the global Express error handler for testing.
 */
function getErrorHandler() {
  const stack = app.router?.stack || app._router?.stack || [];
  const layer = stack.find((candidate) => candidate.handle && candidate.handle.length === 4);

  if (!layer) {
    throw new Error('Error middleware not found');
  }

  return layer.handle;
}

describe('Global error handler', () => {
  it('passes through errors when headers were already sent', () => {
    const handler = getErrorHandler();
    const error = new Error('stream already started');
    let forwardedError;

    handler(
      error,
      {},
      {
        headersSent: true,
        status() {
          throw new Error('status should not be called');
        },
        json() {
          throw new Error('json should not be called');
        },
      },
      (err) => {
        forwardedError = err;
      }
    );

    expect(forwardedError).to.equal(error);
  });

  it('preserves a usable status code from the error object', () => {
    const handler = getErrorHandler();
    let statusCode;
    let responseBody;

    handler(
      { message: 'not found', statusCode: 404 },
      {},
      {
        headersSent: false,
        status(code) {
          statusCode = code;
          return this;
        },
        json(body) {
          responseBody = body;
          return this;
        },
      },
      () => {
        throw new Error('next should not be called');
      }
    );

    expect(statusCode).to.equal(404);
    expect(responseBody).to.deep.equal({
      success: false,
      error: 'not found',
    });
  });

  it('falls back to 500 when the error has no usable status', () => {
    const handler = getErrorHandler();
    let statusCode;

    handler(
      { message: 'unexpected' },
      {},
      {
        headersSent: false,
        status(code) {
          statusCode = code;
          return this;
        },
        json() {
          return this;
        },
      },
      () => {
        throw new Error('next should not be called');
      }
    );

    expect(statusCode).to.equal(500);
  });
});
