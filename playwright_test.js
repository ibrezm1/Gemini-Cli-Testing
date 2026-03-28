const { chromium } = require('playwright');

(async () => {
  // Launch the browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try { 
    // Navigate to the target website 
    console.log('Navigating to https://automationintesting.online/...');
    await page.goto('https://automationintesting.online/');

    // Fill out the contact form using demo data
    console.log('Filling out the contact form...');
    await page.locator('input[data-testid="ContactName"]').fill('John Doe');
    await page.locator('input[data-testid="ContactEmail"]').fill('john.doe@example.com');
    await page.locator('input[data-testid="ContactPhone"]').fill('012345678901');
    await page.locator('input[data-testid="ContactSubject"]').fill('Testing Room Booking');
    await page.locator('textarea[data-testid="ContactDescription"]').fill('Hello, this is a test message from a demo user. Please ignore.');

    // Click the submit button
    console.log('Submitting the form...');
    await page.getByRole('button', { name: 'Submit' }).click();

    // Verify the submission
    const successMessage = page.locator('h2:has-text("Thanks for getting in touch")');
    await successMessage.waitFor();
    console.log('Message sent successfully!');
    
    // Take a screenshot of the confirmation
    await page.screenshot({ path: 'confirmation.png' });
    console.log('Screenshot saved as confirmation.png');

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    // Close the browser
    await browser.close();
    console.log('Browser closed.');
  }
})();
