# PyBridge DevOS - Windows Setup Guide

## 🪟 Quick Start for Windows Users

### Step 1: Navigate to the Project Directory

First, you need to be in the correct directory. If you used Claude Code teleport, navigate to the directory shown in the teleport command.

**Example:**
```powershell
# If the project is in your Documents folder:
cd C:\Users\YourName\Documents\pybridge-devos

# Or wherever you cloned/teleported the repository
```

**Check you're in the right place:**
```powershell
# You should see package.json listed:
dir package.json
```

### Step 2: Choose Your Launcher

You have **three options** to launch the application:

#### Option A: PowerShell (Recommended)

```powershell
.\launch-app.ps1
```

**If you get an execution policy error**, run this first:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Or run without changing policy:
```powershell
powershell -ExecutionPolicy Bypass -File .\launch-app.ps1
```

#### Option B: Command Prompt (CMD)

```cmd
launch-app.bat
```

#### Option C: Manual (NPM commands)

```powershell
npm install
npm run build
npm run build:app
npm run app
```

### Step 3: Access the Application

The browser should open automatically to:
```
http://localhost:3000
```

If it doesn't open, manually navigate to that URL in your browser.

## 🔧 Advanced PowerShell Options

### Kill Process on Port 3000

If you get a "port already in use" error:

```powershell
.\launch-app.ps1 -KillPort
```

### Use a Different Port

```powershell
.\launch-app.ps1 -Port 3001
```

### Clean Install

Remove node_modules and start fresh:

```powershell
.\launch-app.ps1 -Clean
```

### Combine Options

```powershell
.\launch-app.ps1 -Port 3001 -KillPort -Clean
```

## 🐛 Troubleshooting

### "package.json not found"

**Problem:** You're in the wrong directory.

**Solution:**
```powershell
# Find where the project is:
Get-ChildItem -Path C:\ -Filter package.json -Recurse -ErrorAction SilentlyContinue |
  Where-Object { $_.Directory.Name -eq "pybridge-devos" }

# Then navigate there:
cd "C:\path\to\pybridge-devos"
```

### Port Already in Use

**Option 1: Use the -KillPort flag**
```powershell
.\launch-app.ps1 -KillPort
```

**Option 2: Find and kill manually**
```powershell
# Find what's using port 3000:
Get-NetTCPConnection -LocalPort 3000 -State Listen

# Kill the process (replace PID with actual process ID):
Stop-Process -Id PID -Force
```

**Option 3: Use a different port**
```powershell
.\launch-app.ps1 -Port 3001
```

### Node.js Not Found

**Problem:** Node.js is not installed or not in PATH.

**Solution:**
1. Download and install Node.js 18+ from https://nodejs.org/
2. Restart your terminal/PowerShell window
3. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

### Build Errors

**Try a clean install:**
```powershell
.\launch-app.ps1 -Clean
```

Or manually:
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### PowerShell Execution Policy Error

**Error:** "cannot be loaded because running scripts is disabled"

**Solution:**
```powershell
# Option 1: Change policy (persistent)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Option 2: Bypass for single run
powershell -ExecutionPolicy Bypass -File .\launch-app.ps1

# Option 3: Use the .bat file instead
.\launch-app.bat
```

## 📝 Common Tasks

### Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

### Restarting the Server

1. Stop with `Ctrl+C`
2. Run the launcher again:
   ```powershell
   .\launch-app.ps1
   ```

### Checking if Server is Running

```powershell
# Check port 3000:
Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue

# Or check all Node processes:
Get-Process node -ErrorAction SilentlyContinue
```

### Opening the App When Server is Already Running

Just navigate to:
```
http://localhost:3000
```

Or use PowerShell:
```powershell
Start-Process "http://localhost:3000"
```

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Launch app (PowerShell) | `.\launch-app.ps1` |
| Launch app (CMD) | `launch-app.bat` |
| Kill port & launch | `.\launch-app.ps1 -KillPort` |
| Different port | `.\launch-app.ps1 -Port 3001` |
| Clean install | `.\launch-app.ps1 -Clean` |
| Stop server | `Ctrl+C` |
| Open browser | `Start-Process "http://localhost:3000"` |
| Check port | `Get-NetTCPConnection -LocalPort 3000 -State Listen` |

## 🆘 Still Having Issues?

1. **Make sure you're in the project directory** - Run `dir package.json` to verify
2. **Check Node.js version** - Run `node --version` (should be 18+)
3. **Try a clean install** - Run `.\launch-app.ps1 -Clean`
4. **Check the main README.md** - Contains detailed architecture info
5. **Check QUICKSTART.md** - Contains usage examples

## 🎉 Success!

Once running, you should see:
- Terminal showing server logs
- Browser opening to http://localhost:3000
- A beautiful purple gradient interface

Now you can:
- Open workspaces
- Execute commands
- View real-time logs
- Edit files
- Use quick actions

Enjoy PyBridge DevOS! 🚀
