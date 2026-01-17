// agent/src/project-generator.ts
// AI-Powered Project Scaffolding and Code Generation
export class ProjectGenerator {
    llm;
    state;
    constructor(llm, state) {
        this.llm = llm;
        this.state = state;
    }
    async generateProject(request) {
        console.log(`[Generator] Creating project from: "${request.prompt}"`);
        // Step 1: Analyze request and determine project structure
        const analysis = await this.analyzeRequest(request);
        // Step 2: Create project in state
        const project = await this.state.createProject(analysis.name, request.prompt);
        // Step 3: Generate project files
        const files = await this.generateFiles(project, analysis, request);
        // Step 4: Write files to disk
        for (const file of files) {
            await this.state.writeProjectFile(project.id, file.path, file.content);
        }
        // Step 5: Generate package.json and dependencies
        const packageJson = this.generatePackageJson(analysis, request);
        await this.state.writeProjectFile(project.id, 'package.json', packageJson);
        // Step 6: Generate setup commands
        const commands = this.generateSetupCommands(analysis);
        // Step 7: Generate README and documentation
        const readme = await this.generateReadme(project, analysis, request);
        await this.state.writeProjectFile(project.id, 'README.md', readme);
        console.log(`[Generator] Project created at: ${project.path}`);
        console.log(`[Generator] Files generated: ${files.length + 2}`);
        return {
            project,
            files,
            commands,
            nextSteps: analysis.nextSteps
        };
    }
    async analyzeRequest(request) {
        const prompt = `Analyze this project request and provide a JSON response with the following structure:
{
  "name": "project-name",
  "type": "web|api|cli|fullstack",
  "description": "brief description",
  "technologies": ["node", "express", "react", etc],
  "fileStructure": [
    {"path": "src/index.ts", "purpose": "entry point"},
    ...
  ],
  "features": ["feature1", "feature2"],
  "nextSteps": ["step1", "step2"]
}

Project Request: ${request.prompt}

${request.features ? `Required Features: ${request.features.join(', ')}` : ''}
${request.technologies ? `Preferred Technologies: ${request.technologies.join(', ')}` : ''}

Respond with ONLY the JSON, no markdown or additional text.`;
        try {
            const response = await this.llm.generateCode({
                prompt,
                maxTokens: 2048,
                temperature: 0.3
            });
            // Extract JSON from response
            const jsonMatch = response.content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        }
        catch (error) {
            console.warn('[Generator] LLM analysis failed, using template');
        }
        // Fallback to template-based analysis
        return this.templateAnalysis(request);
    }
    templateAnalysis(request) {
        const name = request.prompt
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(' ')
            .slice(0, 3)
            .join('-');
        const type = request.type || 'web';
        return {
            name,
            type,
            description: request.prompt,
            technologies: request.technologies || ['node', 'typescript'],
            fileStructure: this.getDefaultFileStructure(type),
            features: request.features || [],
            nextSteps: [
                'npm install',
                'npm run build',
                'npm start'
            ]
        };
    }
    getDefaultFileStructure(type) {
        const structures = {
            web: [
                { path: 'src/index.ts', purpose: 'Entry point' },
                { path: 'src/app.ts', purpose: 'Application logic' },
                { path: 'public/index.html', purpose: 'HTML template' },
                { path: 'public/styles.css', purpose: 'Styling' }
            ],
            api: [
                { path: 'src/index.ts', purpose: 'API entry point' },
                { path: 'src/routes.ts', purpose: 'Route definitions' },
                { path: 'src/controllers.ts', purpose: 'Business logic' }
            ],
            cli: [
                { path: 'src/cli.ts', purpose: 'CLI entry point' },
                { path: 'src/commands.ts', purpose: 'Command handlers' }
            ],
            fullstack: [
                { path: 'backend/src/index.ts', purpose: 'Backend entry' },
                { path: 'backend/src/routes.ts', purpose: 'API routes' },
                { path: 'frontend/src/index.tsx', purpose: 'Frontend entry' },
                { path: 'frontend/src/App.tsx', purpose: 'Main component' }
            ]
        };
        return structures[type] || structures.web;
    }
    async generateFiles(project, analysis, request) {
        const files = [];
        for (const fileSpec of analysis.fileStructure) {
            console.log(`[Generator] Generating ${fileSpec.path}...`);
            const content = await this.generateFileContent(fileSpec.path, fileSpec.purpose, analysis, request);
            files.push({
                path: fileSpec.path,
                content
            });
        }
        // Add configuration files
        files.push({
            path: 'tsconfig.json',
            content: this.generateTsConfig()
        });
        files.push({
            path: '.gitignore',
            content: this.generateGitignore()
        });
        return files;
    }
    async generateFileContent(filePath, purpose, analysis, request) {
        const prompt = `Generate production-ready code for a file with these specifications:

File Path: ${filePath}
Purpose: ${purpose}
Project Type: ${analysis.type}
Technologies: ${analysis.technologies.join(', ')}
Features: ${analysis.features.join(', ')}

Requirements:
- Modern best practices
- Type safety (TypeScript)
- Error handling
- Comments for complex logic
- Clean, readable code

Generate ONLY the file content, no markdown or explanations.`;
        try {
            const response = await this.llm.generateCode({
                prompt,
                context: [`Project: ${request.prompt}`],
                maxTokens: 4096,
                temperature: 0.5
            });
            // Clean up the response (remove markdown code blocks if present)
            let content = response.content.trim();
            content = content.replace(/^```[\w]*\n/, '').replace(/\n```$/, '');
            return content;
        }
        catch (error) {
            console.warn(`[Generator] LLM generation failed for ${filePath}, using template`);
            return this.getTemplateForFile(filePath, analysis.type);
        }
    }
    getTemplateForFile(filePath, type) {
        if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
            return `// ${filePath}\n// Auto-generated by PyBridge DevOS\n\nexport default function main() {\n  console.log('Application started');\n}\n\nmain();`;
        }
        if (filePath.endsWith('.html')) {
            return `<!DOCTYPE html>\n<html>\n<head>\n  <title>Application</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>`;
        }
        if (filePath.endsWith('.css')) {
            return `body {\n  font-family: system-ui;\n  margin: 0;\n  padding: 20px;\n}`;
        }
        return `// ${filePath}\n// Generated file`;
    }
    generatePackageJson(analysis, request) {
        const pkg = {
            name: analysis.name,
            version: '1.0.0',
            description: analysis.description,
            type: 'module',
            scripts: {
                build: 'tsc',
                start: 'node dist/index.js',
                dev: 'tsc && node dist/index.js'
            },
            dependencies: this.inferDependencies(analysis),
            devDependencies: {
                typescript: '^5.5.0',
                '@types/node': '^20.0.0'
            }
        };
        return JSON.stringify(pkg, null, 2);
    }
    inferDependencies(analysis) {
        const deps = {};
        if (analysis.technologies.includes('express'))
            deps['express'] = '^4.18.0';
        if (analysis.technologies.includes('react'))
            deps['react'] = '^18.0.0';
        if (analysis.type === 'web' || analysis.type === 'api') {
            deps['express'] = '^4.18.0';
        }
        return deps;
    }
    generateTsConfig() {
        return JSON.stringify({
            compilerOptions: {
                target: 'ES2022',
                module: 'ES2022',
                moduleResolution: 'Bundler',
                outDir: 'dist',
                rootDir: 'src',
                strict: true,
                esModuleInterop: true,
                skipLibCheck: true
            }
        }, null, 2);
    }
    generateGitignore() {
        return `node_modules/
dist/
build/
*.log
.env
.DS_Store`;
    }
    generateSetupCommands(analysis) {
        return [
            'npm install',
            'npm run build',
            ...analysis.nextSteps.filter((s) => !s.includes('npm install'))
        ];
    }
    async generateReadme(project, analysis, request) {
        const readme = `# ${project.name}

${project.description}

## Generated by PyBridge DevOS

This project was automatically generated from your natural language request.

## Features

${analysis.features.map((f) => `- ${f}`).join('\n')}

## Technologies

${analysis.technologies.map((t) => `- ${t}`).join('\n')}

## Setup

\`\`\`bash
npm install
npm run build
\`\`\`

## Usage

\`\`\`bash
npm start
\`\`\`

## Project Structure

${analysis.fileStructure.map((f) => `- \`${f.path}\` - ${f.purpose}`).join('\n')}

## Next Steps

${analysis.nextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

---

Generated on ${new Date().toISOString()}
`;
        return readme;
    }
}
