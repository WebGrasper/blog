const ErrorHandler = require('../../utils/errorHandler');

describe('ErrorHandler', () => {
  it('should create an error with statusCode and message', () => {
    const error = new ErrorHandler(404, 'Not Found');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Not Found');
    expect(error).toBeInstanceOf(Error);
  });
});
