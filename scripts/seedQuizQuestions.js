import { sequelize } from '../server/config/database.js';
import { FamilyQuizQuestion, FamilyQuizOption } from '../server/models/index.js';

const questionsData = [
  // =========================================================================
  // FUNDAMENTAL 1 (Primário - 1º ao 5º ano)
  // =========================================================================
  {
    question_text: 'Quanto é 7 × 8?',
    discipline: 'matematica',
    education_stage: 'fundamental_1',
    school_year: '3_ao_5_ano',
    difficulty_level: 2,
    explanation: '7 vezes 8 é igual a 56 (tabuada do 7 e do 8).',
    options: [
      { option_text: '56', is_correct: true },
      { option_text: '54', is_correct: false },
      { option_text: '48', is_correct: false },
      { option_text: '64', is_correct: false },
    ],
  },
  {
    question_text: 'Quanto é 25 + 18?',
    discipline: 'matematica',
    education_stage: 'fundamental_1',
    school_year: '1_ao_3_ano',
    difficulty_level: 1,
    explanation: '25 + 18 = 43 (25 + 10 = 35, 35 + 8 = 43).',
    options: [
      { option_text: '43', is_correct: true },
      { option_text: '41', is_correct: false },
      { option_text: '45', is_correct: false },
      { option_text: '33', is_correct: false },
    ],
  },
  {
    question_text: 'Qual é o maior planeta do nosso Sistema Solar?',
    discipline: 'ciencias',
    education_stage: 'fundamental_1',
    school_year: '3_ao_5_ano',
    difficulty_level: 2,
    explanation: 'Júpiter é o maior planeta do Sistema Solar, sendo um gigante gasoso.',
    options: [
      { option_text: 'Júpiter', is_correct: true },
      { option_text: 'Marte', is_correct: false },
      { option_text: 'Saturno', is_correct: false },
      { option_text: 'Terra', is_correct: false },
    ],
  },
  {
    question_text: 'Qual é o antônimo da palavra "CORAJOSO"?',
    discipline: 'portugues',
    education_stage: 'fundamental_1',
    school_year: '1_ao_3_ano',
    difficulty_level: 1,
    explanation: 'Antônimo é a palavra de sentido oposto. O oposto de corajoso é medroso ou covarde.',
    options: [
      { option_text: 'Medroso', is_correct: true },
      { option_text: 'Forte', is_correct: false },
      { option_text: 'Bravo', is_correct: false },
      { option_text: 'Esperto', is_correct: false },
    ],
  },
  {
    question_text: 'Qual animal abaixo é um mamífero aquático?',
    discipline: 'ciencias',
    education_stage: 'fundamental_1',
    school_year: '2_ao_4_ano',
    difficulty_level: 2,
    explanation: 'A baleia e o golfinho respiram ar por pulmões e amamentam seus filhotes.',
    options: [
      { option_text: 'Baleia', is_correct: true },
      { option_text: 'Tubarão', is_correct: false },
      { option_text: 'Polvo', is_correct: false },
      { option_text: 'Tartaruga', is_correct: false },
    ],
  },
  {
    question_text: 'Complete a sequência lógica: 3, 6, 9, 12, ___',
    discipline: 'matematica',
    education_stage: 'fundamental_1',
    school_year: '2_ao_4_ano',
    difficulty_level: 1,
    explanation: 'A sequência cresce de 3 em 3. 12 + 3 = 15.',
    options: [
      { option_text: '15', is_correct: true },
      { option_text: '14', is_correct: false },
      { option_text: '16', is_correct: false },
      { option_text: '18', is_correct: false },
    ],
  },
  {
    question_text: 'Qual é o plural correto da palavra "TROFÉU"?',
    discipline: 'portugues',
    education_stage: 'fundamental_1',
    school_year: '3_ao_5_ano',
    difficulty_level: 3,
    explanation: 'Palavras terminadas em ditongo oral como "troféu" fazem plural com "s": troféus.',
    options: [
      { option_text: 'Troféus', is_correct: true },
      { option_text: 'Troféis', is_correct: false },
      { option_text: 'Trofeuzes', is_correct: false },
      { option_text: 'Troféos', is_correct: false },
    ],
  },

  // =========================================================================
  // FUNDAMENTAL 2 (6º ao 9º ano)
  // =========================================================================
  {
    question_text: 'Qual é a raiz quadrada de 144?',
    discipline: 'matematica',
    education_stage: 'fundamental_2',
    school_year: '6_ao_8_ano',
    difficulty_level: 3,
    explanation: '12 × 12 = 144, logo a raiz quadrada de 144 é 12.',
    options: [
      { option_text: '12', is_correct: true },
      { option_text: '14', is_correct: false },
      { option_text: '11', is_correct: false },
      { option_text: '16', is_correct: false },
    ],
  },
  {
    question_text: 'Qual é o valor de x na equação: 2x + 6 = 18?',
    discipline: 'matematica',
    education_stage: 'fundamental_2',
    school_year: '7_ao_9_ano',
    difficulty_level: 4,
    explanation: '2x = 18 - 6 => 2x = 12 => x = 6.',
    options: [
      { option_text: '6', is_correct: true },
      { option_text: '8', is_correct: false },
      { option_text: '12', is_correct: false },
      { option_text: '4', is_correct: false },
    ],
  },
  {
    question_text: 'Qual é a capital da Austrália?',
    discipline: 'geografia',
    education_stage: 'fundamental_2',
    school_year: '6_ao_8_ano',
    difficulty_level: 4,
    explanation: 'Canberra é a capital federal da Austrália, embora Sydney e Melbourne sejam mais populosas.',
    options: [
      { option_text: 'Canberra', is_correct: true },
      { option_text: 'Sydney', is_correct: false },
      { option_text: 'Melbourne', is_correct: false },
      { option_text: 'Auckland', is_correct: false },
    ],
  },
  {
    question_text: '"Seus olhos eram faróis na noite escura." Que figura de linguagem está presente?',
    discipline: 'portugues',
    education_stage: 'fundamental_2',
    school_year: '8_ao_9_ano',
    difficulty_level: 4,
    explanation: 'Metáfora é uma comparação implícita, sem o uso de conectivos comparativos como "como".',
    options: [
      { option_text: 'Metáfora', is_correct: true },
      { option_text: 'Metonímia', is_correct: false },
      { option_text: 'Hipérbole', is_correct: false },
      { option_text: 'Ironia', is_correct: false },
    ],
  },
  {
    question_text: 'Qual gás é essencial para a respiração humana celular?',
    discipline: 'ciencias',
    education_stage: 'fundamental_2',
    school_year: '6_ao_8_ano',
    difficulty_level: 3,
    explanation: 'O oxigênio (O₂) é utilizado pelas mitocôndrias na respiração celular aeróbica.',
    options: [
      { option_text: 'Oxigênio (O₂)', is_correct: true },
      { option_text: 'Gás Carbônico (CO₂)', is_correct: false },
      { option_text: 'Nitrogênio (N₂)', is_correct: false },
      { option_text: 'Hélio (He)', is_correct: false },
    ],
  },
  {
    question_text: 'Em que ano ocorreu a Proclamação da Independência do Brasil?',
    discipline: 'historia',
    education_stage: 'fundamental_2',
    school_year: '7_ao_9_ano',
    difficulty_level: 3,
    explanation: 'Dom Pedro I proclamou a independência às margens do riacho Ipiranga em 7 de setembro de 1822.',
    options: [
      { option_text: '1822', is_correct: true },
      { option_text: '1889', is_correct: false },
      { option_text: '1500', is_correct: false },
      { option_text: '1808', is_correct: false },
    ],
  },

  // =========================================================================
  // ENSINO MÉDIO
  // =========================================================================
  {
    question_text: 'Qual é o valor do seno de 30°?',
    discipline: 'matematica',
    education_stage: 'ensino_medio',
    school_year: '1_ao_2_ano_medio',
    difficulty_level: 5,
    explanation: 'Pela tabela dos ângulos notáveis da trigonometria, sen(30°) = 1/2 = 0,5.',
    options: [
      { option_text: '1/2', is_correct: true },
      { option_text: '√3/2', is_correct: false },
      { option_text: '√2/2', is_correct: false },
      { option_text: '1', is_correct: false },
    ],
  },
  {
    question_text: 'Qual organela celular é a principal responsável pela produção de ATP?',
    discipline: 'ciencias',
    education_stage: 'ensino_medio',
    school_year: '1_ano_medio',
    difficulty_level: 5,
    explanation: 'A mitocôndria realiza o ciclo de Krebs e a cadeia respiratória fosforilativa.',
    options: [
      { option_text: 'Mitocôndria', is_correct: true },
      { option_text: 'Ribossomo', is_correct: false },
      { option_text: 'Complexo de Golgi', is_correct: false },
      { option_text: 'Lisossomo', is_correct: false },
    ],
  },
  {
    question_text: 'De acordo com a 1ª Lei de Newton (Inércia), um corpo em repouso tende a:',
    discipline: 'ciencias',
    education_stage: 'ensino_medio',
    school_year: '1_ao_3_ano_medio',
    difficulty_level: 5,
    explanation: 'A matéria resiste à alteração de seu estado de movimento se a força resultante for nula.',
    options: [
      { option_text: 'Permanecer em repouso', is_correct: true },
      { option_text: 'Acelerar espontaneamente', is_correct: false },
      { option_text: 'Perder massa', is_correct: false },
      { option_text: 'Girar em torno do centro', is_correct: false },
    ],
  },
  {
    question_text: 'Quem é o autor da obra-prima do Realismo brasileiro "Dom Casmurro"?',
    discipline: 'portugues',
    education_stage: 'ensino_medio',
    school_year: '2_ao_3_ano_medio',
    difficulty_level: 4,
    explanation: 'Machado de Assis publicou Dom Casmurro em 1899 narrando a história de Bentinho e Capitu.',
    options: [
      { option_text: 'Machado de Assis', is_correct: true },
      { option_text: 'José de Alencar', is_correct: false },
      { option_text: 'Aluísio Azevedo', is_correct: false },
      { option_text: 'Castro Alves', is_correct: false },
    ],
  },
  {
    question_text: 'Qual é o valor de log₁₀(10.000)?',
    discipline: 'matematica',
    education_stage: 'ensino_medio',
    school_year: '2_ao_3_ano_medio',
    difficulty_level: 6,
    explanation: '10⁴ = 10.000, logo log₁₀(10.000) = 4.',
    options: [
      { option_text: '4', is_correct: true },
      { option_text: '3', is_correct: false },
      { option_text: '5', is_correct: false },
      { option_text: '10', is_correct: false },
    ],
  },

  // =========================================================================
  // ENSINO SUPERIOR (Faculdade)
  // =========================================================================
  {
    question_text: 'Qual é a derivada de f(x) = x³ - 5x + 4 em relação a x?',
    discipline: 'matematica',
    education_stage: 'superior',
    school_year: 'faculdade',
    difficulty_level: 7,
    explanation: 'Pela regra da potência: d/dx(xⁿ) = n·xⁿ⁻¹. Logo f\'(x) = 3x² - 5.',
    options: [
      { option_text: '3x² - 5', is_correct: true },
      { option_text: '3x² - 5x', is_correct: false },
      { option_text: 'x² - 5', is_correct: false },
      { option_text: '3x³ - 5', is_correct: false },
    ],
  },
  {
    question_text: 'Na lógica proposicional, a negação de "Todos os computadores são rápidos" é:',
    discipline: 'logica_geral',
    education_stage: 'superior',
    school_year: 'faculdade',
    difficulty_level: 7,
    explanation: 'A negação do quantificador universal "Todo A é B" é o particular "Pelo menos um A não é B".',
    options: [
      { option_text: 'Existe ao menos um computador que não é rápido', is_correct: true },
      { option_text: 'Nenhum computador é rápido', is_correct: false },
      { option_text: 'Todos os computadores são lentos', is_correct: false },
      { option_text: 'A maioria dos computadores não é rápida', is_correct: false },
    ],
  },
  {
    question_text: 'Qual é a probabilidade de se obter soma 7 no lançamento de dois dados perfeitos de 6 faces?',
    discipline: 'matematica',
    education_stage: 'superior',
    school_year: 'faculdade',
    difficulty_level: 8,
    explanation: 'São 6 combinações favoráveis (1+6, 2+5, 3+4, 4+3, 5+2, 6+1) em 36 possíveis: 6/36 = 1/6.',
    options: [
      { option_text: '1/6', is_correct: true },
      { option_text: '1/12', is_correct: false },
      { option_text: '7/36', is_correct: false },
      { option_text: '1/8', is_correct: false },
    ],
  },
  {
    question_text: 'Na ciência da computação, qual estrutura de dados opera sob o princípio LIFO (Last-In, First-Out)?',
    discipline: 'logica_geral',
    education_stage: 'superior',
    school_year: 'faculdade',
    difficulty_level: 6,
    explanation: 'Uma Pilha (Stack) é LIFO, onde o último elemento inserido é o primeiro a ser removido.',
    options: [
      { option_text: 'Pilha (Stack)', is_correct: true },
      { option_text: 'Fila (Queue)', is_correct: false },
      { option_text: 'Árvore Binária', is_correct: false },
      { option_text: 'Grafo Conexo', is_correct: false },
    ],
  },
  {
    question_text: 'O que mede o PIB (Produto Interno Bruto) de uma nação?',
    discipline: 'geral',
    education_stage: 'superior',
    school_year: 'faculdade',
    difficulty_level: 7,
    explanation: 'O PIB é a soma de todos os bens e serviços finais produzidos em um país em dado período.',
    options: [
      { option_text: 'A soma de todos os bens e serviços finais produzidos', is_correct: true },
      { option_text: 'O saldo total de reservas cambiais em dólares', is_correct: false },
      { option_text: 'A riqueza média por habitante descontada a inflação', is_correct: false },
      { option_text: 'A receita de impostos arrecadada pelo governo federal', is_correct: false },
    ],
  },
  {
    question_text: 'Qual protocolo de rede adiciona criptografia TLS/SSL sobre o protocolo HTTP tradicional?',
    discipline: 'logica_geral',
    education_stage: 'superior',
    school_year: 'faculdade',
    difficulty_level: 6,
    explanation: 'HTTPS (HyperText Transfer Protocol Secure) criptografa a comunicação entre cliente e servidor.',
    options: [
      { option_text: 'HTTPS (porta 443)', is_correct: true },
      { option_text: 'FTP (porta 21)', is_correct: false },
      { option_text: 'SSH (porta 22)', is_correct: false },
      { option_text: 'SMTP (porta 25)', is_correct: false },
    ],
  },
];

async function seed() {
  try {
    console.log('🌱 Iniciando carga de perguntas educativas (Primário à Faculdade)...');

    for (const q of questionsData) {
      // Evitar duplicidade pelo question_text
      const [question, created] = await FamilyQuizQuestion.findOrCreate({
        where: { question_text: q.question_text },
        defaults: {
          discipline: q.discipline,
          education_stage: q.education_stage,
          school_year: q.school_year,
          difficulty_level: q.difficulty_level,
          explanation: q.explanation,
          is_active: true,
        },
      });

      if (created) {
        for (const opt of q.options) {
          await FamilyQuizOption.create({
            question_id: question.id,
            option_text: opt.option_text,
            is_correct: opt.is_correct,
          });
        }
        console.log(`  ➕ [${q.education_stage.toUpperCase()}] Adicionada: "${q.question_text}" com 4 alternativas.`);
      } else {
        console.log(`  ℹ️ [${q.education_stage.toUpperCase()}] Já existente: "${q.question_text}".`);
      }
    }

    console.log('✅ Seed de perguntas concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante o seed de perguntas:', error);
    process.exit(1);
  }
}

seed();
