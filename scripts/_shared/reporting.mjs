export function createReporter(prefix = "") {
  const failures = [];

  function formatMessage(message) {
    return prefix ? `[${prefix}] ${message}` : message;
  }

  function pass(message) {
    console.log(`PASS: ${formatMessage(message)}`);
  }

  function fail(message) {
    const formatted = formatMessage(message);
    console.error(`FAIL: ${formatted}`);
    failures.push(formatted);
  }

  return {
    failures,
    pass,
    fail,
  };
}
