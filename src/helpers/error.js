module.exports = function _Error(message, http_code = 500) {
  Error.captureStackTrace(this);
  this.message = message;
  this.http_code = http_code;
};
