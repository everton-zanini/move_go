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
};

/**
 * Arte combinada pet+item para estágios/itens que já têm uma versão desenhada junto (em vez de
 * composta em runtime). Chave: `${spriteKey}__${item.sprite}`. Sem entrada aqui = mostra o pet
 * "pelado" mesmo com o item equipado — não há fallback de composição automática ainda.
 */
const EQUIPPED_SPRITE_IMAGES: Record<string, string> = {
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
    spriteKey === "special"
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
