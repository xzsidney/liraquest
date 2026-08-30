import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 [LiraQuest] Inicializando servidor Node.js...');

const tsxPath = path.resolve(__dirname, 'node_modules/.bin/tsx');
const serverScript = path.resolve(__dirname, 'server.ts');

const child = spawn('npx', ['tsx', serverScript], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

child.on('error', (err) => {
  console.error('❌ Erro ao iniciar processo LiraQuest:', err);
});

child.on('exit', (code) => {
  console.log(`🏰 Processo LiraQuest encerrado com código: ${code}`);
});
