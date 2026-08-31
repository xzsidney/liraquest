import sequelize from '../server/config/database';
import { User, FamilyCharacter } from '../server/models';
import bcrypt from 'bcryptjs';

async function seedUser() {
  try {
    console.log('🔄 Conectando ao MySQL da Hostinger...');
    await sequelize.authenticate();

    const email = 'xzsidney@yahoo.com.br';
    let user = await User.findOne({ where: { email } });

    const hashedPassword = await bcrypt.hash('XZ@spl5127912', 10);

    if (!user) {
      console.log(`🌱 Criando usuário ${email} no banco da Hostinger...`);
      user = await User.create({
        name: 'Sidney Lira',
        email,
        password: hashedPassword,
        role: 'LIRA',
      });
      console.log('✅ Usuário criado com sucesso! ID:', user.id);
    } else {
      console.log(`🔄 Atualizando senha do usuário ${email}...`);
      user.password = hashedPassword;
      user.role = 'LIRA';
      await user.save();
      console.log('✅ Usuário atualizado com sucesso!');
    }

    // Vincula os heróis existentes ao usuário Sidney
    console.log('🔄 Vinculando heróis ao perfil do Sidney...');
    await FamilyCharacter.update(
      { userId: user.id },
      { where: { userId: null } }
    );
    console.log('✅ Todos os heróis vinculados com sucesso ao usuário Sidney!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

seedUser();
