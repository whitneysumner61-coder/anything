// Global state
let currentWorkspace = null;
let currentSession = null;
let stdoutUri = null;
let stderrUri = null;
let logRefreshInterval = null;

// API base URL
const API_BASE = '';

// Utility functions
function showStatus(elementId, message, type = 'info') {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = 'info-box';
    if (type === 'success') element.classList.add('success');
    if (type === 'error') element.classList.add('error');
}

function updateServerStatus(online) {
    const status = document.getElementById('serverStatus');
    status.className = online ? 'status-indicator online' : 'status-indicator offline';
}

// Workspace operations
async function openWorkspace() {
    const root = document.getElementById('workspaceRoot').value;
    if (!root) {
        showStatus('workspaceInfo', 'Please enter a workspace path', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/workspace/open`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ root })
        });

        const data = await response.json();

        if (response.ok) {
            currentWorkspace = data.workspace_id;
            showStatus('workspaceInfo',
                `✓ Workspace opened: ${data.workspace_id}\nRoot: ${data.root}`,
                'success'
            );
        } else {
            throw new Error(data.error || 'Failed to open workspace');
        }
    } catch (error) {
        showStatus('workspaceInfo', `✗ Error: ${error.message}`, 'error');
    }
}

// Command execution
async function executeCommand() {
    if (!currentWorkspace) {
        showStatus('commandStatus', '✗ Please open a workspace first', 'error');
        return;
    }

    const cmd = document.getElementById('command').value;
    const argsInput = document.getElementById('commandArgs').value;
    const args = argsInput ? argsInput.split(',').map(s => s.trim()) : [];
    const sandbox_profile = document.getElementById('sandboxProfile').value;

    if (!cmd) {
        showStatus('commandStatus', '✗ Please enter a command', 'error');
        return;
    }

    try {
        showStatus('commandStatus', '⏳ Executing command...', 'info');

        const response = await fetch(`${API_BASE}/api/command/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                workspace_id: currentWorkspace,
                cmd,
                args,
                sandbox_profile
            })
        });

        const data = await response.json();

        if (response.ok) {
            currentSession = data.session_id;
            stdoutUri = data.stdout_uri;
            stderrUri = data.stderr_uri;

            showStatus('commandStatus',
                `✓ Command started\nSession: ${data.session_id}`,
                'success'
            );

            // Clear logs
            document.getElementById('stdoutLog').textContent = '';
            document.getElementById('stderrLog').textContent = '';

            // Start auto-refresh
            startLogRefresh();
        } else {
            throw new Error(data.error || 'Failed to execute command');
        }
    } catch (error) {
        showStatus('commandStatus', `✗ Error: ${error.message}`, 'error');
    }
}

// Log operations
async function refreshLogs() {
    if (!stdoutUri && !stderrUri) {
        return;
    }

    try {
        // Fetch stdout
        if (stdoutUri) {
            const stdoutResponse = await fetch(`${API_BASE}/api/resource/read`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uri: stdoutUri })
            });
            const stdoutData = await stdoutResponse.json();
            if (stdoutResponse.ok && stdoutData.content) {
                document.getElementById('stdoutLog').textContent = stdoutData.content;
            }
        }

        // Fetch stderr
        if (stderrUri) {
            const stderrResponse = await fetch(`${API_BASE}/api/resource/read`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uri: stderrUri })
            });
            const stderrData = await stderrResponse.json();
            if (stderrResponse.ok && stderrData.content) {
                document.getElementById('stderrLog').textContent = stderrData.content;
            }
        }
    } catch (error) {
        console.error('Error refreshing logs:', error);
    }
}

function startLogRefresh() {
    // Clear existing interval
    if (logRefreshInterval) {
        clearInterval(logRefreshInterval);
    }

    // Refresh immediately
    refreshLogs();

    // Refresh every 1 second
    logRefreshInterval = setInterval(refreshLogs, 1000);
}

function clearLogs() {
    document.getElementById('stdoutLog').textContent = '';
    document.getElementById('stderrLog').textContent = '';
    if (logRefreshInterval) {
        clearInterval(logRefreshInterval);
        logRefreshInterval = null;
    }
}

// File operations
async function readFile() {
    if (!currentWorkspace) {
        showStatus('fileStatus', '✗ Please open a workspace first', 'error');
        return;
    }

    const filePath = document.getElementById('filePath').value;
    if (!filePath) {
        showStatus('fileStatus', '✗ Please enter a file path', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/file/read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                workspace_id: currentWorkspace,
                path: filePath
            })
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('fileContent').value = data.content;
            showStatus('fileStatus', `✓ File read successfully (${data.sha256.substring(0, 8)}...)`, 'success');
        } else {
            throw new Error(data.error || 'Failed to read file');
        }
    } catch (error) {
        showStatus('fileStatus', `✗ Error: ${error.message}`, 'error');
    }
}

async function writeFile() {
    if (!currentWorkspace) {
        showStatus('fileStatus', '✗ Please open a workspace first', 'error');
        return;
    }

    const filePath = document.getElementById('filePath').value;
    const content = document.getElementById('fileContent').value;

    if (!filePath) {
        showStatus('fileStatus', '✗ Please enter a file path', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/file/write`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                workspace_id: currentWorkspace,
                path: filePath,
                content
            })
        });

        const data = await response.json();

        if (response.ok) {
            showStatus('fileStatus', `✓ File written successfully (${data.sha256.substring(0, 8)}...)`, 'success');
        } else {
            throw new Error(data.error || 'Failed to write file');
        }
    } catch (error) {
        showStatus('fileStatus', `✗ Error: ${error.message}`, 'error');
    }
}

// Quick actions
async function quickAction(commandString) {
    const [cmd, ...args] = commandString.split(' ');

    document.getElementById('command').value = cmd;
    document.getElementById('commandArgs').value = args.join(', ');

    await executeCommand();
}

// Check server status on load
async function checkServerStatus() {
    try {
        const response = await fetch(`${API_BASE}/api/health`);
        updateServerStatus(response.ok);
    } catch (error) {
        updateServerStatus(false);
    }
}

// Initialize
checkServerStatus();
setInterval(checkServerStatus, 5000);
