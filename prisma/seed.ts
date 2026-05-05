import { PrismaClient, Raridade } from '@prisma/client';

const prisma = new PrismaClient();

// 48 teams of Copa America 2026 (FIFA World Cup 2026)
const TEAMS = [
  // CONMEBOL
  { name: 'Argentina', code: 'ARG', group: 'A' },
  { name: 'Bolivia', code: 'BOL', group: 'A' },
  { name: 'Brasil', code: 'BRA', group: 'A' },
  { name: 'Equador', code: 'ECU', group: 'A' },
  { name: 'Chile', code: 'CHI', group: 'A' },
  { name: 'Colômbia', code: 'COL', group: 'B' },
  { name: 'Paraguai', code: 'PAR', group: 'B' },
  { name: 'Peru', code: 'PER', group: 'B' },
  { name: 'Uruguai', code: 'URU', group: 'B' },
  { name: 'Venezuela', code: 'VEN', group: 'B' },
  // AFC
  { name: 'Austrália', code: 'AUS', group: 'C' },
  { name: 'Coreia do Sul', code: 'KOR', group: 'C' },
  { name: 'Irã', code: 'IRN', group: 'C' },
  { name: 'Japão', code: 'JPN', group: 'C' },
  { name: 'Arábia Saudita', code: 'KSA', group: 'C' },
  // CAF
  { name: 'Camarões', code: 'CMR', group: 'D' },
  { name: 'Costa do Marfim', code: 'CIV', group: 'D' },
  { name: 'Egito', code: 'EGY', group: 'D' },
  { name: 'Gana', code: 'GHA', group: 'D' },
  { name: 'Marrocos', code: 'MAR', group: 'D' },
  { name: 'Nigéria', code: 'NGA', group: 'D' },
  { name: 'Senegal', code: 'SEN', group: 'D' },
  { name: 'Tunísia', code: 'TUN', group: 'D' },
  { name: 'África do Sul', code: 'RSA', group: 'D' },
  // CONCACAF
  { name: 'Canadá', code: 'CAN', group: 'E' },
  { name: 'Costa Rica', code: 'CRC', group: 'E' },
  { name: 'Estados Unidos', code: 'USA', group: 'E' },
  { name: 'Honduras', code: 'HON', group: 'E' },
  { name: 'Jamaica', code: 'JAM', group: 'E' },
  { name: 'México', code: 'MEX', group: 'E' },
  { name: 'Panamá', code: 'PAN', group: 'E' },
  { name: 'Trinidad e Tobago', code: 'TRI', group: 'E' },
  // UEFA
  { name: 'Alemanha', code: 'GER', group: 'F' },
  { name: 'Áustria', code: 'AUT', group: 'F' },
  { name: 'Bélgica', code: 'BEL', group: 'F' },
  { name: 'Croácia', code: 'CRO', group: 'F' },
  { name: 'Dinamarca', code: 'DEN', group: 'F' },
  { name: 'Escócia', code: 'SCO', group: 'F' },
  { name: 'Espanha', code: 'ESP', group: 'F' },
  { name: 'França', code: 'FRA', group: 'F' },
  { name: 'Grécia', code: 'GRE', group: 'F' },
  { name: 'Holanda', code: 'NED', group: 'F' },
  { name: 'Hungria', code: 'HUN', group: 'F' },
  { name: 'Inglaterra', code: 'ENG', group: 'F' },
  { name: 'Itália', code: 'ITA', group: 'F' },
  { name: 'Polônia', code: 'POL', group: 'F' },
  { name: 'Portugal', code: 'POR', group: 'F' },
  { name: 'República Tcheca', code: 'CZE', group: 'F' },
  { name: 'Romênia', code: 'ROU', group: 'F' },
  { name: 'Suíça', code: 'SUI', group: 'F' },
  { name: 'Suécia', code: 'SWE', group: 'F' },
  { name: 'Ucrânia', code: 'UKR', group: 'F' },
  { name: 'Gales', code: 'WAL', group: 'F' },
];

