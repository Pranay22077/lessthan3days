# Switch agent profiles

Copy each profile's **Description** and **Agent instructions** into a separately registered agent in Switch Console. These Markdown files are configuration source, not agents by themselves. All four may use the same provider and model with separate sessions.

Recommended registered names: `relay-planner`, `relay-builder`, `relay-reviewer`, `relay-steward`. Create the Planner and Builder first, then Reviewer, then Steward. The roles are stable names; do not change provider/model merely to give an agent a different job.

Use `Who can talk to your agent: Custom rules` for the named teammates and the agents that need to hand work to it. `Anyone` is easier for a private test room, but lets every room member invoke it. For OpenCode, turn Auto mode **off** if tool approval is intended; leave Bypass permissions **off**. Inspect the effective permissions for every provider.

Builder directory: the working clone of this repository. Reviewer directory: a separate checkout fixed to the candidate commit. Planner directory: a read-only copy if possible. Steward directory: a separate Git checkout; give it GitHub credentials only when publication is being tested. Prompts alone do not isolate credentials when agents share one operating-system account.
