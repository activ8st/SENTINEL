# Gemini news extraction

Set environment variables on the backend host (Render), never in VITE variables:

    GEMINI_API_KEY=<key from Google AI Studio>
    SENTINEL_GEMINI_ENABLED=true
    SENTINEL_GEMINI_MODEL=gemini-3.5-flash-lite
SENTINEL_GEMINI_DAILY_LIMIT=20
SENTINEL_GEMINI_MIN_INTERVAL_SECONDS=6

Use an API project on Google's free tier without billing for a zero-cost trial.
The local cap does not determine Google's billing tier or guarantee free quota.
Actual quotas are shown in AI Studio. No paid fallback or search tools are used.
Only public article text is sent. Review Google's free-tier data terms.

Results are cached in .sentinel-cache/gemini.sqlite3, separate from sentinel.db.
Persist that directory on the server to retain the cache and daily counter across
deployments. Run a single ingestion worker; the cap is per cache, not per account.
At most one uncached request every 15 seconds is attempted. Other articles use
existing extraction; there is currently no backfill queue. HTTP 429/401/403 stops
requests until the next UTC day. Missing credentials and failures preserve the
existing news pipeline.

Gemini extracts category and explicit municipality/street/hamlet from the supplied
body. Exact evidence quotations are validated locally. Existing geocoding and
area checks resolve coordinates; municipality-only locations remain approximate.
The existing event-time parser remains responsible for dates in this first version.
Extraction is not independent fact checking and must be evaluated on real articles
before increasing volume. Already-skipped articles are not automatically reprocessed.