// Player names by position for each team
const PLAYER_NAMES: Record<string, { prefix: string; names: string[] }> = {
  'BRA': { prefix: 'Brazilians', names: ['Alisson', 'Ederson', 'Weverton', 'Danilo', 'Marquinhos', 'Gabriel', 'Eder', 'Filipe', 'Alex', 'Guilherme', 'Casemiro', 'Bruno', 'Fabinho', 'Neymar', 'Vinicius', 'Rodrygo', 'Raphinha', 'Antony', 'Richarlison', 'Pedro', 'Martinelli', 'Lucas', 'Endrick'] },
  'ARG': { prefix: 'Argentines', names: ['Martinez', 'Molina', 'Romero', 'Otamendi', 'Lirola', 'Taglia', 'De', ' Paredes', 'Enzo', 'Macri', 'Messi', 'Di', 'Maria', 'Alvarez', 'Montiel', 'Lo', 'Celso', 'Gonzalo', 'Lautaro', 'Exequiel', 'Angel'] },
  'FRA': { prefix: 'French', names: ['Maignan', 'Mandanda', 'Pau', 'Dembele', 'Coman', 'Mbappe', 'Giroud', 'Thuram', 'Kante', 'Tchouameni', 'Rabiot', 'Pogba', 'Lacazette', 'Benzema', 'Grey', 'Theo', 'Ferland', 'Jules', 'William', 'Benjamin', 'Ibrahima', 'Dayot', 'Upamecano'] },
  'GER': { prefix: 'German', names: ['Neuer', 'Ter', 'Stegen', 'Rudiger', 'Kimmich', 'Goretzka', 'Muller', 'Sane', 'Musiala', 'Havertz', 'Gnabry', 'Werner', 'Schlotterbeck', 'Thilo', 'David', 'Jamal', 'Leroy', 'Florian', 'Chris', 'Antonio', 'Maximilian', 'Alexander', 'Kevin'] },
  'ENG': { prefix: 'English', names: ['Pickford', 'Pope', 'Ramsdale', 'Walker', 'Stones', 'Maguire', 'Shaw', 'Trippier', 'Trent', 'Rice', 'Bellingham', 'Mount', 'Sterling', 'Kane', 'Foden', 'Saka', 'Rashford', 'Grealish', 'Watkins', 'Wilson', 'Phillips', 'James', 'Conor'] },
  'ESP': { prefix: 'Spanish', names: ['Simon', 'Rajkovic', 'Kepa', 'Dani', 'Cesar', 'Porro', 'Nacho', 'Pau', 'Cuti', 'Sergi', 'Alex', 'Robin', 'Pedri', 'Gavi', 'Fabi', 'Bravo', 'Lamine', 'Nico', 'Alvaro', 'Joselu', 'Ronaldo', 'Bryan', 'Mikel', 'Merino'] },
  'POR': { prefix: 'Portuguese', names: ['Patricio', 'Diogo', 'Rui', 'Nelson', 'Pepe', 'Ruben', 'Nuno', 'Joao', 'Cancelo', 'Danilo', 'Bruno', 'Bernardo', 'Ruben', 'Otavio', 'Joao', 'Felix', 'Rafael', 'Pedro', 'Cristiano', 'Diogo', 'Nuno', 'Tiago', 'Andre'] },
  'ITA': { prefix: 'Italian', names: ['Donnarumma', 'Meret', 'Provedel', 'Di', 'Lorenzo', 'Acerbi', 'Bonucci', 'Bastoni', 'Spinazzola', 'Dimarco', 'Barella', 'Jorginho', 'Verratti', 'Pobega', 'Locatelli', 'Tonali', 'Zaccagni', 'Chiesa', 'Berardi', 'Scamacca', 'Raspadori', 'El', 'Shaqiri', 'Kean'] },
  'NED': { prefix: 'Dutch', names: ['Noppert', 'Cillessen', 'Verbruggen', 'Van', 'Dumfries', 'Blind', 'De', 'Vrij', 'Ake', 'Timber', 'Van', 'Borgen', 'De', 'Roon', 'Klaassen', 'Veen', 'Graven', 'Wijnaldum', 'Bergwijn', 'Memphis', 'Noa', 'Luuk', 'Xavi', 'Steven', 'Cody'] },
  'BEL': { prefix: 'Belgian', names: ['Courtois', 'Casteels', 'Mignolet', 'Vertonghen', 'Alderweireld', 'Denayer', 'Meunier', 'Castagne', 'Thorgan', 'Kevin', 'Youri', 'Amadou', 'Tielemans', 'Witsel', 'De', 'Bruyne', 'Eden', 'Hazard', 'Romelu', 'Michy', 'Dries', 'Charles', 'Leandro', 'Jeremy', 'Thibault'] },
};

// Generic player names for teams without specific data
const GENERIC_PLAYERS = [
  'Guardiola', 'Martinez', 'Lopez', 'Rodriguez', 'Hernandez', 'Garcia', 'Sanchez', 'Perez',
  'Muller', 'Schmidt', 'Weber', 'Fischer', 'Wagner', 'Becker', 'Hoffman', 'Koch',
  'Rossi', 'Russo', 'Romano', 'Colombo', 'Costa', 'Silva', 'Ferreira', 'Almeida',
  'Andersson', 'Johansson', 'Nilsson', 'Larsson', 'Berg', 'Lindberg', 'Karlsson', 'Eriksson',
  'Dubois', 'Martin', 'Bernard', 'Thomas', 'Robert', 'Michel', 'Louis', 'Nicolas',
];

