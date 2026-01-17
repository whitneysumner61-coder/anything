// agent/src/state-manager.ts
// Hybrid State Management: Stateful persistence + Stateless execution
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
export class StateManager {
    stateRoot;
    projectsPath;
    sessionsPath;
    currentSession = null;
    // In-memory cache for performance (stateless layer)
    cache = new Map();
    constructor(rootPath = 'D:\\PyBridge') {
        this.stateRoot = rootPath;
        this.projectsPath = path.join(rootPath, 'projects');
        this.sessionsPath = path.join(rootPath, 'sessions');
    }
    async initialize() {
        // Create directory structure
        await fs.mkdir(this.stateRoot, { recursive: true });
        await fs.mkdir(this.projectsPath, { recursive: true });
        await fs.mkdir(this.sessionsPath, { recursive: true });
        // Start new session
        this.currentSession = {
            id: `session_${Date.now()}`,
            started: new Date(),
            lastActive: new Date(),
            projects: [],
            history: []
        };
        await this.saveSession();
        console.log(`[State] Initialized at ${this.stateRoot}`);
        console.log(`[State] Session: ${this.currentSession.id}`);
    }
    // === PROJECT MANAGEMENT ===
    async createProject(name, description) {
        const id = this.generateId(name);
        const projectPath = path.join(this.projectsPath, id);
        await fs.mkdir(projectPath, { recursive: true });
        const project = {
            id,
            name,
            description,
            path: projectPath,
            created: new Date(),
            modified: new Date(),
            files: [],
            dependencies: {},
            metadata: {}
        };
        await this.saveProject(project);
        this.currentSession?.projects.push(id);
        await this.saveSession();
        this.logAction('create_project', `Created project: ${name}`);
        return project;
    }
    async getProject(id) {
        // Check cache first (stateless layer)
        if (this.cache.has(`project_${id}`)) {
            return this.cache.get(`project_${id}`);
        }
        // Load from disk (stateful layer)
        const projectFile = path.join(this.projectsPath, id, 'project.json');
        try {
            const data = await fs.readFile(projectFile, 'utf8');
            const project = JSON.parse(data, (key, value) => {
                if (key === 'created' || key === 'modified') {
                    return new Date(value);
                }
                return value;
            });
            // Cache it
            this.cache.set(`project_${id}`, project);
            return project;
        }
        catch {
            return null;
        }
    }
    async saveProject(project) {
        const projectDir = path.join(this.projectsPath, project.id);
        await fs.mkdir(projectDir, { recursive: true });
        const projectFile = path.join(projectDir, 'project.json');
        await fs.writeFile(projectFile, JSON.stringify(project, null, 2), 'utf8');
        // Update cache
        this.cache.set(`project_${project.id}`, project);
    }
    async listProjects() {
        const dirs = await fs.readdir(this.projectsPath);
        const projects = [];
        for (const dir of dirs) {
            const project = await this.getProject(dir);
            if (project)
                projects.push(project);
        }
        return projects.sort((a, b) => b.modified.getTime() - a.modified.getTime());
    }
    // === FILE OPERATIONS ===
    async writeProjectFile(projectId, relativePath, content) {
        const project = await this.getProject(projectId);
        if (!project)
            throw new Error(`Project not found: ${projectId}`);
        const filePath = path.join(project.path, relativePath);
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(filePath, content, 'utf8');
        // Update project metadata
        if (!project.files.includes(relativePath)) {
            project.files.push(relativePath);
        }
        project.modified = new Date();
        await this.saveProject(project);
        this.logAction('write_file', `${projectId}/${relativePath}`);
    }
    async readProjectFile(projectId, relativePath) {
        const project = await this.getProject(projectId);
        if (!project)
            throw new Error(`Project not found: ${projectId}`);
        const filePath = path.join(project.path, relativePath);
        return await fs.readFile(filePath, 'utf8');
    }
    // === SESSION MANAGEMENT ===
    async saveSession() {
        if (!this.currentSession)
            return;
        const sessionFile = path.join(this.sessionsPath, `${this.currentSession.id}.json`);
        await fs.writeFile(sessionFile, JSON.stringify(this.currentSession, null, 2), 'utf8');
    }
    logAction(action, result) {
        if (!this.currentSession)
            return;
        this.currentSession.history.push({
            timestamp: new Date(),
            action,
            result
        });
        this.currentSession.lastActive = new Date();
        this.saveSession(); // Fire and forget
    }
    async getSessionHistory() {
        return this.currentSession?.history || [];
    }
    // === UTILITIES ===
    generateId(name) {
        const timestamp = Date.now();
        const hash = createHash('sha256')
            .update(name + timestamp)
            .digest('hex')
            .substring(0, 8);
        return `${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${hash}`;
    }
    getStateRoot() {
        return this.stateRoot;
    }
    clearCache() {
        this.cache.clear();
    }
    // === SNAPSHOTS (for stateless replay) ===
    async createSnapshot(name) {
        const snapshotId = `snapshot_${Date.now()}`;
        const snapshotPath = path.join(this.stateRoot, 'snapshots', snapshotId);
        await fs.mkdir(snapshotPath, { recursive: true });
        // Copy entire state
        const projects = await this.listProjects();
        const snapshot = {
            name,
            created: new Date(),
            projects: projects.map(p => p.id),
            session: this.currentSession
        };
        await fs.writeFile(path.join(snapshotPath, 'snapshot.json'), JSON.stringify(snapshot, null, 2), 'utf8');
        this.logAction('create_snapshot', name);
        return snapshotId;
    }
}
