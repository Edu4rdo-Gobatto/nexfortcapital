import { Clock, MapPin, Navigation, Phone, Star } from "lucide-react";
import { GoogleIcon } from "@/components/ui/BrandIcons";
import { CtaLink } from "@/components/ui/CtaLink";
import { CONTACT } from "@/content/nexfort";
import { cn } from "@/lib/utils";
import { MonoNumbers } from "./MonoNumbers";
import { OpeningStatus } from "./OpeningStatus";

const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold";

/** Chanfro a 32° (44px × 27,5px, tan 32° ≈ 0,625): o mesmo corte da fita de LED da fachada. */
const PLAQUE_CLIP = "polygon(0 0, calc(100% - 44px) 0, 100% 27.5px, 100% 100%, 0 100%)";

const STARS = [1, 2, 3, 4, 5] as const;

/** Selo "5,0 ★★★★★ no Google": lido como uma única imagem pelo leitor de tela. */
function GoogleRatingSeal() {
  return (
    <div
      role="img"
      aria-label={`Avaliação ${CONTACT.googleRating} de 5 no Google`}
      className="flex items-center gap-4"
    >
      <span className="grid size-11 shrink-0 place-items-center bg-led">
        <GoogleIcon className="size-6" />
      </span>
      {/* Na mono, a vírgula ocupa uma célula inteira: o tracking negativo aproxima "5,0". */}
      <span className="font-mono text-4xl leading-none font-medium tracking-[-0.12em] tabular-nums text-led">
        {CONTACT.googleRating}
      </span>
      <span className="flex flex-col gap-1.5">
        <span className="flex gap-0.5 text-gold">
          {STARS.map((star) => (
            <Star key={star} className="size-4 fill-current" strokeWidth={1.5} />
          ))}
        </span>
        <span className="text-sm leading-none text-muted">no Google</span>
      </span>
    </div>
  );
}

type VisitPlaqueProps = {
  className?: string;
};

/** Placa de visita: avaliação, endereço com rota, horário de atendimento e telefone. */
export function VisitPlaque({ className }: VisitPlaqueProps) {
  return (
    <div className={cn("relative isolate", className)}>
      {/* Borda de 1px que acompanha o chanfro + superfície de concreto. */}
      <span aria-hidden="true" className="absolute inset-0 -z-10 bg-white/10" style={{ clipPath: PLAQUE_CLIP }} />
      <span
        aria-hidden="true"
        className="concrete-noise absolute inset-px -z-10 bg-concrete"
        style={{ clipPath: PLAQUE_CLIP }}
      />
      {/* Fita de LED no topo da placa, dobrando a 32° no chanfro (eco da fachada).
          right-11 = 44px (início do chanfro); w-13 ≈ 51,9px, a hipotenusa de 44 × 27,5. */}
      <span aria-hidden="true" className="pointer-events-none absolute top-0 right-11 left-6 h-px">
        <span className="absolute inset-0 bg-linear-to-r from-transparent to-[#FFF4E0]" />
        <span className="absolute inset-x-0 -top-px h-0.75 bg-linear-to-r from-transparent to-[#FFE7C2]/70 blur-[3px]" />
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-[calc(100%-44px)] h-px w-13 origin-left rotate-32"
      >
        <span className="absolute inset-0 bg-[#FFF4E0]" />
        <span className="absolute inset-x-0 -top-px h-0.75 bg-[#FFE7C2]/70 blur-[3px]" />
      </span>

      <div className="border-b border-white/8 px-5 pt-7 pb-6 sm:px-8">
        <GoogleRatingSeal />
      </div>

      <dl className="grid sm:grid-cols-2 lg:grid-cols-1">
        <div className="border-b border-white/8 px-5 py-6 sm:col-span-2 sm:px-8 lg:col-span-1">
          <dt className="flex items-center gap-2 text-sm text-muted">
            <MapPin className="size-4 text-royal-glow" />
            Endereço
          </dt>
          <dd className="mt-3">
            <address className="text-lg leading-snug text-led not-italic">
              <MonoNumbers text={CONTACT.address.full} />
            </address>
            <CtaLink variant="glass" size="md" href={CONTACT.mapsUrl} external className="mt-5 w-full sm:w-auto">
              <Navigation className="size-4 shrink-0" />
              Traçar rota no Google Maps
            </CtaLink>
          </dd>
        </div>

        <div className="border-b border-white/8 px-5 py-6 sm:border-r sm:border-b-0 sm:px-8 lg:border-r-0 lg:border-b">
          <dt className="flex items-center gap-2 text-sm text-muted">
            <Clock className="size-4 text-royal-glow" />
            Atendimento
          </dt>
          <dd className="mt-3">
            {/* Ilha client: fim de semana, antes das 08:00 ou o expediente, no relógio de Sinop. */}
            <p className="text-lg leading-snug font-medium text-led">
              <OpeningStatus />
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              <MonoNumbers text={CONTACT.openingHours} />
            </p>
          </dd>
        </div>

        <div className="px-5 py-6 sm:px-8">
          <dt className="flex items-center gap-2 text-sm text-muted">
            <Phone className="size-4 text-royal-glow" />
            Telefone
          </dt>
          <dd className="mt-3">
            <a
              href={CONTACT.phoneHref}
              className={cn(
                "inline-flex items-center font-mono text-xl tabular-nums text-led hover:text-gold sm:text-2xl",
                FOCUS_RING,
              )}
            >
              <span className="sr-only">Ligar para </span>
              {CONTACT.phoneDisplay}
            </a>
          </dd>
        </div>
      </dl>
    </div>
  );
}
