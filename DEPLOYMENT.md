# Deploying to Vercel

This project is built with **Vite** and **React**.

## Vercel Project Configuration

When importing your project into Vercel, use the following settings:

- **Framework Preset**: `Vite`
- **Root Directory**: `.` (or the folder containing `package.json` if inside a monorepo)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `dist` (default)
- **Install Command**: `npm install` (default)

## Deployment Steps

### Option 1: Using Vercel Dashboard (Recommended)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket).
2. Log in to [Vercel](https://vercel.com).
3. Click **"Add New..."** > **"Project"**.
4. Import your repository.
5. In the **"Configure Project"** screen:
   - Ensure **Framework Preset** is set to `Vite`.
   - Ensure **Root Directory** is correct (usually the root of the repo).
6. Click **"Deploy"**.

### Option 2: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Run the deploy command from the project root:
   ```bash
   vercel
   ```
3. Follow the prompts:
   - Set up and deploy? `Y`
   - Which scope? (Select your account)
   - Link to existing project? `N`
   - Project name? (Press Enter)
   - In which directory is your code located? `./`
   - Want to modify these settings? `N` (Auto-detects Vite)

## Environment Variables

If your application uses any environment variables (e.g., API URLs), adding them in the **Settings** > **Environment Variables** section on Vercel.

## Verification

After deployment, Vercel will provide a production URL. Visit this URL to verify:
- Navigation works (clicking links changes pages).
- Assets load correctly (images, styles).
- Reloading a sub-page (e.g., `/about`) works (handled by `vercel.json` rewrites).
