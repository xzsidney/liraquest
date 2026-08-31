import { Sequelize } from 'sequelize';

async function testVariations() {
  const tests = [
    { user: 'u328169675_xzsidneypl', pass: 'XZ@spl5127912', label: 'xzsidneypl + XZ@spl5127912' },
    { user: 'u328169675_xzsidney', pass: 'XZ@spl5127912', label: 'xzsidney + XZ@spl5127912' },
    { user: 'u328169675_xzsidneypl', pass: 'XZspl5127912', label: 'xzsidneypl + XZspl5127912' },
  ];

  for (const t of tests) {
    console.log(`\n🔄 Testando: ${t.label}...`);
    const seq = new Sequelize('u328169675_liraquest', t.user, t.pass, {
      host: '193.203.175.233',
      port: 3306,
      dialect: 'mysql',
      logging: false,
    });
    try {
      await seq.authenticate();
      console.log(`🎉 SUCESSO ABSOLUTO! Conectado com: ${t.label}`);
      
      const [tables] = await seq.query('SHOW TABLES;');
      console.log('📋 Tabelas existentes no banco:', tables);
    } catch (err: any) {
      console.log(`❌ Erro em ${t.label}:`, err.message);
    }
  }

  process.exit(0);
}

testVariations();