function generatePlayerSet(teamCode: string, group: string, startNum: number): Array<{ numero: string; nome: string; raridade: Raridade; categoria: string }> {
  const players = PLAYER_NAMES[teamCode];
  const positions = ['Goleiro', 'Zagueiro', 'Zagueiro', 'Lateral', 'Lateral', 'Meia', 'Meia', 'Meia', 'Atacante', 'Atacante', 'Atacante'];
  const result: Array<{ numero: string; nome: string; raridade: Raridade; categoria: string }> = [];

  // Team card (1 per team)
  result.push({ numero: `${startNum}`, nome: `Seleção ${TEAMS.find(t => t.code === teamCode)?.name || teamCode}`, raridade: 'COMUM', categoria: 'Grupos' });

  // Goalkeepers (1-2)
  result.push({ numero: `${startNum + 1}`, nome: `Goleiro ${teamCode} 1`, raridade: 'COMUM', categoria: 'Grupos' });
  result.push({ numero: `${startNum + 2}`, nome: `Goleiro ${teamCode} 2`, raridade: 'RARA', categoria: 'Grupos' });

  // Defenders (4)
  for (let i = 0; i < 4; i++) {
    const name = players?.names[i + 5] || GENERIC_PLAYERS[(startNum + i) % GENERIC_PLAYERS.length];
    const rarity = i === 0 ? 'RARA' : 'COMUM';
    result.push({ numero: `${startNum + 3 + i}`, nome: `Zagueiro ${name}`, raridade: rarity as Raridade, categoria: 'Grupos' });
  }

  // Midfielders (4)
  for (let i = 0; i < 4; i++) {
    const name = players?.names[i + 9] || GENERIC_PLAYERS[(startNum + i + 7) % GENERIC_PLAYERS.length];
    const rarity = i === 0 ? 'RARA' : 'COMUM';
    result.push({ numero: `${startNum + 7 + i}`, nome: `Meia ${name}`, raridade: rarity as Raridade, categoria: 'Grupos' });
  }

  // Forwards (3)
  for (let i = 0; i < 3; i++) {
    const name = players?.names[i + 13] || GENERIC_PLAYERS[(startNum + i + 11) % GENERIC_PLAYERS.length];
    const rarity = i === 0 ? 'RARA' : 'COMUM';
    result.push({ numero: `${startNum + 11 + i}`, nome: `Atacante ${name}`, raridade: rarity as Raridade, categoria: 'Grupos' });
  }

  // Extra team cards (coach, mascot, badge)
  result.push({ numero: `${startNum + 14}`, nome: `Treinador ${TEAMS.find(t => t.code === teamCode)?.name || teamCode}`, raridade: 'RARA', categoria: 'Grupos' });
  result.push({ numero: `${startNum + 15}`, nome: `Emblema ${teamCode}`, raridade: 'COMUM', categoria: 'Grupos' });
  result.push({ numero: `${startNum + 16}`, nome: `Hino ${teamCode}`, raridade: 'RARA', categoria: 'Grupos' });

  return result;
}

