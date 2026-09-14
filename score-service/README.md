# Global rescue high score

This Cloudflare Worker and SQLite-backed Durable Object provide one persistent,
atomic global high score across visitors without changing the portfolio's static export.
No database credentials are shipped to the browser.

## Connect

1. Set `ALLOWED_ORIGIN` in `wrangler.toml` to the site's exact public origin.
2. In this directory, run `npm install` then `npm run deploy` with your Cloudflare account.
3. Set `NEXT_PUBLIC_SCORE_API_URL=https://moon-star-eater-score.<your-subdomain>.workers.dev`
   in the portfolio's build environment and rebuild/deploy the portfolio.

For local testing, run `npm run dev` here and use its URL for
`NEXT_PUBLIC_SCORE_API_URL` in the portfolio's `.env.local`. Restart Next.js.

The interface explicitly displays “Not connected” until an API is configured.
It never substitutes a browser-local count for the global high score. Sessions submit
best individual-flight rescue counts so retrying a batch cannot inflate the record. Anonymous
sessions expire after 24 hours. Input validation, origin checks, and a plausible
points-per-second ceiling provide basic abuse limits; this is a casual scoreboard,
not a verified competitive leaderboard. Cleared or closed tabs can lose the final
unacknowledged batch if the unload beacon fails. The live UI refreshes every 3 seconds.

The high score uses new `rescue_records` and `rescue_sessions` tables. Previous aggregate
totals are retained separately and are not interpreted as individual records.

One rescued person equals one saved. Only alien collisions cost a life; missed
passengers do not. Rescue records are separate from the former star-point records.

## Production

Worker: https://moon-star-eater-score.star-eater-score-service.workers.dev

The GitHub repository variable `NEXT_PUBLIC_SCORE_API_URL` supplies this endpoint
at build time. The Worker permits the production origin `https://www.jinhongmoon.com`;
`npm run dev` overrides the origin for localhost. Deploy Worker changes with
`npm run deploy` from this directory, then push the frontend to `main` for Pages.
