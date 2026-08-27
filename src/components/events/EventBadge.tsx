import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type EventBadgeProps = {
  name: string;
  description: string | null;
  date: Date;
  startTime: Date;
  endTime: Date;
};

export function EventBadge({ name, description, date, startTime, endTime }: EventBadgeProps) {
  return (
    <div className="pixel-frame flex flex-col gap-2 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-pixel text-sm leading-relaxed text-emerald-400">{name}</p>
        <p className="font-pixel shrink-0 text-right text-[10px] leading-relaxed text-white/70">
          {format(date, "dd/MM", { locale: ptBR })}
          <br />
          {format(startTime, "HH:mm")}–{format(endTime, "HH:mm")}
        </p>
      </div>
      {description && <p className="text-xs text-white/60">{description}</p>}
    </div>
  );
}
