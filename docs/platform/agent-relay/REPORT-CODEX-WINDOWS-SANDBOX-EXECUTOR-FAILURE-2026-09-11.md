# REPORT — Codex Windows Sandbox / Executor Failure

Date: 2026-09-11 (Asia/Bangkok)
Status: OPEN / REMEDIATION REQUIRED
Owner: WSTERA
Classification: Agent Relay / External Executor Infrastructure
Affected executor: Codex on Windows
Not classified as: SB01 defect, QA verdict, product defect

## Workflow Selection

- Workflow ID: `WF-DEV-01`
- Workflow Spec Version: `1.1.0`
- Reason: bounded runtime/executor remediation report
- Runtime Procedure: N/A for this report; remediation must re-pin the actual Relay/executor runtime procedure before execution if Relay is used
- Entry Conditions: `PASS` for defect reporting only

## Incident Summary

During SB01 Phase 2B Independent QA preparation, Codex passed authentication/connectivity preflight but could not execute even the most basic command inside its Windows sandbox.

Observed failure:

`CreateProcessAsUserW failed: 5 (Access is denied.)`

A minimal command such as `Get-Location` also failed. The run was terminated without producing a QA verdict. The sandbox was not bypassed.

## Confirmed Facts

1. Codex authentication/connectivity preflight passed.
2. The failure occurred when the Windows sandbox attempted to create a process.
3. The failure reproduced on a trivial command (`Get-Location`), so it is not specific to SB01 source code, repository contents, build tooling, database access, or Stripe/provider integration.
4. No valid Independent QA verdict was produced from the failed Codex run.
5. The failed run must be treated as an executor/sandbox infrastructure failure only.
6. SB01 Phase 2C remained HOLD; no LAB mutation, provider call, Product/Profile mutation, or payment action was authorized by this failure.
7. The run was rerouted to Claude Independent QA rather than bypassing the Codex sandbox.

## What Is NOT Yet Proven

The exact Windows root cause is not yet established.

Do not claim any of the following without diagnostic evidence:

- Windows Defender is the cause
- UAC is the cause
- a specific service account is the cause
- Codex authentication is broken
- repository permissions are the cause
- SB01 code is the cause

The error is consistent with a Windows process-creation permission/token/session problem, but that is a diagnostic hypothesis, not a confirmed root cause.

## Primary Technical Failure Boundary

The failing boundary is:

Codex executor -> Windows sandbox -> process creation (`CreateProcessAsUserW`) -> ACCESS_DENIED

The investigation should therefore start at executor identity/token/session/sandbox process-launch behavior before examining product code.

## Required Investigation

The remediation owner should capture evidence for at least the following:

1. Exact Codex executor version/build and invocation path.
2. Windows account/session under which the executor and sandbox are running.
3. Token/integrity level and whether the sandbox uses a different user/token from the parent executor.
4. Whether `CreateProcessAsUserW` is called with a valid primary token and required Windows privileges.
5. User rights / local security policy relevant to process creation and logon-as-batch/service behavior, if applicable.
6. ACL/access to the working directory, executable, shell, temp directory, user profile, and required runtime directories.
7. Windows Defender / EDR / AppLocker / WDAC / controlled-folder-access events around the failure timestamp.
8. Parent/child process/session relationship, including non-interactive or service-session constraints.
9. Whether the same minimal command succeeds outside the sandbox under the same executor identity.
10. Whether the same sandbox launch succeeds on another Windows host with the same Codex version/configuration.

## Preflight Gap Identified

The current preflight was insufficient because auth/connectivity could pass while the executor remained unable to launch any sandbox process.

Remediation should add a **sandbox execution readiness probe** before substantive work is dispatched.

Minimum readiness probe should verify:

- auth/connectivity
- executor version
- sandbox initialization
- successful launch of a trivial read-only command inside the sandbox
- non-zero/failing process-launch result blocks execution

A valid probe can be equivalent to `Get-Location`, `pwd`, or another harmless command that proves process creation inside the actual sandbox context, not merely from the parent shell.

## Safety / Boundary Requirements

- Do not bypass or disable the sandbox merely to obtain a verdict.
- Do not weaken Windows security policy globally as a first-line workaround.
- Do not grant broad Administrator/system privileges without a documented necessity and bounded change.
- Do not alter SB01 product/runtime code to compensate for this executor failure.
- Do not classify a failed executor run as PASS/FAIL for the product under review.
- Preserve fail-closed behavior: if sandbox readiness cannot be proven, executor readiness = FAIL/HOLD.

## Acceptance Criteria for Remediation

Remediation is considered successful only when all of the following are demonstrated:

1. Codex auth/connectivity preflight PASS.
2. Codex Windows sandbox initializes successfully.
3. A trivial read-only command executes successfully inside the sandbox.
4. A detached/read-only verification worktree can be accessed at an explicitly pinned revision.
5. Codex can perform a bounded read-only verification without `CreateProcessAsUserW` access-denied errors.
6. No sandbox bypass is required.
7. Preflight is updated so this failure mode is detected before a substantive task is dispatched.
8. Evidence is persisted with exact versions/configuration tested and before/after results.
9. Windows remediation does not break Claude, AGY, Qwen, Hermes/Relay, or other executor paths.
10. Equivalent readiness behavior is checked on macOS where relevant, while keeping OS-specific implementation separate.

## Required Return Contract From Fixer

Return:

- exact root cause supported by evidence
- files/configuration changed
- exact before/after executor versions and environment
- commands/tests executed and results
- Windows security/policy changes, if any
- regression results for other agents/executors
- sandbox readiness preflight change
- remaining risks/limitations
- exact commit SHA(s)
- branch/worktree and remote parity
- final verdict: `CODEX WINDOWS EXECUTOR READY` or `REMEDIATE`

## Current Operational Decision

Until remediation passes the acceptance criteria above:

`CODEX WINDOWS SANDBOX EXECUTOR = NOT READY FOR INDEPENDENT QA ON THIS HOST`

This status does not block SB01 itself. A separate authorized verifier may be used according to the selected workflow and Independent-QA policy.
