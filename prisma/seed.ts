import { PrismaClient, ItemSlot, AchievementCriteriaType } from "@prisma/client";
import { nanoid, customAlphabet } from "nanoid";
import bcrypt from "bcryptjs";
import { GAME_RULES_DEFAULTS } from "../src/config/game-rules.default";

// Mesmo alfabeto sem caracteres ambíguos usado em EventService.generateShortCode.
const generateShortCode = customAlphabet("23456789ABCDEFGHJKMNPQRSTUVWXYZ", 6);

const prisma = new PrismaClient();

async function seedConfig() {
  for (const rule of GAME_RULES_DEFAULTS) {
    await prisma.configEntry.upsert({
      where: { key: rule.key },
      update: { value: JSON.stringify(rule.value), description: rule.description },
      create: { key: rule.key, value: JSON.stringify(rule.value), description: rule.description },
    });
  }
  console.log(`✓ ${GAME_RULES_DEFAULTS.length} ConfigEntry seedadas`);
}

async function seedPetSpecies() {
  const species = await prisma.petSpecies.upsert({
    where: { name: "Gust" },
    update: {},
    create: {
      name: "Gust",
      description: "A espécie padrão de pet do MoveGO — cresce a cada culto e evento em que o jovem participa.",
    },
  });

  // Nomes de estágio em inglês, com sentido de avanço/crescimento (alinhado à marca MoveGO).
  const evolutions = [
    { levelRequired: 1, name: "Spark", sprite: "egg" },
    { levelRequired: 2, name: "Rise", sprite: "hatchling" },
    { levelRequired: 5, name: "Surge", sprite: "young" },
    { levelRequired: 10, name: "Ascend", sprite: "adult" },
    { levelRequired: 20, name: "Apex", sprite: "special" },
  ];

  for (const evo of evolutions) {
    await prisma.petEvolution.upsert({
      where: { speciesId_levelRequired: { speciesId: species.id, levelRequired: evo.levelRequired } },
      update: { name: evo.name, sprite: evo.sprite },
      create: { speciesId: species.id, ...evo },
    });
  }
  console.log(`✓ PetSpecies "Gust" com ${evolutions.length} evoluções seedadas`);

  // Segunda linha: o ovo (nível 1) é compartilhado, então o Lobo começa no nível 2.
  const wolf = await prisma.petSpecies.upsert({
    where: { name: "Roam" },
    update: {},
    create: { name: "Roam", description: "Um lobo amigável que cresce a cada culto e evento." },
  });
  const wolfEvolutions = [
    { levelRequired: 2, name: "Rise", sprite: "wolf_rise" },
    { levelRequired: 5, name: "Surge", sprite: "wolf_surge" },
    { levelRequired: 10, name: "Ascend", sprite: "wolf_ascend" },
    { levelRequired: 20, name: "Apex", sprite: "wolf_apex" },
  ];
  for (const evo of wolfEvolutions) {
    await prisma.petEvolution.upsert({
      where: { speciesId_levelRequired: { speciesId: wolf.id, levelRequired: evo.levelRequired } },
      update: { name: evo.name, sprite: evo.sprite },
      create: { speciesId: wolf.id, ...evo },
    });
  }
  console.log(`✓ PetSpecies "Roam" com ${wolfEvolutions.length} evoluções seedadas`);

  const tide = await prisma.petSpecies.upsert({
    where: { name: "Tide" },
    update: {},
    create: { name: "Tide", description: "Uma tartaruga marinha amigável que cresce a cada culto e evento." },
  });
  const tideEvolutions = [
    { levelRequired: 2, name: "Rise", sprite: "tide_rise" },
    { levelRequired: 5, name: "Surge", sprite: "tide_surge" },
    { levelRequired: 10, name: "Ascend", sprite: "tide_ascend" },
    { levelRequired: 20, name: "Apex", sprite: "tide_apex" },
  ];
  for (const evo of tideEvolutions) {
    await prisma.petEvolution.upsert({
      where: { speciesId_levelRequired: { speciesId: tide.id, levelRequired: evo.levelRequired } },
      update: { name: evo.name, sprite: evo.sprite },
      create: { speciesId: tide.id, ...evo },
    });
  }
  console.log(`✓ PetSpecies "Tide" com ${tideEvolutions.length} evoluções seedadas`);

  const igneo = await prisma.petSpecies.upsert({
    where: { name: "Ígneo" },
    update: {},
    create: { name: "Ígneo", description: "Uma salamandra de fogo amigável que cresce a cada culto e evento." },
  });
  const igneoEvolutions = [
    { levelRequired: 2, name: "Rise", sprite: "igneo_rise" },
    { levelRequired: 5, name: "Surge", sprite: "igneo_surge" },
    { levelRequired: 10, name: "Ascend", sprite: "igneo_ascend" },
    { levelRequired: 20, name: "Apex", sprite: "igneo_apex" },
  ];
  for (const evo of igneoEvolutions) {
    await prisma.petEvolution.upsert({
      where: { speciesId_levelRequired: { speciesId: igneo.id, levelRequired: evo.levelRequired } },
      update: { name: evo.name, sprite: evo.sprite },
      create: { speciesId: igneo.id, ...evo },
    });
  }
  console.log(`✓ PetSpecies "Ígneo" com ${igneoEvolutions.length} evoluções seedadas`);
  return species;
}

