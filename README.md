# PARKSystems Corporation

Public static frontend for PARKSystems Corporation.

The private operating system stays in `C:\laci`. This repository is the public
surface that can be deployed from GitHub to Railway.

## Railway

Railway can deploy this repository directly from GitHub.

The app uses:

```bash
pnpm install
pnpm run build
pnpm start
```

`pnpm start` launches `server.mjs`, which reads Railway's `PORT` environment
variable and binds to `0.0.0.0`, so Railway can attach its generated domain or
your custom domain automatically.

## Manual publishing

Public notes live in `app/content.ts`.

To publish a LACI note manually:

1. Write or finalize the analysis in `C:\laci`.
2. Copy the public-ready text.
3. Add a new entry to the `posts` array in `app/content.ts`.
4. Give it a `slug`, `date`, `domain`, `title`, `summary`, and `body`.
5. Commit and push the repo so Railway can redeploy it.

Each post automatically appears on the homepage feed and at
`/analysis/[slug]`.

## Local preview

```bash
pnpm install
pnpm run dev
```

## Production build

```bash
pnpm run build
pnpm start
```
