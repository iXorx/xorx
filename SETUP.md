# Payload CMS + GitHub Pages Setup Guide

This project is configured for a personal blog/portfolio with **SQLite database** and **static export** for GitHub Pages deployment.

## Prerequisites

- Node.js 20.9.0+
- pnpm (or npm/yarn)
- Git

## Local Development Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables

Create a `.env.local` file in the project root:

```bash
# Payload secret - use a strong, random string
PAYLOAD_SECRET=your-super-secret-key-change-me-in-production

# Optional: Database URL (defaults to local SQLite file)
# Leave empty to use the default: file:./payload.db
DATABASE_URL=

# Server URL for frontend/admin
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

To generate a strong secret:
```bash
openssl rand -base64 32
```

### 3. Run Development Server

```bash
pnpm dev
```

Then visit:
- **Admin Panel**: http://localhost:3000/admin
- **Frontend**: http://localhost:3000

### 4. Create Admin User

On first launch, you'll be prompted to create your admin account. Fill in:
- Email
- Password
- Confirm password

## Building for GitHub Pages

### 1. Build Static Site

```bash
pnpm build
```

This generates a static `out/` directory with all your pages pre-rendered.

### 2. Commit Database

The SQLite database file (`payload.db`) should be committed to your repository:

```bash
git add payload.db
git commit -m "Update blog content"
```

### 3. Deploy to GitHub Pages

**Option A: Using GitHub Actions** (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build
        env:
          PAYLOAD_SECRET: ${{ secrets.PAYLOAD_SECRET }}

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
          cname: yourdomain.com  # Remove if using default GitHub Pages domain
```

Then in GitHub:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add `PAYLOAD_SECRET` with your secret value
3. Go to **Pages** and set source to "GitHub Actions"

**Option B: Manual Deploy**

```bash
# Build the site
pnpm build

# Push to gh-pages branch
git subtree push --prefix out origin gh-pages
```

Then enable GitHub Pages in repository settings.

## Project Structure

```
.
├── src/
│   ├── app/                 # Next.js app (frontend + admin)
│   │   ├── (frontend)/      # Public-facing website
│   │   └── (payload)/       # Admin panel (Payload)
│   ├── collections/         # Database collections (Posts, Pages, etc.)
│   ├── payload.config.ts    # Payload configuration
│   └── ...
├── payload.db               # SQLite database (commit this!)
├── out/                     # Static export (git ignored)
├── .env.local               # Environment variables (git ignored)
└── ...
```

## Important Notes

### Database Management

- **SQLite file location**: `./payload.db` in project root
- **Backup**: Commit `payload.db` to git whenever you update content
- **Local development**: Database persists across sessions
- **CI/CD**: Database file is checked in, so CI always has current content

### Static Export Limitations

With `output: 'export'`, you **cannot use**:
- API routes (except static generation)
- Server components with dynamic requests
- Next.js Image Optimization
- Streaming

What **you can** use:
- Server-side rendering at build time
- Static pages from Payload content
- Client-side interactivity (React)
- External APIs (fetch in components/functions)

### Git Ignored Files

Your `.gitignore` should include:

```
.env.local
.next/
out/
node_modules/
```

**But NOT `payload.db`** - this should be committed!

## Common Tasks

### Add Blog Post

1. Go to http://localhost:3000/admin
2. Navigate to **Posts**
3. Click **Create New**
4. Fill in the form and publish
5. Run `pnpm build` to regenerate static pages
6. Commit `payload.db` to deploy

### Update Site Content

Any changes to Pages/Posts/Header/Footer:

```bash
# Build static site
pnpm build

# Commit database changes
git add payload.db

# Push to deploy
git commit -m "Update: [what changed]"
git push
```

### Regenerate Types

After modifying collections:

```bash
pnpm generate:types
pnpm generate:importmap
```

### Local Database Reset

To start fresh:

```bash
# Delete database file
rm payload.db

# Restart dev server
pnpm dev
```

## Troubleshooting

### Build fails with database errors

- Ensure `payload.db` exists and has correct permissions
- Run `pnpm dev` first to initialize database

### Images not loading after deploy

- Check image paths (use relative paths when possible)
- Ensure media is in public directory or served from valid URL

### Changes not showing after deploy

- Rebuild: `pnpm build`
- Commit database: `git add payload.db && git commit -m "Update content"`
- Push changes: `git push`

### GitHub Pages showing 404

- Check **Pages** settings in repository
- Ensure build artifacts are in `out/` directory
- Verify domain configuration if using custom domain

## Resources

- [Payload CMS Docs](https://payloadcms.com/docs)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [GitHub Pages Docs](https://docs.github.com/en/pages)

## Security Notes

- **PAYLOAD_SECRET**: Keep this secure and use different values for production
- **Database**: Storing SQLite in git means content is public; use only for non-sensitive data
- **Credentials**: Don't commit `.env.local`; use GitHub Secrets for CI/CD

---

Happy blogging! 📝
