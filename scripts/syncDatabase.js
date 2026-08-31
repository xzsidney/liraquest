import bcrypt from 'bcryptjs';
import { sequelize } from '../server/config/database.js';
import { FamilyUser } from '../server/models/FamilyUser.js';

async function syncAndSeed() {
  try {
    console.log('🔄 [LiraQuest] Conectando ao MySQL da Hostinger e sincronizando esquema...');

    // Sincronização aditiva (sem force, protegendo dados existentes)
    await FamilyUser.sync({ alter: true });
    console.log('✅ Tabela "family_users" sincronizada com sucesso!');

    // Criar usuários de demonstração se não existirem
    const defaultUsers = [
      {
        name: 'Mestre Administrador',
        email: 'admin@liraquest.com',
        password: 'admin123',
        role: 'ADMIN',
      },
      {
        name: 'Guardião Sidney (Pai)',
        email: 'pai@liraquest.com',
        password: 'pai123',
        role: 'PARENT',
      },
      {
        name: 'Jovem Herói Davi (Filho)',
        email: 'filho@liraquest.com',
        password: 'filho123',
        role: 'CHILD',
      },
    ];

    for (const u of defaultUsers) {
      const exists = await FamilyUser.findOne({ where: { email: u.email } });
      if (!exists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(u.password, salt);
        await FamilyUser.create({
          name: u.name,
          email: u.email,
          password: hashedPassword,
          role: u.role,
        });
        console.log(`👤 Usuário de demonstração criado: ${u.email} (Perfil: ${u.role})`);
      } else {
        console.log(`ℹ️ Usuário ${u.email} já existe no banco.`);
      }
    }

    console.log('🎉 Sincronização e seeds finalizados com sucesso no banco da Hostinger!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante a sincronização:', error);
    process.exit(1);
  }
}

syncAndSeed();
