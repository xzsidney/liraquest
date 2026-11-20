// =============================================================================
// PERSONALITIES.JS - SINAIS, FRASES E CALIBRAÇÃO DE BOTECO DOS BOTS
// Tião (Parceiro leal), Zé Truqueiro (Agressivo/Blefador) e Tonho (Calculista)
// =============================================================================

export const BOT_SIGNALS = {
  zap: {
    emoji: '😉',
    name: 'Zap (Paus)',
    action: 'Piscar olho esquerdo',
    botPhrases: [
      "O tempo fechou por aqui...",
      "O gato miou alto agora!",
      "Tô sentindo um vento forte soprando..."
    ],
    playerPhrases: [
      "O tempo fechou de repente por aqui...",
      "O gato miou alto, hein parceiro!",
      "Tô sentindo a brisa forte..."
    ]
  },
  copeta: {
    emoji: '😚',
    name: 'Copeta (Copas)',
    action: 'Fazer biquinho',
    botPhrases: [
      "Esse café tá quente demais!",
      "O coração tá batendo acelerado...",
      "O doce tá bem no ponto!"
    ],
    playerPhrases: [
      "Esse café tá pelando de quente!",
      "Coração tá batendo acelerado nessa mão!",
      "O doce tá no ponto..."
    ]
  },
  espadilha: {
    emoji: '🤨',
    name: 'Espadilha (Espadas)',
    action: 'Erguer sobrancelha',
    botPhrases: [
      "O corte tá afiado hoje...",
      "A faca tá bem amolada!",
      "Tem espinho nessa roseira..."
    ],
    playerPhrases: [
      "O corte tá afiado por aqui...",
      "A faca tá nos trinques hoje!",
      "Espinho afiado nessa mão..."
    ]
  },
  picafumo: {
    emoji: '🤔',
    name: 'Picafumo (Ouros)',
    action: 'Coçar orelha / queixo',
    botPhrases: [
      "Coceira braba nessa orelha...",
      "Ouro de tolo não brilha!",
      "Fumo bom a gente pica devagar..."
    ],
    playerPhrases: [
      "Que coceira chata nessa orelha...",
      "Esse fumo tá bem picadinho...",
      "Ouro puro não perde o brilho!"
    ]
  },
  tres: {
    emoji: '😁',
    name: 'Três (3)',
    action: 'Sorriso maroto',
    botPhrases: [
      "O vento tá soprando a favor...",
      "Dente quebrado também morde!",
      "Tô rindo à toa nessa mão..."
    ],
    playerPhrases: [
      "O vento tá soprando a nosso favor, parceiro!",
      "Tô achando essa mão engraçada...",
      "Dente afiado pra morder!"
    ]
  },
  lixo: {
    emoji: '🥱',
    name: 'Mão Podre (Lixo)',
    action: 'Bocejo descarado',
    botPhrases: [
      "Devagar quase parando esse boteco...",
      "Deu uma canseira danada agora...",
      "Tá fraco esse movimento hoje..."
    ],
    playerPhrases: [
      "Que canseira braba... devagar esse boteco.",
      "Tô precisando de um café forte pra acordar...",
      "Vento fraco demais..."
    ]
  }
};

