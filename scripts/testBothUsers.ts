import { Sequelize } from 'sequelize';

async function testAll() {
  console.log('--- TESTE 1: sidmax no banco liraquest ---');
  const seqSidmax = new Sequelize('u328169675_liraquest', 'u328169675_sidmax', 'XZspl5127912', {
    host: '193.203.175.233',
    port: 3306,
    dialect: 'mysql',
    logging: false,
  });
  try {
    await seqSidmax.authenticate();
    console.log('✅ SUCESSO: sidmax CONECTOU no banco liraquest!');
  } catch (err: any) {
    console.log('❌ FALHA sidmax:', err.message);
  }

  console.log('\n--- TESTE 2: xzsidney no banco liraquest ---');
  const seqXz = new Sequelize('u328169675_liraquest', 'u328169675_xzsidney', 'XZspl5127912', {
    host: '193.203.175.233',
    port: 3306,
    dialect: 'mysql',
    logging: false,
  });
  try {
    await seqXz.authenticate();
    console.log('✅ SUCESSO: xzsidney CONECTOU no banco liraquest!');
  } catch (err: any) {
    console.log('❌ FALHA xzsidney:', err.message);
  }

  process.exit(0);
}

testAll();
