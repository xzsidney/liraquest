import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('E:/11_Games/LiraQuest/src');

function cleanDirectory(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      cleanDirectory(fullPath);
    } else if (entry.isFile()) {
      // Se for um arquivo .vue.js, apaga
      if (entry.name.endsWith('.vue.js')) {
        console.log(`🗑️ Removendo arquivo compilado: ${fullPath}`);
        fs.unlinkSync(fullPath);
      }
      // Se for um .js e existir um .ts com mesmo nome (exceto .d.ts)
      else if (entry.name.endsWith('.js') && !entry.name.endsWith('.d.ts')) {
        const tsPath = fullPath.replace(/\.js$/, '.ts');
        if (fs.existsSync(tsPath)) {
          console.log(`🗑️ Removendo .js duplicado com .ts: ${fullPath}`);
          fs.unlinkSync(fullPath);
        }
      }
    }
  }
}

console.log('🧹 Limpando arquivos .js / .vue.js residuais da pasta src/...');
cleanDirectory(srcDir);
console.log('✅ Limpeza concluída com sucesso!');
