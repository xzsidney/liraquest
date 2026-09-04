import { FamilyDungeonScene } from '../server/models/index.js';

const SCENE_IMAGE_MAP = {
  // Masmorra 1: Covil do Goblin da Poeira
  'sotao_entrada': '/assets/dungeons/scenes/covil_sotao_entrada.jpg',
  'sala_arrombada': '/assets/dungeons/scenes/covil_sala_arrombada.jpg',
  'porta_travada_alerta': '/assets/dungeons/scenes/covil_porta_travada.jpg',
  'sala_infiltrada': '/assets/dungeons/scenes/covil_sala_arrombada.jpg',
  'fechadura_quebrada': '/assets/dungeons/scenes/covil_porta_travada.jpg',
  'sala_chave_mestra': '/assets/dungeons/scenes/covil_sotao_entrada.jpg',
  'armadilha_poeira': '/assets/dungeons/scenes/covil_porta_travada.jpg',
  'nevoa_poeira': '/assets/dungeons/covil_goblin_poeira.jpg',
  'piso_brinquedos': '/assets/dungeons/scenes/covil_sala_arrombada.jpg',
  'duelo_goblin': '/assets/dungeons/scenes/covil_duelo_goblin.jpg',
  'bau_tesouro_goblin': '/assets/dungeons/scenes/covil_bau_tesouro.jpg',

  // Masmorra 2: Torre do Devorador de Páginas
  'portao_biblioteca': '/assets/dungeons/torre_devorador_paginas.jpg',
  'escadaria_livros': '/assets/dungeons/torre_devorador_paginas.jpg',
  'sala_pergaminhos': '/assets/dungeons/torre_devorador_paginas.jpg',
  'confronto_devorador': '/assets/dungeons/torre_devorador_paginas.jpg',
  'bau_tomo_ancestral': '/assets/dungeons/torre_devorador_paginas.jpg',

  // Masmorra 3: Catacumbas da Procrastinação Eterna
  'catacumbas_entrada': '/assets/dungeons/catacumbas_procrastinacao.jpg',
  'pendulos_ampulheta': '/assets/dungeons/catacumbas_procrastinacao.jpg',
  'fosso_desculpas': '/assets/dungeons/catacumbas_procrastinacao.jpg',
  'espelho_desculpas': '/assets/dungeons/catacumbas_procrastinacao.jpg',
  'confronto_tita': '/assets/dungeons/catacumbas_procrastinacao.jpg',
  'tita_procrastinacao': '/assets/dungeons/catacumbas_procrastinacao.jpg',
  'bau_rubi_tempo': '/assets/dungeons/catacumbas_procrastinacao.jpg',
  'bau_tempo_conquistado': '/assets/dungeons/catacumbas_procrastinacao.jpg',
};

async function updateSceneImages() {
  try {
    console.log('🔄 Atualizando scene_image_url para todas as cenas...');

    for (const [code, imgUrl] of Object.entries(SCENE_IMAGE_MAP)) {
      const [affected] = await FamilyDungeonScene.update(
        { scene_image_url: imgUrl },
        { where: { scene_code: code } }
      );
      if (affected > 0) {
        console.log(`✅ Cena [${code}] vinculada à imagem: ${imgUrl}`);
      }
    }

    console.log('🎉 Todas as cenas do banco atualizadas com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao atualizar scene_image_url:', err);
    process.exit(1);
  }
}

updateSceneImages();
