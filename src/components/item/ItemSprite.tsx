import Image from "next/image";

/**
 * A chave vem de Item.sprite — mesmo padrão de src/components/pet/PetSprite.tsx. Itens sem
 * arte própria ainda (a maioria do seed) caem no fallback de emoji.
 */
const SPRITE_IMAGES: Record<string, string> = {
  item_headphones_adora: "/items/item_headphones_adora.png",
  item_bebrave_glasses: "/items/item_bebrave_glasses.svg",
  item_glasses: "/items/item_glasses.png",
};

export function ItemSprite({
  spriteKey,
  className = "",
  alt = "",
}: {
  spriteKey: string;
  className?: string;
  alt?: string;
}) {
  const src = SPRITE_IMAGES[spriteKey];

  if (!src) {
    const fallbackEmoji = spriteKey.startsWith("bg_") ? "🏛️" : "✨";
    return (
      <span
        className={`text-3xl ${className}`}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
      >
        {fallbackEmoji}
      </span>
    );
  }

  return (
    <div className={`relative h-14 w-14 ${className}`}>
      <Image src={src} alt={alt} fill sizes="56px" className="object-contain" unoptimized />
    </div>
  );
}
