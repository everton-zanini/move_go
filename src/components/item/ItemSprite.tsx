import Image from "next/image";

/**
 * A chave vem de Item.sprite — mesmo padrão de src/components/pet/PetSprite.tsx. Itens sem
 * arte própria ainda (a maioria do seed) caem no fallback de emoji.
 */
const SPRITE_IMAGES: Record<string, string> = {
  item_headphones_adora: "/items/item_headphones_adora.svg",
  item_bebrave_glasses: "/items/item_bebrave_glasses.svg",
};

export function ItemSprite({ spriteKey, className = "" }: { spriteKey: string; className?: string }) {
  const src = SPRITE_IMAGES[spriteKey];

  if (!src) {
    return <span className={`text-3xl ${className}`}>✨</span>;
  }

  return (
    <div className={`relative h-14 w-14 ${className}`}>
      <Image src={src} alt="" fill sizes="56px" className="object-contain" unoptimized />
    </div>
  );
}
