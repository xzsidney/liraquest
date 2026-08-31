import { Sequelize } from 'sequelize';

const testSeq = new Sequelize('u328169675_rpgnew', 'u328169675_sidmax', 'XZspl5127912', {
  host: '193.203.175.233',
  port: 3306,
  dialect: 'mysql',
  logging: false,
});

async function run() {
  try {
    console.log('🔄 Testando com credenciais da outra aplicação (sidmax no rpgnew)...');
    await testSeq.authenticate();
    console.log('✅ CONECTOU COM SUCESSO na Hostinger!');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Falha:', err.message);
    process.exit(1);
  }
}

run();
