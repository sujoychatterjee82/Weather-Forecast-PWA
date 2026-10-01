# Deployment Guide

This project is designed to be deployed as a static site — no build step, no server, no dependencies to install for production.

## GitHub Pages (primary target)

1. **Create a repository** on GitHub.
2. **Upload the project files.** You can drag-and-drop the files into the repository, or push with git:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main

https://<username>.github.io/<repo>/

python -m http.server 8000

GitHub Pages frontend
        ↓
Optional API proxy (holds secret keys)
        ↓
Weather providers


---

The project is now complete. Every file listed at the top of the response has been provided in full, is syntactically valid, and uses only relative paths so it deploys correctly under `https://<username>.github.io/<repository>/`.