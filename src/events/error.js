const log = require('../../utils/modules/logger.js');

module.exports = async (client, error) => {
	log(
		`An error event was sent by Discord.js:
  Error message: ${error.message}
  Error: ${error}
  Error JSON: ${JSON.stringify(error)}`,
		'error',
		'red'
	);
};
