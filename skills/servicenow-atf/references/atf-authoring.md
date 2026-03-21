# ATF Authoring Reference

## Mental model

ServiceNow ATF is record-native:

- `sys_atf_test`: a test record
- `sys_atf_step`: an ordered step inside a test
- step config record: the definition of how a step type behaves, including inputs, outputs, execution environment, and script logic
- test suites, schedules, test results, step results: orchestration and reporting records around the tests

Even when you author tests in source code with ServiceNow Fluent, the output still maps into this instance-native ATF model.

## Authoring modes

### Classic ATF inside the instance

Use this model when the user wants native ATF steps, suites, schedules, or custom step configuration guidance without a code-first SDK workflow.

### ServiceNow Fluent / code-first ATF

Use this model when the project already uses:

- `@servicenow/sdk`
- `now-sdk`
- `.now.ts` metadata files
- `src/fluent/` or equivalent Fluent source layout

Minimal Fluent shape:

```ts
import { Test } from '@servicenow/sdk/core'

export default Test(
    {
        $id: Now.ID['incident-create-and-validate'],
        name: 'Incident create and validate',
        description: 'Create an incident, validate it, then log the result',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.createUser({ $id: 'step1' })
        atf.server.impersonate({ $id: 'step2', user: 'some-user-sys-id-or-output' })
        atf.form.openNewForm({ $id: 'step3', table: 'incident', formUI: 'standard_ui', view: '' })
        atf.form.setFieldValue({
            $id: 'step4',
            table: 'incident',
            formUI: 'standard_ui',
            fieldValues: { short_description: 'Created by ATF' },
        })
        const submit = atf.form.submitForm({
            $id: 'step5',
            formUI: 'standard_ui',
            assert: 'form_submitted_to_server',
        })
        atf.server.recordValidation({
            $id: 'step6',
            table: 'incident',
            recordId: submit.record_id,
            assertType: 'record_validated',
            enforceSecurity: true,
            fieldValues: 'short_description=Created by ATF',
        })
    }
)
```

Live build rule from instance-backed runs:

- Every Fluent ATF step needs its own `$id`. A test-level `$id` is not enough.
- If a step is missing an ID, `now-sdk build` can fail with `Failed to determine ID for "sys_atf_step" record`.

The official Fluent docs call out these supported categories:

- application navigator
- email
- form
- forms in Service Portal
- reporting
- REST
- server
- service catalog
- service catalog in Service Portal

The same docs also note that some fields available on native ATF forms are not exposed as Fluent properties.

## Custom step configuration rules

Custom step configurations are supported only for server-side scripted behavior.

Use them when built-in steps are insufficient and the missing behavior can be expressed with server-side JavaScript. The official model is:

- define input variables on the step config
- define output variables on the step config
- implement the step execution script
- set pass/fail through `stepResult`

Execution script essentials:

- read inputs from `inputs.<name>`
- assign outputs to `outputs.<name>`
- mark pass/fail with `stepResult.setSuccess()` or `stepResult.setFailed()`
- log human-readable context with `stepResult.setOutputMessage(...)`

Do not propose browser-running custom step configs. The official docs reject that model.

## Execution model

- Server steps execute on the ServiceNow instance.
- UI steps require a browser execution environment.

Runner options from the Zurich docs:

- `Client Test Runner` for manual UI runs
- `Scheduled Client Test Runner` for scheduled UI runs
- `Headless Browser` as the legacy automated browser path

Important environment rule:

- The Headless Browser docs explicitly recommend newer runner options over legacy headless mode where available.
- The same docs explicitly say on-premise users must continue using Headless Browser.

Operational implication:

- A self-hosted AI agent can author and deploy tests from your servers.
- It still needs a reachable ServiceNow instance.
- Any UI step also needs a runner strategy attached to that instance.

Live runner rules from instance-backed runs:

- For browser-backed tests, confirm `sn_atf.runner.enabled=true` before debugging the test itself.
- The `Client Test Runner` page is not the authoritative status view. It can show `Waiting for a test to run` while the runner is simply idle after consuming a batch.
- Use `sys_atf_test_result` and `sys_atf_test_result_step` for the real state, timestamps, and failure messages.
- `atf_test_runner.do?sysparm_nostack=true` is the practical manual entry point for a connected runner session.

## Test design rules

Follow these rules by default:

- create the data you need during the test
- avoid existing records unless the purpose of the test is specifically to validate them
- avoid system tables and metadata tables unless unavoidable
- prefer created users over impersonating shared existing users
- design tests for parallel execution
- use output variables to pass record ids and other transient values between steps
- keep assertions specific and local to the behavior under test

