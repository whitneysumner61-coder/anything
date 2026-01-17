# PyBridge DevOS - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Launch the Application

**On Linux/macOS:**
```bash
./launch-app.sh
```

**On Windows:**
```bash
launch-app.bat
```

The script will:
1. Build the MCP server
2. Build the web application
3. Start the server on http://localhost:3000
4. Automatically open your browser

### Step 3: Start Using the Application

The web interface will open automatically. Here's what you can do:

## 📖 Usage Examples

### Example 1: Open a Workspace and List Files

1. **Open Workspace**
   - In the "Workspace" section, enter a path: `/tmp/my-project`
   - Click "Open Workspace"
   - You'll see a confirmation with your workspace ID

2. **List Files**
   - In the "Execute Command" section:
   - Command: `ls`
   - Arguments: `-la`
   - Click "Execute"
   - View the output in the "Command Output" section (updates automatically)

### Example 2: Run Python Script

1. **Execute Python**
   - Command: `python3`
   - Arguments: `--version` (or path to your script)
   - Select sandbox profile: `dev`
   - Click "Execute"
   - Watch real-time output in the STDOUT panel

### Example 3: Edit a File

1. **Read a File**
   - In "File Operations" section
   - Enter file path: `config.json`
   - Click "Read"
   - File content appears in the text area

2. **Edit and Save**
   - Modify the content in the text area
   - Click "Write File"
   - You'll see a confirmation with the file hash

### Example 4: Use Quick Actions

The "Quick Actions" section provides pre-configured commands:

- **🐍 Python Version** - Check installed Python version
- **📦 Node Version** - Check installed Node.js version
- **🔧 Git Status** - View git repository status
- **📍 Current Dir** - Show current working directory

Just click any button to execute instantly!

## 🎨 Web Interface Overview

### Workspace Section (Top)
- Open and manage local workspaces
- Displays workspace ID and root path

### Command Execution
- Execute any command with arguments
- Choose sandbox profile:
  - **dev**: Full access (recommended for development)
  - **ci**: CI/CD mode
  - **strict**: Blocks shell interpreters for security

### Command Output
- **STDOUT**: Normal command output (left panel)
- **STDERR**: Error messages (right panel)
- Auto-refreshes every second while command is running
- Click "Refresh Logs" to manually update
- Click "Clear" to reset the output

### File Operations
- Read files from your workspace
- Edit content directly in the browser
- Write changes back to disk
- Shows SHA-256 hash for verification

## 🖥️ Desktop Integration (Linux Only)

### Create Desktop Shortcut

```bash
./install-launcher.sh
```

This will:
- Create an entry in your application menu
- Add a desktop shortcut (if ~/Desktop exists)
- Allow launching from your system's app launcher

Search for "PyBridge DevOS" in your application menu!

## 🛠️ Advanced Usage

### Running Multiple Commands

You can chain commands or run complex workflows:

1. Open workspace
2. Run `git clone https://github.com/user/repo.git`
3. Change directory context (use relative paths)
4. Run build commands: `npm install`, `npm run build`
5. View logs in real-time

### Sandbox Profiles Explained

- **dev mode**: Unrestricted access, best for local development
- **ci mode**: Suitable for CI/CD environments
- **strict mode**: Blocks dangerous commands like bash/sh/zsh

### File Operations Tips

- File paths are relative to the workspace root
- Supports any text-based file
- Great for quick config edits
- Shows file hash for integrity verification

## 🔧 Troubleshooting

### Port 3000 Already in Use

If you see an error about port 3000:

```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change the port in app/src/app-server.ts
# Change: const PORT = 3000;
# To: const PORT = 3001;
```

### Command Not Found

Make sure the command is:
1. Installed on your system
2. Available in your PATH
3. Not blocked by sandbox profile

### Logs Not Updating

- Click "Refresh Logs" manually
- Check if the command is still running
- Verify workspace is opened

## 📚 Next Steps

- Explore the different sandbox profiles
- Try running build scripts and tests
- Use file operations for quick edits
- Install the desktop launcher for easy access

## 🆘 Need Help?

- Check the main README.md for detailed information
- Review the server logs in the terminal
- Make sure Node.js version is 18+ (`node --version`)

Enjoy using PyBridge DevOS! 🎉
