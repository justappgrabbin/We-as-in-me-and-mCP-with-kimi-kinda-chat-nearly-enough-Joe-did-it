import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const distDir = new URL('../dist/', import.meta.url);
await mkdir(distDir, { recursive: true });

const engineSource = existsSync(new URL('../MRNN_Neural_Engine.js', import.meta.url))
  ? await readFile(new URL('../MRNN_Neural_Engine.js', import.meta.url), 'utf8')
  : '// MRNN engine pending implementation.\n';

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>MRNN System Scaffold</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0b0f19; color: #f8fafc; }
      main { max-width: 760px; padding: 48px; }
      code { color: #93c5fd; }
    </style>
  </head>
  <body>
    <main>
      <h1>MRNN System Scaffold Online</h1>
      <p>The 24-node scaffold build completed and produced a deployable static artifact.</p>
      <p>Status: <code>ready-for-secrets</code></p>
    </main>
    <script type="module" src="./MRNN_Neural_Engine.js"></script>
  </body>
</html>
`;

await writeFile(new URL('index.html', distDir), html);
await writeFile(new URL('MRNN_Neural_Engine.js', distDir), engineSource);
console.log('Built dist scaffold.');
