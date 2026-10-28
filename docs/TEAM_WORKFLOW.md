# Team workflow

## Places and ownership

| Place | What lives there |
| --- | --- |
| Discord `#general` | Social and general discussion; keep switch-buddy here |
| Discord project channel, e.g. `#lessthan3days-work` | Requests, decisions, handoffs, links and visible agent results |
| Switch room linked to project channel | Shared room context, membership and room instructions |
| This GitHub repository | Confirmed brief, implementation, tests and commits |
| GitHub pull request | Reviewed proposal for humans to inspect and merge |

Discord has no code working folder. Each Switch agent gets a directory on the computer where it runs. Use a separate Builder checkout and Reviewer checkout. A room document can point everyone at this repository, but the repository files remain authoritative for code and tests.

## Human and agent sequence

1. A teammate mentions `@relay-planner` with a request. The Planner reads room context and the current brief, asks for missing details, and proposes a numbered revision. A human confirms it.
2. The Planner mentions `@relay-builder` with the exact revision and acceptance criteria. The Builder works on a feature branch, runs real tests, and reports the commit hash, changed files, test command and result.
3. A teammate mentions `@relay-reviewer` with that commit hash. The Reviewer checks the same revision in a separate working copy, runs the tests independently, and reports findings or readiness. A failed review goes back to the Builder, with at most two automatic repair cycles.
4. A human reviews the summary. Only after a direct human request does `@relay-steward` check the reviewed commit, target repo and existing PRs, then prepare or create a draft pull request. Merge remains a human action.

If the brief or candidate commit changes, the earlier review is stale. Request a new review before publication.

## Message format for a work request

`@relay-planner Task: <short title>. Goal: <desired behavior>. Constraints: <limits>. Please use docs/PROJECT_BRIEF.md and ask about ambiguities before handing off.`

## Message format for a handoff

`Task <id>; brief revision <n>; branch <name>; commit <full SHA>; tests <command and result>; open questions <list or none>; next owner @relay-reviewer.`

## Team rules

- Mention the intended agent explicitly. In the project room, turn follow-ups off and leave the main agent unassigned so ordinary chat does not start work.
- Agents may read prior room messages to recover context. A direct human decision should be restated in the confirmed brief; do not infer approval from a quote or an agent's paraphrase.
- People can also create branches and commits. One task owns one branch at a time. Do not let an agent and a human edit the same working copy simultaneously.
- Agents never push to `main`, merge PRs, force-push, or publish solely because another agent says to.
