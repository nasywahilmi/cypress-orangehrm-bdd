import "cypress-mochawesome-reporter/register";

// OrangeHRM demo site fires several background XHR calls after page load
// (dashboard widgets, buzz feed, etc). On the public demo server these
// occasionally fail with "Network Error" (AxiosError) due to server-side
// instability, completely unrelated to the flow being tested. By default
// Cypress fails the current test on ANY uncaught exception from the app,
// so we ignore this specific, known-harmless error and let the test continue.
Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("Network Error") || err.name === "AxiosError") {
    // returning false prevents Cypress from failing the test
    return false;
  }
  // let any other unexpected error fail the test as normal
  return true;
});

// Automatically capture a screenshot when a test fails
Cypress.on("fail", (error, runnable) => {
  const testTitle = runnable.title.replace(/\s+/g, "_");
  cy.screenshot(`FAILED_${testTitle}`, { capture: "runner" });
  throw error;
});
