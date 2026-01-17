// agent/src/llm-interface.ts
// AI LLM Interface for natural language understanding and code generation

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

export interface GenerationRequest {
  prompt: string;
  context?: string[];
  maxTokens?: number;
  temperature?: number;
}

export interface GenerationResponse {
  content: string;
  tokens: number;
  model: string;
}

export class LLMInterface {
  private client: Anthropic;
  private model: string = 'claude-sonnet-4-5-20250929';
  private conversationHistory: Array<{ role: string; content: string }> = [];

  constructor(apiKey?: string) {
    // Try to get API key from environment or parameter
    const key = apiKey || process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

    if (!key) {
      console.warn('[LLM] No API key found. Set ANTHROPIC_API_KEY environment variable for full functionality.');
      console.warn('[LLM] Running in limited mode - will use templates instead of LLM generation.');
    }

    this.client = new Anthropic({ apiKey: key || 'placeholder' });
  }

  async generateCode(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
        ...this.conversationHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        {
          role: 'user',
          content: this.buildPrompt(request)
        }
      ];

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: request.maxTokens || 4096,
        temperature: request.temperature || 0.7,
        messages
      });

      const content = response.content[0].type === 'text'
        ? response.content[0].text
        : '';

      // Update conversation history (keep last 10 exchanges)
      this.conversationHistory.push({ role: 'user', content: request.prompt });
      this.conversationHistory.push({ role: 'assistant', content });

      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      return {
        content,
        tokens: response.usage.input_tokens + response.usage.output_tokens,
        model: this.model
      };
    } catch (error: any) {
      // Fallback to template mode if API fails
      console.error('[LLM] API call failed:', error.message);
      return this.generateFromTemplate(request);
    }
  }

  private buildPrompt(request: GenerationRequest): string {
    let prompt = request.prompt;

    if (request.context && request.context.length > 0) {
      prompt = `Context:\n${request.context.join('\n\n')}\n\nRequest:\n${prompt}`;
    }

    return prompt;
  }

  private generateFromTemplate(request: GenerationRequest): GenerationResponse {
    // Template-based fallback for when LLM is unavailable
    const templates: Record<string, string> = {
      'web app': this.getWebAppTemplate(),
      'api': this.getAPITemplate(),
      'cli': this.getCLITemplate(),
      'default': this.getDefaultTemplate()
    };

    const prompt = request.prompt.toLowerCase();
    let template = templates.default;

    for (const [key, value] of Object.entries(templates)) {
      if (prompt.includes(key)) {
        template = value;
        break;
      }
    }

    return {
      content: template,
      tokens: 0,
      model: 'template-fallback'
    };
  }

  private getWebAppTemplate(): string {
    return `// Generated Web Application Template
import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(\`Server running at http://localhost:\${PORT}\`);
});`;
  }

  private getAPITemplate(): string {
    return `// Generated API Template
import express from 'express';

const app = express();
app.use(express.json());

app.get('/api/v1/status', (req, res) => {
  res.json({ status: 'operational' });
});

app.post('/api/v1/data', (req, res) => {
  res.json({ success: true, data: req.body });
});

export default app;`;
  }

  private getCLITemplate(): string {
    return `// Generated CLI Template
#!/usr/bin/env node

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node cli.js <command>');
  process.exit(1);
}

console.log('Executing command:', args[0]);`;
  }

  private getDefaultTemplate(): string {
    return `// Generated Application
// This is a template. Configure ANTHROPIC_API_KEY for AI-generated code.

function main() {
  console.log('Application started');
}

main();`;
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  getHistory() {
    return [...this.conversationHistory];
  }
}
