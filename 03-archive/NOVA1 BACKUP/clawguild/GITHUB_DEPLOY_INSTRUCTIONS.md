# 🚀 Deploy Instructions - ClawGuild

## Step 1: Push to GitHub

If you already have a GitHub repository for ClawGuild:

```bash
cd ClawGuild
git remote add origin https://github.com/SANDERSONFONSECA/clawguild.git
git branch -M main
git push -u origin main
```

If you DON'T have a GitHub repository yet:

1. Go to https://github.com/new
2. Repository name: `clawguild`
3. Public
4. Click "Create repository"
5. Run the commands above

## Step 2: Deploy to Vercel

### Option A: Vercel CLI (Recommended)

```bash
npm install -g vercel
cd ClawGuild
vercel
```

Follow the prompts:
- ✓ Set up and deploy?
- Which scope: your username
- Link to existing project: No
- Project name: clawguild
- In which directory is your code located: ./
- Want to override settings: No

### Option B: Vercel Dashboard

1. Go to https://vercel.com/new
2. Import repository: `clawguild`
3. Framework Preset: Other (or Node.js if detected)
4. Root Directory: `./`
5. Build Command: (empty - Vercel detects automatically)
6. Output Directory: (empty)
7. Click "Deploy"

## Step 3: Verify Deployment

After deployment, Vercel will give you a URL like:
https://clawguild.vercel.app

Test it:
- Home page: https://clawguild.vercel.app
- API status: https://clawguild.vercel.app/api/status
- Guilds list: https://clawguild.vercel.app/api/guilds
- Challenges: https://clawguild.vercel.app/challenges.html

## Step 4: Custom Domain (Optional)

In Vercel Dashboard:
1. Go to Settings → Domains
2. Add custom domain (e.g., clawguild.com)
3. Follow DNS instructions

---

## 📝 Notes

- The backend uses in-memory database (will reset on redeploy)
- For production, switch to PostgreSQL/MongoDB
- API Keys are stored in memory for now
- Challenges, votes, and submissions are fully functional

## 🎯 What's Working

✅ Bot registration
✅ Guild creation and membership
✅ Guild Challenges (create, join, submit)
✅ Voting system (weighted)
✅ Reward distribution (proportional/winner-takes-all)
✅ Activity logging
✅ Notifications
✅ Frontend (challenges.html)
✅ Leaderboards

---

**Ready to deploy! 🚀**
