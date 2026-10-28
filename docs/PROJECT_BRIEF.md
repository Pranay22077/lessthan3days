# Project brief — revision 1

## Goal

Build a small Python library for event registration and a waitlist. This is the demonstration project for a human-plus-agent software workflow in Discord and Switch.

## Initial scope

- An event has a positive integer capacity.
- A participant has a nonempty, case-sensitive identifier; duplicate identifiers are rejected.
- The first `capacity` participants are confirmed; later participants enter a FIFO waitlist.
- A caller can inspect confirmed and waiting participants in order.
- Invalid operations do not change existing state.

Worked example: capacity 2; Ada and Ben are confirmed; Chen is waiting.

## Later change — do not implement in the first delivery

Cancellation will later remove a confirmed or waiting participant. If a confirmed participant leaves, the first waiting participant is promoted. Example: Ada cancels and Chen becomes confirmed. A person must confirm this as revision 2 before the Builder implements it.

## Acceptance for revision 1

The team can run an automated test suite that checks capacity validation, registration order, duplicate/empty identifiers, waitlist order, and no state change after invalid input. The Builder reports actual test results and a Git commit. The Reviewer independently checks that exact commit against this brief.

## Not yet decided

The public Python API (module and method names), packaging, and command-line interface are implementation choices for the Builder to propose. If a choice changes the user-visible behavior above, ask a human in Discord first.
