const { log } = require('./logger');

async function main() {
  console.log('Running Logging Middleware Assessment');

  // Example 1: Error in a backend handler
  await log(
    'backend',
    'error',
    'handler',
    'received string, expected bool'
  );

  // Example 2: Fatal error in a backend database layer
  await log(
    'backend',
    'fatal',
    'db',
    'critical database connection failure.'
  );

  // Example 3: Debug message in a frontend component
  await log(
    'frontend',
    'debug',
    'component',
    'Checking component state.'
  );

  // Example 4: Using a package common to both (e.g., middleware)
  await log(
    'backend',
    'info',
    'middleware',
    'Request processed by logging middleware.'
  );

  // Example 5: This should fail due to invalid package for the stack
  console.log('\n Demonstrating a validation failure');
  await log(
    'frontend',
    'error',
    'db',
    'This should fail because "db" is a backend package.'
  );
}

main();