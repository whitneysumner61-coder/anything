// agent.js - AI Agent Frontend
let ws = null;
let currentProject = null;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    connectWebSocket();
    loadProjects();
    checkAPIHealth();
});

function connectWebSocket() {
    const wsPort = 3001;
    ws = new WebSocket(`ws://localhost:${wsPort}`);

    ws.onopen = () => {
        updateStatus('connected', 'AI Agent Connected');
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };

    ws.onerror = () => {
        updateStatus('error', 'Connection Error');
    };

    ws.onclose = () => {
        updateStatus('disconnected', 'Disconnected');
        // Reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
    };
}

function updateStatus(status, text) {
    const dot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');

    dot.className = `status-dot status-${status}`;
    statusText.textContent = text;
}

async function checkAPIHealth() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();

        if (data.state) {
            document.getElementById('stateLocation').textContent = data.state;
        }
    } catch (error) {
        console.error('Health check failed:', error);
    }
}

function setPrompt(text) {
    document.getElementById('promptInput').value = text;
}

async function generateProject() {
    const prompt = document.getElementById('promptInput').value.trim();

    if (!prompt) {
        alert('Please describe what you want to build');
        return;
    }

    const type = document.getElementById('projectType').value;
    const technologies = document.getElementById('technologies').value
        .split(',')
        .map(t => t.trim())
        .filter(t => t);

    // Show progress
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('generateBtn').disabled = true;

    // Animate progress
    animateProgress();

    try {
        if (ws && ws.readyState === WebSocket.OPEN) {
            // Use WebSocket for real-time updates
            ws.send(JSON.stringify({
                type: 'generate',
                prompt,
                type: type === 'auto' ? undefined : type,
                technologies: technologies.length > 0 ? technologies : undefined
            }));
        } else {
            // Fallback to HTTP
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    type: type === 'auto' ? undefined : type,
                    technologies: technologies.length > 0 ? technologies : undefined
                })
            });

            const data = await response.json();

            if (data.success) {
                showResults(data);
            } else {
                throw new Error(data.error || 'Generation failed');
            }
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
        resetUI();
    }
}

function handleWebSocketMessage(data) {
    switch (data.type) {
        case 'connected':
            console.log('WebSocket connected:', data.message);
            break;

        case 'status':
            updateProgressStatus(data.message);
            break;

        case 'complete':
            showResults({
                success: true,
                project: data.project,
                commands: data.commands,
                nextSteps: data.nextSteps
            });
            break;

        case 'chat-response':
            displayChatMessage('ai', data.content);
            break;

        case 'error':
            alert(`Error: ${data.error}`);
            resetUI();
            break;
    }
}

function animateProgress() {
    const fill = document.getElementById('progressFill');
    const steps = document.querySelectorAll('.step');
    let progress = 0;
    let stepIndex = 0;

    const interval = setInterval(() => {
        progress += 2;
        fill.style.width = `${progress}%`;

        const newStepIndex = Math.floor(progress / 25);
        if (newStepIndex > stepIndex && newStepIndex < 4) {
            steps[stepIndex].classList.add('step-complete');
            stepIndex = newStepIndex;
            steps[stepIndex].classList.add('step-active');
        }

        if (progress >= 90) {
            clearInterval(interval);
        }
    }, 100);
}

function updateProgressStatus(message) {
    const activeStep = document.querySelector('.step-active');
    if (activeStep) {
        activeStep.querySelector('.step-text').textContent = message;
    }
}

function showResults(data) {
    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('generateBtn').disabled = false;

    // Complete all progress steps
    document.querySelectorAll('.step').forEach(step => {
        step.classList.add('step-complete');
    });
    document.getElementById('progressFill').style.width = '100%';

    currentProject = data.project;

    // Update result info
    document.getElementById('projectName').textContent = data.project.name || data.project.id;
    document.getElementById('projectPath').textContent = data.project.path;
    document.getElementById('filesCount').textContent = data.project.files?.length || 'Multiple';

    // Show commands
    const commandsList = document.getElementById('commandsList');
    commandsList.innerHTML = '';
    (data.commands || []).forEach(cmd => {
        const cmdEl = document.createElement('div');
        cmdEl.className = 'command-item';
        cmdEl.innerHTML = `<code>${cmd}</code> <button onclick="copyCommand('${cmd}')">Copy</button>`;
        commandsList.appendChild(cmdEl);
    });

    // Show files
    const filesList = document.getElementById('filesList');
    filesList.innerHTML = '';
    (data.project.files || []).forEach(file => {
        const fileEl = document.createElement('div');
        fileEl.className = 'file-item';
        fileEl.textContent = file;
        filesList.appendChild(fileEl);
    });

    // Show next steps
    const nextStepsList = document.getElementById('nextStepsList');
    nextStepsList.innerHTML = '';
    (data.nextSteps || []).forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        nextStepsList.appendChild(li);
    });

    // Reload projects history
    loadProjects();
}

function resetUI() {
    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('generateBtn').disabled = false;
    document.getElementById('promptInput').value = '';
    document.getElementById('progressFill').style.width = '0%';

    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('step-active', 'step-complete');
    });
}

function copyCommand(cmd) {
    navigator.clipboard.writeText(cmd);
    alert('Command copied to clipboard!');
}

async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        const data = await response.json();

        const grid = document.getElementById('projectsHistory');
        grid.innerHTML = '';

        if (data.projects && data.projects.length > 0) {
            data.projects.slice(0, 6).forEach(project => {
                const card = document.createElement('div');
                card.className = 'project-card';
                card.innerHTML = `
                    <h4>${project.name}</h4>
                    <p>${project.description || 'No description'}</p>
                    <div class="project-meta">
                        <span>📁 ${project.files} files</span>
                        <span>📅 ${new Date(project.created).toLocaleDateString()}</span>
                    </div>
                `;
                card.onclick = () => viewProject(project.id);
                grid.appendChild(card);
            });
        } else {
            grid.innerHTML = '<p class="no-projects">No projects yet. Create your first one above!</p>';
        }
    } catch (error) {
        console.error('Failed to load projects:', error);
    }
}

async function viewProject(id) {
    try {
        const response = await fetch(`/api/projects/${id}`);
        const data = await response.json();

        alert(`Project: ${data.project.name}\n\nPath: ${data.project.path}\n\nFiles: ${data.project.files.join(', ')}`);
    } catch (error) {
        alert(`Error loading project: ${error.message}`);
    }
}

function toggleChat() {
    const content = document.getElementById('chatContent');
    content.style.display = content.style.display === 'none' ? 'block' : 'none';
}

function sendChat() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    displayChatMessage('user', message);
    input.value = '';

    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'chat',
            content: message
        }));
    } else {
        displayChatMessage('ai', 'Chat is not available. Please check the connection.');
    }
}

function displayChatMessage(role, content) {
    const messages = document.getElementById('chatMessages');
    const msgEl = document.createElement('div');
    msgEl.className = `chat-message chat-${role}`;
    msgEl.textContent = content;
    messages.appendChild(msgEl);
    messages.scrollTop = messages.scrollHeight;
}
