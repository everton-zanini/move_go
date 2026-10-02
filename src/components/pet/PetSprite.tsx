import Image from "next/image";

/**
 * A chave vem de PetEvolution.sprite — cada estágio tem uma arte própria em public/pet/,
 * indexada por essa mesma chave. Trocar a arte no futuro (ou adicionar espécies novas) não
 * exige mudança de schema, só desta tabela de resolução.
 */
const SPRITE_IMAGES: Record<string, string> = {
  egg: "/pet/egg.png",
  hatchling: "/pet/hatchling.png",
  young: "/pet/young.png",
  adult: "/pet/adult.png",
  special: "/pet/special.png",
  wolf_rise: "/pet/wolf-rise-v2.png",
  wolf_surge: "/pet/wolf-surge.png",
  wolf_ascend: "/pet/wolf-ascend.png",
  wolf_apex: "/pet/wolf-apex.png",
  tide_rise: "/pet/tide-rise.png",
  tide_surge: "/pet/tide-surge.png",
  tide_ascend: "/pet/tide-ascend.png",
  tide_apex: "/pet/tide-apex.png",
  igneo_rise: "/pet/igneo-rise.png",
  igneo_surge: "/pet/igneo-surge.png",
  igneo_ascend: "/pet/igneo-ascend.png",
  igneo_apex: "/pet/igneo-apex.png",
};

/**
 * Arte combinada pet+item para estágios/itens que já têm uma versão desenhada junto (em vez de
 * composta em runtime). Chave: `${spriteKey}__${item.sprite}`. Sem entrada aqui = mostra o pet
 * "pelado" mesmo com o item equipado — não há fallback de composição automática ainda.
 */
const EQUIPPED_SPRITE_IMAGES: Record<string, string> = {
  // Arte temporária: reaproveita a arte do Fone Adora até o Fone base ganhar arte própria.
  "hatchling__item_headphones": "/pet/hatchling-item_headphones.png",
  "young__item_headphones": "/pet/young-item_headphones.png",
  "adult__item_headphones": "/pet/adult-item_headphones.png",
  "special__item_headphones": "/pet/special-item_headphones.png",
  "hatchling__item_headphones_adora": "/pet/hatchling-item_headphones_adora.png",
  "young__item_headphones_adora": "/pet/young-item_headphones_adora.png",
  "adult__item_headphones_adora": "/pet/adult-item_headphones_adora.png",
  "special__item_headphones_adora": "/pet/special-item_headphones_adora.png",
  "hatchling__item_bebrave_glasses": "/pet/hatchling-item_bebrave_glasses.png",
  "young__item_bebrave_glasses": "/pet/young-item_bebrave_glasses.png",
  "adult__item_bebrave_glasses": "/pet/adult-item_bebrave_glasses.png",
  "special__item_bebrave_glasses": "/pet/special-item_bebrave_glasses.png",
  "hatchling__item_glasses": "/pet/hatchling-item_glasses.png",
  "young__item_glasses": "/pet/young-item_glasses.png",
  "adult__item_glasses": "/pet/adult-item_glasses.png",
  "special__item_glasses": "/pet/special-item_glasses.png",
};

export function PetSprite({
  spriteKey,
  size = "lg",
  equippedItemSpriteKeys = [],
}: {
  spriteKey: string;
  size?: "md" | "lg";
  equippedItemSpriteKeys?: string[];
}) {
  const equippedSrc = equippedItemSpriteKeys
    .map((itemSprite) => EQUIPPED_SPRITE_IMAGES[`${spriteKey}__${itemSprite}`])
    .find(Boolean);
  const src = equippedSrc ?? SPRITE_IMAGES[spriteKey] ?? SPRITE_IMAGES.egg;
  const frameSize = size === "lg" ? "h-48 w-48" : "h-24 w-24";
  // Apex ganha mais destaque: preenche a moldura inteira, as outras fases sobram uma margem.
  const artSize =
    spriteKey === "special" || spriteKey === "wolf_apex" || spriteKey === "tide_apex" || spriteKey === "igneo_apex"
      ? size === "lg"
        ? "h-48 w-48"
        : "h-24 w-24"
      : size === "lg"
        ? "h-40 w-40"
        : "h-20 w-20";

  return (
    <div className={`pixel-frame flex items-center justify-center rounded-2xl ${frameSize}`}>
      <div className={`pet-idle pet-blink relative ${artSize}`}>
        <Image src={src} alt="" fill sizes="192px" className="object-contain" priority />
      </div>
    </div>
  );
}
