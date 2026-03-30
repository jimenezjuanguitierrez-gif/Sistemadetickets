// scripts/dev.js
// Lanzador de desarrollo: arranca el servidor con nodemon y abre el navegador
// automáticamente en http://localhost:3000 cuando el servidor está listo.
//
// Uso: npm run dev

import { spawn, exec } from 'child_process';
import { platform }    from 'os';

const PORT = process.env.PORT || 3000;
const URL  = `http://localhost:${PORT}`;

// ─── Abrir el navegador según el sistema operativo ────────────────────────────
function openBrowser(url) {
  const cmds = {
    win32:  `start ${url}`,
    darwin: `open ${url}`,
    linux:  `xdg-open ${url}`,
  };
  const cmd = cmds[platform()] ?? cmds.linux;
  exec(cmd, (err) => {
    if (err) console.log(`\n  🌐 Abrí manualmente: ${url}\n`);
  });
}

// ─── Arrancar nodemon ─────────────────────────────────────────────────────────
const nodemon = spawn(
  'npx', ['nodemon', 'src/server.js'],
  {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
    env: { ...process.env },
  }
);

let browserOpened = false;

// Escuchar la salida de nodemon para detectar cuándo el servidor ya está listo
function handleOutput(chunk) {
  const line = chunk.toString();
  process.stdout.write(line);   // seguir mostrando los logs normalmente

  // El server.js imprime "running on port XXXX" cuando está listo
  if (!browserOpened && line.includes('running on port')) {
    browserOpened = true;
    setTimeout(() => {
      console.log(`\n  🌐 Abriendo ${URL} en el navegador…\n`);
      openBrowser(URL);
    }, 300); // pequeño delay para que el servidor termine de inicializar
  }
}

nodemon.stdout.on('data', handleOutput);
nodemon.stderr.on('data', handleOutput);   // nodemon usa stderr para algunos mensajes

nodemon.on('close', (code) => {
  process.exit(code ?? 0);
});

// Propagar Ctrl+C al proceso hijo limpiamente
process.on('SIGINT', () => {
  nodemon.kill('SIGINT');
});
process.on('SIGTERM', () => {
  nodemon.kill('SIGTERM');
});