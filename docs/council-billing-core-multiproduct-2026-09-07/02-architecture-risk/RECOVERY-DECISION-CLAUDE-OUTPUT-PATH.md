# Recovery Decision — Claude Expert Output Path

- Failed/blocked task: `t_f10d7915`
- Failure class: capability / output-path protection
- Observed reason: the agent write-protection layer treats a file named `CLAUDE.md` as a protected instruction file and refused persistence.
- Required raw file was never created.
- The blocked task's draft/log/conclusion MUST NOT be used as Council synthesis evidence.

## Recovery decision
Create one fresh replacement `agent-claude` expert task using the exact same frozen `COUNCIL-BRIEF.md` and canonical evidence contract, with no access to other expert answers or Council synthesis.

The sole operational change is the output filename:
`raw/CLAUDE-EXPERT.md`

No substantive scope, question, evidence set, expert role or output contract changes are authorized.

No retry of the blocked task and no alternate-agent substitution are authorized.
This recovery exists only to remove the protected-filename collision.