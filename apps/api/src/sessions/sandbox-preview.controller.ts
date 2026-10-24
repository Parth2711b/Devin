import { Controller, Get, Param, Req, Res, NotFoundException } from '@nestjs/common';
import type { Request, Response } from 'express';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const MIME_MAP: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

@Controller('sessions/:sessionId/sandbox/preview')
export class SandboxPreviewController {
  @Get('*')
  async servePreview(
    @Param('sessionId') sessionId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const workspaceDir = path.resolve(process.cwd(), 'workspaces', sessionId);

    // Extract subpath from URL (everything after /preview)
    const previewPrefix = `/sessions/${sessionId}/sandbox/preview`;
    let subpath = req.path.replace(previewPrefix, '');
    if (!subpath || subpath === '/' || subpath === '') {
      subpath = '/index.html';
    }

    // Sanitize path against directory traversal
    const safeSubpath = path.normalize(subpath).replace(/^(\.\.[\/\\])+/, '');
    let targetFilePath = path.join(workspaceDir, safeSubpath);

    try {
      const stat = await fs.stat(targetFilePath);
      if (stat.isDirectory()) {
        targetFilePath = path.join(targetFilePath, 'index.html');
      }

      const content = await fs.readFile(targetFilePath);
      const ext = path.extname(targetFilePath).toLowerCase();
      const contentType = MIME_MAP[ext] || 'application/octet-stream';

      res.setHeader('Content-Type', contentType);
      return res.send(content);
    } catch {
      // If index.html wasn't found, check if there's any .html file in the workspace
      try {
        const files = await fs.readdir(workspaceDir);
        const htmlFile = files.find((f) => f.endsWith('.html'));
        if (htmlFile && subpath === '/index.html') {
          const content = await fs.readFile(path.join(workspaceDir, htmlFile));
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.send(content);
        }
      } catch {
        // Workspace doesn't exist yet
      }

      // Friendly fallback empty state HTML
      const emptyHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Sandbox Live Preview</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #0a0d14;
      color: #94a3b8;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
    }
    .card {
      background: #101522;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 32px;
      max-width: 440px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    .icon {
      font-size: 36px;
      margin-bottom: 16px;
      display: inline-block;
    }
    h2 {
      margin: 0 0 8px 0;
      color: #f8fafc;
      font-size: 18px;
    }
    p {
      margin: 0 0 16px 0;
      font-size: 13px;
      line-height: 1.6;
    }
    .tip {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #34d399;
      font-size: 12px;
      padding: 8px 12px;
      border-radius: 6px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🌐</div>
    <h2>No Web Preview Found</h2>
    <p>This workspace doesn't have an <code>index.html</code> yet.</p>
    <div class="tip">Ask Devin: "Create an index.html app with CSS and JavaScript"</div>
  </div>
</body>
</html>
      `;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(emptyHtml);
    }
  }
}
