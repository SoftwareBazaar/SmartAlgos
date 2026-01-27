# 🧹 Project Cleanup Instructions

## Quick Start

Run this command in PowerShell:

```powershell
.\cleanup-project.ps1
```

## What It Does

1. ✅ Moves 100+ unnecessary files to `_archive/` folder
2. ✅ Keeps only essential files for production
3. ✅ Reduces project size by ~70%
4. ✅ Updates .gitignore automatically
5. ✅ Keeps 2 essential test files

## Files That Will Be Archived

- 📄 100+ documentation files (*.md)
- 🧪 30+ test scripts (test-*.js)
- 🚀 10+ deployment scripts (deploy-*.bat, deploy-*.ps1)
- 🔑 License system files (unused)
- 🔧 Utility scripts (add-*.js, create-*.js, etc.)
- 📦 Old/duplicate files

## Files That Will Be Kept

- ✅ All core application code (server.js, routes/, services/, etc.)
- ✅ All React frontend (client/)
- ✅ Essential configuration (package.json, .env.example, etc.)
- ✅ README.md
- ✅ 2 essential test files (test-platform-health.js, test-email.js)

## Safety Features

- Files are **moved**, not deleted
- Everything goes to `_archive/` folder
- Can restore any file if needed
- `_archive/` added to .gitignore (stays local)

## After Cleanup

### 1. Test Locally
```bash
npm start
```

### 2. If Everything Works
```bash
git add .
git commit -m "chore: Clean up project for production launch"
git push origin master
```

### 3. If You Need Archived Files
They're in `_archive/` folder - just copy them back!

## Size Reduction

**Before:** ~500+ files, ~50MB  
**After:** ~150 files, ~10-15MB  
**Reduction:** ~70% smaller! 🎉

## Electron App Preparation

After cleanup, your project will be ready for Electron conversion:
- Smaller bundle size
- Faster builds
- Cleaner codebase
- Professional structure

## Need Help?

If something breaks after cleanup:
1. Check `_archive/` folder
2. Copy needed files back
3. Or restore from git: `git checkout .`

---

**Ready to clean up?** Run `.\cleanup-project.ps1` now!