async function main() {
  console.log('🌍 Starting Copa 2026 seed...');

  // Create album
  const album = await prisma.album.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Copa do Mundo 2026',
      totalFigurinhas: 820,
      coverUrl: 'https://example.com/copa2026.jpg',
      isDefault: true,
    },
  });

  console.log(`✅ Album created/found: ${album.name}`);

  // Create categories
  const categoriesData = [
    { name: 'Grupos', id: 'cat-grupos' },
    { name: 'Fase Final', id: 'cat-final' },
    { name: 'Hits', id: 'cat-hits' },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: { id: cat.id, albumId: album.id, name: cat.name },
    });
  }
  console.log('✅ Categories created');

  // Generate all stickers
  let figurinhaCount = 0;
  let figurinhaNum = 1;

  // Groups A-F (48 teams × 17 stickers each = 816)
  for (const team of TEAMS) {
    const players = generatePlayerSet(team.code, team.group, figurinhaNum);
    for (const p of players) {
      const category = await prisma.category.findFirst({ where: { albumId: album.id, name: p.categoria } });
      await prisma.figurinha.upsert({
        where: { albumId_numero: { albumId: album.id, numero: p.numero } },
        update: {},
        create: {
          albumId: album.id,
          numero: p.numero,
          nome: p.nome,
          imagemUrl: `https://example.com/figurinhas/${album.id}/${p.numero}.png`,
          categoryId: category?.id,
          raridade: p.raridade,
        },
      });
      figurinhaCount++;
    }
    figurinhaNum += 17;
  }

  // Phase Final stickers (Oitavas, Quartas, Semi, Final, 3º lugar)
  const faseFinalData = [
    // Oitavas de final (8 matches = 16 teams)
    ...Array.from({ length: 8 }, (_, i) => ({ numero: `${figurinhaNum++}`, nome: `Oitavas ${i + 1} - Time 1`, raridade: 'COMUM' as Raridade })),
    ...Array.from({ length: 8 }, (_, i) => ({ numero: `${figurinhaNum++}`, nome: `Oitavas ${i + 1} - Time 2`, raridade: 'COMUM' as Raridade })),
    // Quartas de final (4 matches = 8 teams)
    ...Array.from({ length: 4 }, (_, i) => ({ numero: `${figurinhaNum++}`, nome: `Quartas ${i + 1} - Time 1`, raridade: 'RARA' as Raridade })),
    ...Array.from({ length: 4 }, (_, i) => ({ numero: `${figurinhaNum++}`, nome: `Quartas ${i + 1} - Time 2`, raridade: 'RARA' as Raridade })),
    // Semifinais (2 matches = 4 teams)
    ...Array.from({ length: 2 }, (_, i) => ({ numero: `${figurinhaNum++}`, nome: `Semifinal ${i + 1} - Time 1`, raridade: 'RARA' as Raridade })),
    ...Array.from({ length: 2 }, (_, i) => ({ numero: `${figurinhaNum++}`, nome: `Semifinal ${i + 1} - Time 2`, raridade: 'RARA' as Raridade })),
    // Disputa 3º lugar
    { numero: `${figurinhaNum++}`, nome: '3º Lugar - Time 1', raridade: 'ULTRA_RARA' as Raridade },
    { numero: `${figurinhaNum++}`, nome: '3º Lugar - Time 2', raridade: 'ULTRA_RARA' as Raridade },
    // Final
    { numero: `${figurinhaNum++}`, nome: 'Final - Time 1', raridade: 'ULTRA_RARA' as Raridade },
    { numero: `${figurinhaNum++}`, nome: 'Final - Time 2', raridade: 'ULTRA_RARA' as Raridade },
    { numero: `${figurinhaNum++}`, nome: '🏆 CAMPEÃO', raridade: 'ULTRA_RARA' as Raridade },
  ];

  const faseFinalCat = await prisma.category.findFirst({ where: { albumId: album.id, name: 'Fase Final' } });
  for (const fig of faseFinalData) {
    await prisma.figurinha.upsert({
      where: { albumId_numero: { albumId: album.id, numero: fig.numero } },
      update: {},
      create: {
        albumId: album.id,
        numero: fig.numero,
        nome: fig.nome,
        imagemUrl: `https://example.com/figurinhas/${album.id}/${fig.numero}.png`,
        categoryId: faseFinalCat?.id,
        raridade: fig.raridade,
      },
    });
    figurinhaCount++;
  }

  // Hits stickers (special cards)
  const hitsData = [
    { numero: `${figurinhaNum++}`, nome: '🔥 Lendários', raridade: 'ULTRA_RARA' },
    { numero: `${figurinhaNum++}`, nome: '⭐ Estrelas Mundiais', raridade: 'ULTRA_RARA' },
    { numero: `${figurinhaNum++}`, nome: '🎯 Craques da Copa', raridade: 'ULTRA_RARA' },
    { numero: `${figurinhaNum++}`, nome: '🌟 Gols Históricos', raridade: 'ULTRA_RARA' },
    { numero: `${figurinhaNum++}`, nome: '🏟️ Estadios', raridade: 'RARA' },
    { numero: `${figurinhaNum++}`, nome: '🇺🇸🇲🇽🇨🇦 Mapa Copas', raridade: 'RARA' },
    { numero: `${figurinhaNum++}`, nome: '⚽ Ballon d\'Or', raridade: 'ULTRA_RARA' },
    { numero: `${figurinhaNum++}`, nome: '📸 Moments', raridade: 'RARA' },
  ];

  const hitsCat = await prisma.category.findFirst({ where: { albumId: album.id, name: 'Hits' } });
  for (const fig of hitsData) {
    await prisma.figurinha.upsert({
      where: { albumId_numero: { albumId: album.id, numero: fig.numero } },
      update: {},
      create: {
        albumId: album.id,
        numero: fig.numero,
        nome: fig.nome,
        imagemUrl: `https://example.com/figurinhas/${album.id}/${fig.numero}.png`,
        categoryId: hitsCat?.id,
        raridade: fig.raridade as Raridade,
      },
    });
    figurinhaCount++;
  }

  console.log(`✅ Seed complete: ${figurinhaCount} figurinhas created across ${TEAMS.length} teams + fase final + hits`);
  console.log('📦 Album:', album.name, '| Totalfigurinhas:', figurinhaCount);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });