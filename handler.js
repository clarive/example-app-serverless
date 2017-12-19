'use strict';

module.exports.endpoint = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: `Hello, the current time is ${new Date().toTimeString()}.`,
      deployment: "{{ ctx.job('name') }}",
      environment: "{{ ctx.job('environment') }}"
    }),
  };

  callback(null, response);
}
