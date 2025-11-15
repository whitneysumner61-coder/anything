# Deployment Guide

This guide explains how to deploy the Productivity Dashboard to various hosting platforms.

## Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications and is developed by the creators of Next.js.

### Deploy with Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to complete deployment

### Deploy with Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Import your GitHub repository
4. Vercel will automatically detect Next.js and configure settings
5. Click "Deploy"

Your app will be live at a vercel.app URL (e.g., `your-project.vercel.app`)

## Netlify

### Deploy with Netlify CLI

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Build your project:
```bash
npm run build
```

3. Deploy:
```bash
netlify deploy --prod
```

### Deploy with Netlify Dashboard

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Click "Deploy site"

## Docker

### Create a Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Build and run:

```bash
docker build -t productivity-dashboard .
docker run -p 3000:3000 productivity-dashboard
```

## Self-Hosting (Node.js Server)

### Requirements
- Node.js 18+ installed
- Process manager (PM2 recommended)

### Steps

1. Build the application:
```bash
npm run build
```

2. Install PM2:
```bash
npm install -g pm2
```

3. Start with PM2:
```bash
pm2 start npm --name "productivity-dashboard" -- start
```

4. Configure PM2 to start on boot:
```bash
pm2 startup
pm2 save
```

### Nginx Configuration (Optional)

If you want to use Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment Variables

This application doesn't require any environment variables by default. All data is stored in the browser's localStorage.

If you add features that require environment variables:

1. Create a `.env.local` file
2. Add your variables:
```
NEXT_PUBLIC_API_URL=https://api.example.com
```

3. Use in your code:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

## Build Output

The production build creates:
- Static HTML, CSS, and JavaScript files
- Optimized images and fonts
- Server-side rendering capabilities

## Performance Tips

1. Enable compression (gzip/brotli)
2. Use a CDN for static assets
3. Configure caching headers
4. Monitor performance with analytics

## Security Considerations

1. Always use HTTPS in production
2. Keep dependencies updated: `npm update`
3. Run security audits: `npm audit`
4. Configure proper CORS if adding API features

## Monitoring

Consider adding:
- Error tracking (Sentry, LogRocket)
- Analytics (Google Analytics, Plausible)
- Uptime monitoring (UptimeRobot, Pingdom)

## Troubleshooting

### Build Fails
- Clear cache: `rm -rf .next node_modules`
- Reinstall: `npm install`
- Rebuild: `npm run build`

### Port Already in Use
- Change port: `PORT=3001 npm start`

### Memory Issues
- Increase Node.js memory: `NODE_OPTIONS="--max-old-space-size=4096" npm run build`

## Support

For deployment issues, check:
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- Platform-specific documentation
- GitHub issues

---

Happy deploying! 🚀