ATF automatically tracks and rolls back data created by tests, but that does not remove the need for good isolation.

Live design rules from instance-backed runs:

- Start with a narrow server-only smoke test. Prove build, deploy, run, and result inspection before adding UI or ACL coverage.
- Do not assume default table ACL behavior. Even common ITSM tables can allow operations you expected to be denied.
- Negative permission tests should target an explicitly known restriction from the app or instance being tested.
- For form tests, inspect the actual form and view before writing the submit step. Required fields can differ from what the table shape alone suggests.
- If `Submit a Form` fails with `aborted before being sent to the server`, suspect client-side validation first.
- Create referenced records inside the test when possible. Standard forms can require reference fields or other dependencies before submit succeeds.

## Next Experience and UI limitations

Relevant official constraints:

- ATF still supports Core UI, including classic lists and forms.
- The official "Exploring Automated Test Framework" page says ATF does not support these Next Experience elements: pages built with UI Builder, including pages with lists and form components, and landing pages.
- Some specific ATF steps still have narrower workspace support. For example, the Custom UI "Assert Text on Page" step notes workspace support for new tests starting in Rome.

If the user asks for a workspace-heavy UI test, call out the limitation early instead of pretending full support exists.

## Test generation notes

ServiceNow documents a paid `Test generation` feature built on ATF.

Publicly documented constraints:

- it is part of Creator Pro Plus
- it is for Next Experience UI users
- it creates new ATF tests in the current application scope
- it cannot update or delete existing ATF tests
- it does not support:
  - Custom UI
  - Lists
  - Service Catalog in Service Portal
  - Forms in Service Portal
  - scripts and custom scripts

Use the public prompting guidance when you need to emulate this behavior:

- specify whether to create a user or impersonate a user
- name the exact table, module, or catalog item
- spell out field names and exact values
- describe the step order clearly
- include the expected validation
- avoid vague nouns like "record", "user", or "price" without table/field context

Do not claim that you know ServiceNow's internal system prompt or hidden skill definition. The public docs describe behavior and prompting principles, not the private implementation artifact.

## Official sources

- ATF landing: https://www.servicenow.com/docs/r/zurich/application-development/automated-test-framework-atf/atf-landing-page.html
- Exploring ATF: https://www.servicenow.com/docs/bundle/zurich-application-development/page/administer/auto-test-framework/concept/automated-test-framework.html
- ATF Fluent API: https://www.servicenow.com/docs/r/zurich/application-development/servicenow-sdk/atf-test-now-ts.html
- SDK examples: https://github.com/ServiceNow/sdk-examples/tree/main/test-atf-sample
- Headless Browser: https://www.servicenow.com/docs/r/zurich/application-development/automated-test-framework-atf/atf-headless-browser.html
- Client Test Runner: https://www.servicenow.com/docs/r/zurich/application-development/automated-test-framework-atf/atf-client-test-runner-module.html
- Scheduled Client Test Runner: https://www.servicenow.com/docs/r/zurich/application-development/automated-test-framework-atf/atf-sched-test-runner-module.html
- Custom step configs: https://www.servicenow.com/docs/r/zurich/application-development/automated-test-framework-atf/atf-custom-step-types.html
- Create custom step config: https://www.servicenow.com/docs/r/zurich/application-development/automated-test-framework-atf/atf-create-custom-step.html
- Step config record: https://www.servicenow.com/docs/r/zurich/application-development/automated-test-framework-atf/atf-step-config-record.html
- Step execution scripts: https://www.servicenow.com/docs/r/zurich/application-development/automated-test-framework-atf/atf-config-script.html
- ATF design considerations: https://www.servicenow.com/docs/r/zurich/application-development/automated-test-framework-atf/automated-test-framework-design-considerations.html
- ATF roles: https://www.servicenow.com/docs/r/zurich/application-development/automated-test-framework-atf/atf-roles.html
- Test generation: https://www.servicenow.com/docs/r/guL1zqmJkV9eywMq_6qu~w/eLXlDWtzIuPyPxbY_UoGyA
- Test generation design considerations: https://www.servicenow.com/docs/r/guL1zqmJkV9eywMq_6qu~w/bYnqMLve5KZLNErsq5t6Qw
- Test generation prompting guidance: https://www.servicenow.com/docs/r/guL1zqmJkV9eywMq_6qu~w/1ziA0nLFtPbW~UIVKO_oMA