export const BOT_QUOTES = {
  truco: [
    "TRUUUUCO, MARRECO! Quero ver peito!",
    "TRUCO! Sai que essa é nossa!",
    "TRUCO! Tá sentindo a pressão do boteco?",
    "TRUCO! Corre enquanto dá tempo!",
    "Bate na mesa! TRUUUCO!"
  ],
  seis: [
    "MEIO PAU! SEEEEIS! Chora agora!",
    "SEIS! Aumenta que tá barato!",
    "SEIS! Achou que a gente tava de bobeira?"
  ],
  nove: [
    "NOOOOOVE! Agora o bicho pegou!",
    "NOVE! É pra estourar a mesa!",
    "NOVE! Quero ver segurar o rojão!"
  ],
  doze: [
    "DOOOOOZE! VALE O JOGO TODO!",
    "DOZE! Ou ganha ou chora na cama!"
  ],
  accept: [
    "Caiu na rede é peixe! Desce!",
    "Aceito! Bota carta na mesa!",
    "Tamo dentro! Não temos medo de assombração!",
    "Cai que tá bonito! Quero ver!",
    "Aceito com gosto de cana!"
  ],
  refuse: [
    "Essa passou raspando... Vamo correr!",
    "Leva essa merreca, na próxima te pego!",
    "Pode levar essa, tamo guardando o veneno.",
    "Corri! Não vou queimar vela com defunto ruim!"
  ],
  partnerAdviceStrong: [
    "Parceiro, tô com o ZAP engatilhado! Aceita com gosto!",
    "Tô armado até os dentes, parceiro! Manda ver!",
    "Pode aceitar, essa eu garanto pra nós!",
    "Tô forte, parceiro! Bate o pé e aceita!"
  ],
  partnerAdviceWeak: [
    "Parceiro, só veio lixo pra mim... cuidado aí!",
    "Minha mão tá um horror, parceiro! Se não tiver nada, corre!",
    "Tô desarmado, parceiro... a decisão é tua!",
    "Se você não tiver bicho grande, melhor correr dessa!"
  ],
  partnerAdviceMedium: [
    "Dá pra brigar, parceiro! Você que manda!",
    "Tenho uma carta boa guardada. O que você acha?",
    "Tô no meio termo, parceiro!"
  ],
  playZap: [
    "TOMA ESSE ZAP NA TESTA!",
    "O GATO MIAU! ZAAAP!",
    "Respeita a manilha de paus!"
  ],
  playStrong: [
    "Essa aqui fecha a conta!",
    "Pede a bênção pra essa carta!",
    "Aqui tem munição pesada!"
  ],
  playWeak: [
    "Toma um choro...",
    "Vou jogar essa porcariazinha.",
    "Deixa a poeira baixar..."
  ],
  partnerHelper: [
    "Boa jogada parceiro! Deixa que eu guardo a minha!",
    "Garantido, parceiro! Não vou gastar a minha à toa.",
    "Malandragem é tudo, parceiro!"
  ],
  winRound: [
    "Essa vaza já foi pra conta!",
    "Mais uma pra nossa dupla!",
    "Sentiram o peso da máquina?"
  ],
  loseRound: [
    "Foi só sorte de vocês, calma lá...",
    "Tão cantando de galo cedo...",
    "Ainda tem jogo, segura a onda!"
  ],
  winHand: [
    "Tentos no bolso! Chora, pato!",
    "A mão é nossa! Próxima!",
    "Quem tem garrafa vazia pra vender hoje são vocês!"
  ],
  loseHand: [
    "Deu ruim nessa... mas o jogo não acabou!",
    "Sorte de principiante, quero ver manter!",
    "Na próxima a gente pega vocês no pulo!"
  ],
  canga: [
    "CANGA! Ninguém leva, agora a fogueira esquentou!",
    "Empatou! Agora quem fizer a próxima leva tudo!"
  ],
  mao11Accept: [
    "Mão de 11 aceita! Essa a gente não perde!",
    "Nossa mão tá boa, vamo pro fight de 11!"
  ],
  mao11Refuse: [
    "Mão horrível... vamo correr da mão de 11.",
    "Com esse lixo? Melhor dar 1 ponto."
  ],
  tiaoPe: [
    "Tô no Pé, parceiro! Joga tranquilo que eu arremato no final!",
    "Tô fechando a vaza! Guarda o seu que o Pé é nosso!",
    "Deixa comigo que o Pé não perdoa nada!"
  ],
  tiaoParaPe: [
    "Tô de Para-Pé! Vou arrochar a maior pra sangrar o Pé deles!",
    "Vou forçar o Pé deles a queimar manilha pesada agora!",
    "No Para-Pé a gente bate firme pra espremer o adversário!"
  ],
  tiaoTieWin: [
    "Ganhamos a primeira, parceiro! Se amarrar na segunda a mão é nossa!",
    "Só empata a segunda que a mão fecha pra nós!",
    "Canga da vitória! Quem fez a primeira leva na amarração!"
  ],
  tiaoCangaAdvice: [
    "Cangou a primeira! Cai matando na segunda com a maior que tiver!",
    "Primeira empatou! Agora quem fizer a segunda leva a mão inteira!"
  ],
  enemyPe: [
    "Tô no Pé e aqui não passa nem mosquito!",
    "Pode vir que eu tô fechando a conta!",
    "O Pé é meu e a primeira vaza também!"
  ],
  enemyParaPe: [
    "Toma essa no Para-Pé pra sangrar o seu parceiro!",
    "Quero ver o Pé de vocês cobrir essa!"
  ],
  camaDeGatoSpring: [
    "Caiu feito pato na Cama de Gato! TOMA ESSE ZAP!",
    "Dormi na primeira pra te pegar na segunda! SEIS!",
    "Malandragem pura! A Cama de Gato tava armada!",
    "Achou que eu tava morto? O bicho acordou agora!"
  ],
  camaDeGatoTiao: [
    "Eles caíram na Cama de Gato direitinho, parceiro! Agora é caixa!",
    "Fingimos de morto e levamos a mão inteira!",
    "Essa foi a clássica Cama de Gato de boteco!"
  ],
  casalMaior: [
    "Tamo de Casal Maior, parceiro! Zap e Copeta engatilhados!",
    "Casal Maior na mesa! Ninguém bota o bico nessa mão!",
    "Com Zap e Copeta na mão, só chora quem tá do outro lado!"
  ],
  chamarSangue: [
    "Chamei sangue na mesa! Quero ver quem tem manilha pra cobrir!",
    "Botei esse 3 pra ver quem sangra manilha agora!",
    "Tirei o bicho grande da toca de vocês!"
  ],
  bluffTruco: [
    "TRUCO NA CARA! Quem não aguenta bebe leite!",
    "Se tiver coragem de aceitar, desce!",
    "Tô sentindo cheiro de medo do outro lado da mesa!"
  ],
  bluffRevealedWin: [
    "Correu de carta 4! Caiu no blefe do malandro!",
    "O cachorro não tinha dente e você correu de medo! Hahaha!",
    "Ganhei no grito! Essa foi puro blefe de boteco!"
  ],
  bluffCaught: [
    "Dessa vez o blefe não colou... mas valeu a tentativa!",
    "Peitou bonito! Tava só com lixo mesmo!",
    "O malandro também erra o tiro de vez em quando!"
  ],
  partnerSignalReplyTrueZap: [
    "Recebido alto e claro, parceiro! Se o Zap tá na tua mão, eu puxo a primeira no peito!",
    "O homem tá armado com a caneta de ouro! Pode deixar que eu dou cobertura!",
    "Piscadela de ouro! Essa mão não escapa de nós!"
  ],
  partnerSignalReplyTrueCopeta: [
    "Biquinho registrado! A Copeta é garantia de sucesso!",
    "Coração quente! Pode deixar que a gente fatura essa mão!",
    "Lindo sinal, parceiro! Tamo firme no jogo!"
  ],
  partnerSignalReplyTrueEspadilha: [
    "Sobrancelha empinada! Espadilha na manga, vamo pra cima!",
    "A faca tá amolada! Deixa que eu empurro a primeira!"
  ],
  partnerSignalReplyTruePicafumo: [
    "Coçou a orelha, o Picafumo tá pronto! Bota pra moer!",
    "Ouro na mão! Tamo bem servido nessa vaza!"
  ],
  partnerSignalReplyTrueTres: [
    "Sorrisinho maroto! Com o 3 na mão a gente aperta eles!",
    "Dente afiado! Manda bala!"
  ],
  partnerSignalReplyTrueLixo: [
    "Fica tranquilo, parceiro! Guarda o choro que eu tento puxar no braço!",
    "Canseira registrada! Descansa que eu assumo a bronca!",
    "Segura o lixo na maciota que eu resolvo!"
  ],
  partnerSignalReplyBluff: [
    "Blefando até pra mim, parceiro? Hahaha, essa malandragem é de primeira!",
    "Piscando sem ter o bicho? Se colar colou, tamo junto!",
    "Ih, fingiu o sinal na cara dura! Malandro de boteco é assim mesmo!"
  ],
  enemyInterceptAlert: [
    "Tô de olho nesses sinais aí do outro lado! Aqui ninguém é bobo não!",
    "Piscou pra quê? Tá achando que eu não vi essa cara?",
    "Fez biquinho pro garçom ou pro parceiro? Sei bem o que é isso!",
    "Coçando a orelha desse jeito... não vem com historinha que aqui tem malandro velho!"
  ],
  enemyPartnerAck: [
    "Entendido o recado, parceiro!",
    "Tô na cobertura, deixa vir!",
    "Vi o sinal, pode deixar comigo!",
    "Copiado e anotado!"
  ]
};

export const BOT_PERSONALITIES = {
  tiao: {
    id: 'bot_partner',
    name: 'Tião',
    role: 'Parceiro',
    loyalty: 1.0,
    bluffTolerance: 0.1,
    aggressiveness: 0.6,
    cautious: 0.8
  },
  ze: {
    id: 'bot_left',
    name: 'Zé Truqueiro',
    role: 'Adversário',
    loyalty: 0.0,
    bluffTolerance: 0.7,
    aggressiveness: 0.95,
    cautious: 0.2
  },
  tonho: {
    id: 'bot_right',
    name: 'Tonho',
    role: 'Adversário',
    loyalty: 0.0,
    bluffTolerance: 0.3,
    aggressiveness: 0.45,
    cautious: 0.9
  }
};
