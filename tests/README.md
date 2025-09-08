# E2E Tests with Playwright

This directory contains end-to-end tests for the Employee Profile System using Playwright.

## Test Structure

### 1. Login Flow Tests (`login-flow.spec.ts`)
Tests the authentication system with different user roles:
- Manager login and access
- Employee login and access  
- HR login and access
- Co-worker login and access
- Loading state verification

### 2. Profile Management Tests (`profile-management.spec.ts`)
Tests the profile editing functionality:
- Opening profile edit modal
- Updating profile information
- Canceling edits without saving
- Form validation

### 3. Absence Request Tests (`absence-request.spec.ts`)
Tests the absence management system:
- Creating new absence requests
- Viewing absence statistics
- Managing pending requests
- Form validation
- Manager approval workflow

## Running Tests

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Debug tests
npm run test:debug

# Run specific test file
npx playwright test login-flow.spec.ts
```

## Test Methodology

All tests follow the **AAA (Arrange, Act, Assert)** pattern:

- **Arrange**: Set up the test environment and navigate to the required page
- **Act**: Perform the user actions being tested
- **Assert**: Verify the expected outcomes and behavior

## Prerequisites

- Node.js and npm installed
- Playwright browsers installed (`npx playwright install`)
- Development server running (`npm run dev`)

## Configuration

Tests are configured in `playwright.config.ts` to:
- Run against `http://localhost:5173`
- Test on Chrome, Firefox, and Safari
- Automatically start the dev server before tests
- Generate HTML reports
