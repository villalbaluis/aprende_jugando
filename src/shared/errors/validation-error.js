class ValidationError extends Error {
  constructor(issues) {
    super('validation_error');
    this.name = 'ValidationError';
    this.issues = issues;
  }
}

function fail(issues) {
  throw new ValidationError(issues);
}

module.exports = { ValidationError, fail };
