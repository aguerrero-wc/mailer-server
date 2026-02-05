# Quality Assurance & Testing Strategy

**Authors:** Software Architect & Lead NestJS Engineer
**Scope:** Secure Mailer Microservice

## 1. Philosophy: The Testing Pyramid
We adhere to a strict testing pyramid to ensure reliability without sacrificing development speed.
> "If it's not tested, it's broken."

1.  **Unit Tests (60%):** Fast. Isolated. Focus on Services and Logic.
2.  **Integration Tests (30%):** Focus on component interaction (Queue, DB, Template Engine).
3.  **E2E Tests (10%):** Black-box testing of the API endpoints.

---

## 2. Tools & Stack
-   **Runner:** [Jest](https://jestjs.io/) (NestJS default).
-   **HTTP Assertions:** [Supertest](https://github.com/visionmedia/supertest).
-   **Mocks:** Jest Mock Functions.
-   **Environment:** All tests run **inside the Docker container**.

---

## 3. Testing Strategies by Layer

### 3.1. Unit Testing (`.spec.ts`)
**Focus:** Individual methods within Services and Controllers.
**Rule:** External dependencies (Redis, SMTP2GO, Database) MUST be mocked.

*   **What to test:**
    *   **MailService:** Verify that `addJob` is called with the correct parameters when a request comes in.
    *   **TemplateEngine:** Verify that Handlebars renders variables correctly and escapes malicious HTML (XSS prevention).
    *   **Guards:** Verify that an invalid API Key throws a `403 Forbidden`.

*   **Mocking Example (Queues):**
    ```typescript
    // We do NOT connect to Redis in Unit Tests.
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: getQueueToken('mail_queue'),
          useValue: { add: jest.fn() }, // Mock BullMQ
        },
      ],
    }).compile();
    ```

### 3.2. Integration Testing
**Focus:** Interaction between modules.
**Rule:** Use a real (test) database and Redis instance, but **MOCK the SMTP transport**.

*   **Critical Scenario: The Queue Processor**
    *   We must test the `MailProcessor` (the Worker).
    *   **Action:** Simulate a job arriving in the queue.
    *   **Expectation:** The processor picks it up, renders the template, and calls `nodemailer.sendMail`.
    *   **Safety:** `nodemailer` must use `streamTransport` or a mock to prevent sending real emails to SMTP2GO during tests.

### 3.3. E2E Testing (`.e2e-spec.ts`)
**Focus:** The API Surface from the perspective of the Legacy System.
**Rule:** Full application bootstrap inside a test container.

*   **Scenarios:**
    1.  **Authorized:** POST `/api/v1/send` with valid Key -> Returns `201 Accepted` + `jobId`.
    2.  **Unauthorized:** POST with wrong Key -> Returns `403`.
    3.  **Validation:** POST with missing `template_id` -> Returns `400 Bad Request`.

---

## 4. Specific Rules for This Project

### 🛡️ Rule #1: NEVER Hit Real SMTP in Tests
We are paying for SMTP2GO and reputation matters.
-   **In Development/Test:** The `MailModule` must be configured to use `ethereal.email` or `JSON Transport` if `NODE_ENV === 'test'`.
-   **Verification:** Tests should assert that `transporter.sendMail` was called, not that the email arrived.

### 📄 Rule #2: Template Security
Every test run must verify that the template engine is sanitizing input.
-   *Input:* `{ name: "<script>alert('hack')</script>" }`
-   *Expected Render:* `&lt;script&gt;alert('hack')&lt;/script&gt;`

### 🐋 Rule #3: Docker Execution
As per `deploy-container.md`, tests execute inside the container.

**Run Unit & Integration Tests:**
```bash
docker compose --profile dev exec app-dev npm run test


### run E2E Tests:
docker compose --profile dev exec app-dev npm run test:e2e

### Run Test Coverage:
docker compose --profile dev exec app-dev npm run test:cov

### 5. CI/CD Gate
The build pipeline will fail if:
Tests fail.
Coverage is below 80%.
E2E tests detect a breaking change in the API Contract (JSON Schema).