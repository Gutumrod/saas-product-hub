# House Storage grant PGlite proof

From this directory run `npm ci --ignore-scripts` once, then set `STORAGE_PROOF_OUTPUT` to an absolute file path outside the checkout and execute `node proof.mjs`.

```powershell
$env:STORAGE_PROOF_OUTPUT = 'D:\AI-Workspace\runtime\relay\house-20260928\live-window-last-mile\house\storage-proof.json'
node proof.mjs
```

The example is a local evidence path and contains no credential. The proof runs only against embedded PGlite with a synthetic Storage/Postgres schema; it does not connect to LAB or hosted Supabase and does not prove signed-URL TTL or live Storage behavior. Preserve the generated JSON outside the repository.
