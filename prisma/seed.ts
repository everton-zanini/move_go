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
    where: { name: "Movinho" },
    update: {},
    create: {
      name: "Movinho",
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
  console.log(`✓ PetSpecies "Movinho" com ${evolutions.length} evoluções seedadas`);
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