async function seedItems() {
  const items = [
    { name: "Fone", description: "Um fone de ouvido estiloso.", sprite: "item_headphones", slot: ItemSlot.ACCESSORY, unlockLevel: 2 },
    { name: "Boné", description: "Boné descolado para o pet.", sprite: "item_cap", slot: ItemSlot.HAT, unlockLevel: 5 },
    { name: "Óculos", description: "Óculos estiloso.", sprite: "item_glasses", slot: ItemSlot.ACCESSORY, unlockCheckInCount: 5 },
    { name: "Fone Adora", description: "Item especial do evento Adora Santana.", sprite: "item_headphones_adora", slot: ItemSlot.ACCESSORY },
    { name: "BeBrave Glasses", description: "Óculos especial do evento BeBrave.", sprite: "item_bebrave_glasses", slot: ItemSlot.ACCESSORY },
  ];

  const created = [];
  for (const item of items) {
    const it = await prisma.item.upsert({
      where: { id: `seed-item-${item.name}` },
      update: item,
      create: { id: `seed-item-${item.name}`, ...item },
    });
    created.push(it);
  }
  console.log(`✓ ${created.length} Item seedados`);
  return created;
}

async function seedAchievements() {
  const achievements = [
    { name: "Primeiro Passo", description: "Primeiro check-in.", icon: "🏠", criteriaType: AchievementCriteriaType.CHECKIN_COUNT, criteriaValue: 1 },
    { name: "Presente", description: "3 check-ins.", icon: "🔥", criteriaType: AchievementCriteriaType.CHECKIN_COUNT, criteriaValue: 3 },
    { name: "Constante", description: "5 check-ins.", icon: "🔥🔥", criteriaType: AchievementCriteriaType.CHECKIN_COUNT, criteriaValue: 5 },
    { name: "Dedicado", description: "10 check-ins.", icon: "⭐", criteriaType: AchievementCriteriaType.CHECKIN_COUNT, criteriaValue: 10 },
    { name: "Evento Especial", description: "Participou de um evento especial.", icon: "🎉", criteriaType: AchievementCriteriaType.SPECIAL_EVENT, criteriaValue: null },
    { name: "Primeira Evolução", description: "Spark evoluiu pela primeira vez.", icon: "🐣", criteriaType: AchievementCriteriaType.LEVEL, criteriaValue: 2 },
  ];

  const created = [];
  for (const a of achievements) {
    const ach = await prisma.achievement.upsert({
      where: { id: `seed-achievement-${a.name}` },
      update: a,
      create: { id: `seed-achievement-${a.name}`, ...a },
    });
    created.push(ach);
  }
  console.log(`✓ ${created.length} Achievement seedadas`);
  return created;
}

// Mesmo id usado pela migration add_churches, que move os dados existentes para esta igreja.
const DEFAULT_CHURCH_ID = "church-move-santana";

async function seedDefaultChurch() {
  const church = await prisma.church.upsert({
    where: { id: DEFAULT_CHURCH_ID },
    update: {},
    create: { id: DEFAULT_CHURCH_ID, name: "Move Santana", slug: "move-santana" },
  });
  console.log(`✓ Igreja padrão seedada (${church.name})`);
  return church;
}

/** Super-admin da plataforma: só é criado se as credenciais estiverem no env. */
async function seedSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("• SUPER_ADMIN_EMAIL/SUPER_ADMIN_PASSWORD não definidos — super-admin não seedado");
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name: "Super Admin", email, passwordHash, role: "SUPER_ADMIN" },
  });
  console.log(`✓ Super-admin seedado (${email})`);
}

async function seedAdminUser(speciesId: string) {
  const passwordHash = await bcrypt.hash("movepet123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@movesantana.com" },
    update: {},
    create: {
      name: "Admin Move Santana",
      email: "admin@movesantana.com",
      passwordHash,
      role: "ADMIN",
      churchId: DEFAULT_CHURCH_ID,
    },
  });

  const firstEvolution = await prisma.petEvolution.findFirst({
    where: { speciesId, levelRequired: { lte: 1 } },
    orderBy: { levelRequired: "desc" },
  });

  await prisma.pet.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      speciesId,
      currentEvolutionId: firstEvolution?.id,
      level: 1,
      totalXp: 0,
      energy: 100,
      happiness: 100,
    },
  });

  console.log(`✓ Usuário admin seedado (admin@movesantana.com / movepet123)`);
  return admin;
}

async function seedEvents(adoraItemId: string | undefined, bebraveItemId: string | undefined) {
  const now = new Date();
  const events = [
    {
      id: "seed-event-culto-jovens",
      name: "Culto de Jovens",
      description: "Culto semanal do Move Santana.",
      date: now,
      startTime: new Date(now.getTime() - 30 * 60_000),
      endTime: new Date(now.getTime() + 2 * 60 * 60_000),
      xpReward: 150,
      active: true,
    },
    {
      id: "seed-event-adora-santana",
      name: "Adora Santana",
      description: "Evento especial de adoração do Move Santana.",
      date: now,
      startTime: new Date(now.getTime() - 30 * 60_000),
      endTime: new Date(now.getTime() + 3 * 60 * 60_000),
      xpReward: 200,
      active: true,
      specialItemId: adoraItemId,
    },
    {
      id: "seed-event-culto-especial",
      name: "Culto Especial",
      description: "Culto especial de aniversário do ministério.",
      date: now,
      startTime: new Date(now.getTime() - 60 * 60_000),
      endTime: new Date(now.getTime() + 60 * 60_000),
      xpReward: 300,
      active: true,
    },
    {
      id: "seed-event-bebrave",
      name: "BeBrave",
      description: "Evento especial BeBrave.",
      date: now,
      startTime: new Date(now.getTime() - 30 * 60_000),
      endTime: new Date(now.getTime() + 3 * 60 * 60_000),
      xpReward: 200,
      active: true,
      specialItemId: bebraveItemId,
    },
  ];

  for (const event of events) {
    const existing = await prisma.event.findUnique({ where: { id: event.id } });
    await prisma.event.upsert({
      where: { id: event.id },
      update: {},
      create: {
        ...event,
        churchId: DEFAULT_CHURCH_ID,
        qrCodeToken: existing?.qrCodeToken ?? nanoid(24),
        shortCode: existing?.shortCode ?? generateShortCode(),
      },
    });
  }

  const createdEvents = await prisma.event.findMany({ where: { id: { in: events.map((e) => e.id) } } });
  console.log(`✓ ${createdEvents.length} Event seedados (tokens de QR Code):`);
  for (const e of createdEvents) {
    console.log(`   - ${e.name}: /checkin/${e.qrCodeToken}`);
  }
}

async function main() {
  await seedConfig();
  const species = await seedPetSpecies();
  const items = await seedItems();
  await seedAchievements();
  await seedDefaultChurch();
  await seedSuperAdmin();
  await seedAdminUser(species.id);
  const adoraItem = items.find((i) => i.name === "Fone Adora");
  const bebraveItem = items.find((i) => i.name === "BeBrave Glasses");
  await seedEvents(adoraItem?.id, bebraveItem?.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
