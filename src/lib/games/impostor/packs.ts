import type { PackWord, WordPack } from "./types";

type RawPack = {
  id: string;
  name: string;
  emoji: string;
  words: string[];
  /** Palavras mais difíceis de blefar/adivinhar. O resto entra como fácil. */
  hard?: string[];
};

const RAW_PACKS: RawPack[] = [
  {
    id: "lugares",
    name: "Lugares",
    emoji: "📍",
    words: [
      "Praia", "Aeroporto", "Hospital", "Escola", "Shopping", "Cinema",
      "Academia", "Padaria", "Igreja", "Delegacia", "Zoológico", "Museu",
      "Estádio de futebol", "Parque de diversões", "Biblioteca", "Banco",
      "Salão de beleza", "Posto de gasolina", "Supermercado", "Cemitério",
      "Hotel", "Rodoviária", "Fazenda", "Floresta", "Deserto",
      "Navio de cruzeiro", "Estação de metrô", "Consultório do dentista",
      "Camping", "Boate", "Caverna", "Submarino", "Estação espacial",
      "Castelo", "Farmácia",
    ],
    hard: [
      "Cemitério", "Caverna", "Submarino", "Estação espacial", "Castelo",
      "Deserto", "Rodoviária", "Consultório do dentista",
    ],
  },
  {
    id: "comidas",
    name: "Comidas e bebidas",
    emoji: "🍕",
    words: [
      "Pizza", "Feijoada", "Sushi", "Hambúrguer", "Brigadeiro", "Churrasco",
      "Lasanha", "Coxinha", "Açaí", "Pastel de feira", "Pão de queijo",
      "Tapioca", "Strogonoff", "Moqueca", "Pamonha", "Cuscuz", "Macarrão",
      "Sorvete", "Pudim", "Bolo de cenoura", "Café", "Chimarrão", "Guaraná",
      "Caipirinha", "Suco de laranja", "Vinho", "Cerveja", "Milkshake",
      "Salada", "Pipoca", "Chocolate quente", "Canjica", "Vatapá", "Esfirra",
      "Mousse de maracujá",
    ],
    hard: [
      "Moqueca", "Pamonha", "Canjica", "Vatapá", "Esfirra", "Chimarrão",
      "Cuscuz", "Mousse de maracujá",
    ],
  },
  {
    id: "animais",
    name: "Animais",
    emoji: "🦁",
    words: [
      "Cachorro", "Gato", "Elefante", "Girafa", "Tubarão", "Pinguim",
      "Capivara", "Onça-pintada", "Tucano", "Formiga", "Abelha", "Golfinho",
      "Morcego", "Camaleão", "Canguru", "Preguiça", "Lobo", "Coruja",
      "Polvo", "Cavalo", "Porco", "Galinha", "Jacaré", "Cobra", "Baleia",
      "Urso-polar", "Panda", "Macaco", "Tatu", "Papagaio", "Tartaruga",
      "Escorpião", "Raposa", "Águia", "Peixe-palhaço",
    ],
    hard: [
      "Camaleão", "Tatu", "Escorpião", "Morcego", "Onça-pintada", "Polvo",
      "Peixe-palhaço", "Preguiça",
    ],
  },
  {
    id: "profissoes",
    name: "Profissões",
    emoji: "👷",
    words: [
      "Médico", "Professor", "Programador", "Piloto de avião", "Bombeiro",
      "Policial", "Chef de cozinha", "Advogado", "Dentista", "Jornalista",
      "Motorista de app", "Entregador", "Pedreiro", "Eletricista", "Faxineiro",
      "Cantor", "Ator", "Jogador de futebol", "Árbitro", "Astronauta",
      "Padre", "Fotógrafo", "Barbeiro", "Veterinário", "Enfermeiro",
      "Garçom", "Vendedor de loja", "Caixa de supermercado", "Youtuber",
      "DJ", "Síndico", "Contador", "Arquiteto", "Agricultor", "Segurança",
    ],
    hard: [
      "Síndico", "Contador", "Árbitro", "Astronauta", "Arquiteto",
      "Agricultor", "Fotógrafo", "Veterinário",
    ],
  },
  {
    id: "objetos",
    name: "Objetos de casa",
    emoji: "🪑",
    words: [
      "Geladeira", "Micro-ondas", "Chuveiro", "Vaso sanitário", "Sofá",
      "Travesseiro", "Escova de dentes", "Controle remoto", "Liquidificador",
      "Ventilador", "Ar-condicionado", "Espelho", "Tapete", "Cortina",
      "Panela de pressão", "Ferro de passar", "Máquina de lavar", "Vassoura",
      "Abajur", "Despertador", "Carregador de celular", "Churrasqueira",
      "Guarda-roupa", "Tábua de passar", "Garrafa térmica", "Aspirador de pó",
      "Cafeteira", "Varal", "Fogão", "Pia", "Escada", "Lixeira",
      "Cadeira de praia",
    ],
    hard: [
      "Abajur", "Varal", "Tábua de passar", "Garrafa térmica",
      "Panela de pressão", "Aspirador de pó", "Cortina", "Escada",
    ],
  },
  {
    id: "esportes",
    name: "Esportes",
    emoji: "⚽",
    words: [
      "Futebol", "Vôlei", "Basquete", "Natação", "Surfe", "Skate", "Judô",
      "Boxe", "MMA", "Tênis", "Ping-pong", "Fórmula 1", "Ciclismo",
      "Maratona", "Escalada", "Ginástica olímpica", "Handebol", "Golfe",
      "Beisebol", "Futebol americano", "Xadrez", "Esgrima", "Hipismo",
      "Arco e flecha", "Paraquedismo", "Canoagem", "Patinação no gelo",
      "Rugby", "Crossfit", "Vôlei de praia", "Sinuca", "Bocha", "Parkour",
    ],
    hard: [
      "Esgrima", "Hipismo", "Canoagem", "Bocha", "Parkour", "Rugby",
      "Beisebol", "Patinação no gelo",
    ],
  },
  {
    id: "filmes",
    name: "Filmes e séries",
    emoji: "🎬",
    words: [
      "Titanic", "Vingadores", "Harry Potter", "Senhor dos Anéis", "Matrix",
      "Jurassic Park", "Rei Leão", "Toy Story", "Frozen", "Shrek",
      "Velozes e Furiosos", "Batman", "Homem-Aranha", "Star Wars", "Avatar",
      "Breaking Bad", "Stranger Things", "Round 6", "La Casa de Papel",
      "Game of Thrones", "The Office", "Friends", "Chaves", "Tropa de Elite",
      "Cidade de Deus", "Auto da Compadecida", "Minha Mãe é uma Peça",
      "O Poderoso Chefão", "Pantera Negra", "Divertida Mente", "Coringa",
      "Procurando Nemo", "Carros", "Os Simpsons",
    ],
    hard: [
      "Auto da Compadecida", "O Poderoso Chefão", "Cidade de Deus",
      "The Office", "Round 6", "Matrix", "Divertida Mente",
    ],
  },
  {
    id: "brasil",
    name: "Brasil",
    emoji: "🇧🇷",
    words: [
      "Carnaval", "Cristo Redentor", "Pelé", "Samba", "Funk", "Sertanejo",
      "Novela das nove", "Big Brother Brasil", "Pão de Açúcar", "Amazônia",
      "Pantanal", "Cataratas do Iguaçu", "Chinelo de dedo",
      "Churrasco de domingo", "Jogo do bicho", "Pix", "Fila do SUS",
      "Trânsito de São Paulo", "Praia de Copacabana", "Festa junina", "Forró",
      "Boi-bumbá", "Capoeira", "Feira livre", "Bar de esquina",
      "Buzão lotado", "Vaquinha no Pix", "Churrasquinho de rua",
      "Rodízio de pizza", "Café com leite", "Gol de placa",
    ],
    hard: [
      "Jogo do bicho", "Boi-bumbá", "Vaquinha no Pix", "Gol de placa",
      "Feira livre", "Pantanal", "Fila do SUS",
    ],
  },
  {
    id: "tecnologia",
    name: "Tecnologia",
    emoji: "💻",
    words: [
      "WhatsApp", "Instagram", "TikTok", "YouTube", "Netflix", "Spotify",
      "iPhone", "Notebook", "Smartwatch", "Fone bluetooth", "Caixa de som",
      "Impressora", "Roteador de wi-fi", "Carregador sem fio", "Drone",
      "Inteligência artificial", "Senha esquecida", "Atualização de sistema",
      "Reunião online", "Nuvem", "Pen drive", "Teclado mecânico", "Mouse",
      "Console de videogame", "Realidade virtual", "Chatbot", "E-mail",
      "Cartão de crédito virtual", "Banco digital", "QR Code",
      "Bateria acabando", "Modo avião", "Backup", "Streaming",
    ],
    hard: [
      "Nuvem", "Backup", "Modo avião", "Atualização de sistema",
      "Senha esquecida", "Chatbot", "Cartão de crédito virtual",
      "Realidade virtual",
    ],
  },
  {
    id: "personagens",
    name: "Personagens",
    emoji: "🦸",
    words: [
      "Mickey Mouse", "Bob Esponja", "Homer Simpson", "Mario", "Sonic",
      "Pikachu", "Goku", "Naruto", "Batman", "Mulher-Maravilha", "Hulk",
      "Darth Vader", "Yoda", "Elsa", "Woody", "Buzz Lightyear", "Shrek",
      "Papai Noel", "Chapeuzinho Vermelho", "Pinóquio", "Peter Pan",
      "Saci-Pererê", "Curupira", "Mula sem cabeça", "Chaves", "Seu Madruga",
      "Mônica", "Cebolinha", "Zé Carioca", "Coringa", "Capitão América",
      "Scooby-Doo", "Garfield", "Stitch",
    ],
    hard: [
      "Curupira", "Mula sem cabeça", "Zé Carioca", "Stitch", "Yoda",
      "Buzz Lightyear", "Pinóquio",
    ],
  },
  {
    id: "festa",
    name: "Festa e balada",
    emoji: "🎉",
    words: [
      "Aniversário surpresa", "Casamento", "Chá de bebê", "Formatura",
      "Réveillon", "Churrasco de laje", "Karaokê", "Festa à fantasia",
      "Show de rock", "Micareta", "Open bar", "Despedida de solteiro",
      "Festa junina", "Luau", "Pagode no quintal", "Balada eletrônica",
      "Happy hour", "Amigo secreto", "Ceia de Natal", "Festa de empresa",
      "Pedido de casamento", "After party", "Fila do banheiro",
      "Bolo de aniversário", "Parabéns desafinado", "Dança da cadeira",
      "Piscina na festa", "Vizinho reclamando", "Uber na saída",
    ],
    hard: [
      "Micareta", "After party", "Parabéns desafinado", "Vizinho reclamando",
      "Dança da cadeira", "Luau", "Fila do banheiro",
    ],
  },
  {
    id: "games",
    name: "Games",
    emoji: "🎮",
    words: [
      "Minecraft", "Fortnite", "League of Legends", "Counter-Strike", "GTA",
      "FIFA", "Valorant", "Among Us", "The Sims", "Zelda", "Pokémon",
      "Mario Kart", "Call of Duty", "Roblox", "Free Fire", "Elden Ring",
      "God of War", "Resident Evil", "Tetris", "Candy Crush", "Pac-Man",
      "Street Fighter", "Mortal Kombat", "Stardew Valley",
      "Red Dead Redemption", "Dark Souls", "Rocket League", "Clash Royale",
      "Angry Birds", "Subway Surfers", "Super Mario", "Terraria",
    ],
    hard: [
      "Elden Ring", "Dark Souls", "Stardew Valley", "Terraria",
      "Red Dead Redemption", "Rocket League", "Zelda",
    ],
  },
  {
    id: "viagem",
    name: "Viagem",
    emoji: "✈️",
    words: [
      "Mala extraviada", "Passaporte", "Check-in online", "Janela do avião",
      "Turbulência", "Hostel", "Mochilão", "Praia no Nordeste", "Paris",
      "Nova York", "Tóquio", "Disney", "Machu Picchu", "Cruzeiro",
      "Estrada de terra", "Posto na estrada", "Mapa offline", "Guia turístico",
      "Foto clichê", "Souvenir", "Câmbio de moeda", "Seguro viagem",
      "Atraso no voo", "Aluguel de carro", "Fuso horário", "Hotel fazenda",
      "Trilha na montanha", "Pôr do sol", "Passeio de barco", "Feriadão",
    ],
    hard: [
      "Mala extraviada", "Câmbio de moeda", "Seguro viagem", "Fuso horário",
      "Souvenir", "Mapa offline", "Machu Picchu", "Foto clichê",
    ],
  },
  {
    id: "escritorio",
    name: "Trabalho e escola",
    emoji: "🏢",
    words: [
      "Reunião que podia ser e-mail", "Prova surpresa", "Trabalho em grupo",
      "Hora extra", "Café da copa", "Chefe no pé", "Home office",
      "Entrevista de emprego", "Currículo", "Aumento de salário", "Demissão",
      "Estagiário", "Recreio", "Professor substituto", "Lição de casa",
      "Cola na prova", "Feira de ciências", "Apresentação de slides",
      "Deadline", "Planilha gigante", "Reunião de segunda", "Sexta-feira",
      "Férias", "Décimo terceiro", "Crachá esquecido", "Fila do bandejão",
      "Boletim", "Diretoria", "Grupo do trabalho no WhatsApp",
    ],
    hard: [
      "Décimo terceiro", "Crachá esquecido", "Fila do bandejão", "Boletim",
      "Diretoria", "Professor substituto", "Planilha gigante",
      "Reunião que podia ser e-mail",
    ],
  },
];

function toWords(pack: RawPack): PackWord[] {
  const hard = new Set(pack.hard ?? []);
  return pack.words.map((text) => ({
    text,
    level: hard.has(text) ? "hard" : "easy",
  }));
}

/**
 * Pacotes nativos. São só leitura na UI: para mexer, o usuário duplica o
 * pacote e edita a cópia (que vai pro localStorage).
 */
export const BUILTIN_PACKS: WordPack[] = RAW_PACKS.map((pack) => ({
  id: pack.id,
  name: pack.name,
  emoji: pack.emoji,
  builtin: true,
  words: toWords(pack),
}));

export function findPack(
  packs: WordPack[],
  id: string,
): WordPack | undefined {
  return packs.find((p) => p.id === id);
}
