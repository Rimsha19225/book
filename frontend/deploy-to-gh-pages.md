# Deploying to GitHub Pages

The `npm run deploy` command is designed to deploy your Docusaurus site to GitHub Pages. However, there are several prerequisites that need to be met for this to work:

## Prerequisites

1. **Repository Setup**: The repository `Rimsha19225/book` must exist on GitHub
2. **SSH Keys**: You must have SSH keys set up for GitHub access
3. **gh-pages Branch**: The `gh-pages` branch must exist in the repository

## Steps to Set Up GitHub Pages Deployment

### 1. Create the Repository on GitHub
- Go to GitHub and create a new repository named `book`
- Make sure your GitHub username is `Rimsha19225`

### 2. Create the gh-pages Branch
```bash
git checkout -b gh-pages
git push -u origin gh-pages
git checkout main  # switch back to main branch
```

### 3. Configure Git Remote (if needed)
If your current remote points to a different repository, update it:
```bash
git remote set-url origin git@github.com:Rimsha19225/book.git
```

### 4. Alternative: Manual Deployment
If the automated deployment doesn't work, you can manually deploy:

1. Build your site:
```bash
npm run build
```

2. The built site will be in the `build/` directory
3. Copy the contents of the `build/` directory to your `gh-pages` branch
4. Push the changes to GitHub

### 5. Using GitHub Actions (Recommended)
Create a GitHub Actions workflow for automatic deployment when you push to the main branch.

Create `.github/workflows/deploy.yml` in your repository:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
    - name: Build site
      run: |
        cd frontend
        npm run build
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./frontend/build
        publish_branch: gh-pages
```

## Current Status
Your site builds successfully! The issue is only with the deployment step. You can test your site locally using:
```bash
npm run serve
```

This will serve your site at `http://localhost:3000/physical-ai-textbook/`.