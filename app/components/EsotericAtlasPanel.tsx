import { useState } from "react";
import { ATLAS_DOMAINS, atlasLifePath, atlasNameTotal } from "../lib/esotericAtlas";

export function EsotericAtlasPanel() {
  const [domainId, setDomainId] = useState(ATLAS_DOMAINS[0].id);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const domain = ATLAS_DOMAINS.find((item) => item.id === domainId) ?? ATLAS_DOMAINS[0];
  const life = date ? atlasLifePath(date) : null;
  const named = name.trim() ? atlasNameTotal(name) : null;

  return (
    <div className="absolute inset-0 z-40 overflow-y-auto px-4 pt-16 pb-28">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <header className="rounded-2xl border border-white/15 bg-black/70 p-5 backdrop-blur-xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-300">Esoteric Atlas · indexed</p>
          <h2 className="mt-2 font-serif text-3xl text-white">Library inside Higher Mind</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            The natal astrolabe, identity matrix, and oracle stay as they are. This hall adds the distinctions: what is documented, what is doctrine, and what is a later collage. It does not replace a chart with a destiny.
          </p>
        </header>
        <div className="flex flex-wrap gap-2">
          {ATLAS_DOMAINS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setDomainId(item.id)}
              className={`rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-widest ${
                item.id === domain.id
                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
                  : "border-white/15 bg-black/50 text-white/60"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-white/70">{domain.lede}</p>
        {domain.id === "numerology" ? (
          <section className="rounded-2xl border border-cyan-400/30 bg-black/70 p-4 backdrop-blur-xl">
            <p className="font-mono text-[10px] uppercase tracking-widest text-cyan-300">Audit the arithmetic</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-[10px] uppercase tracking-widest text-white/50">
                Name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="text-[10px] uppercase tracking-widest text-white/50">
                Birth date
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-sm text-white"
                />
              </label>
            </div>
            <div className="mt-3 space-y-1 font-mono text-xs text-cyan-100">
              {named ? <p>Pythagorean expression {named.value} from letter total {named.raw}. Chaldean and gematria are not this number.</p> : null}
              {life ? <p>Life path {life.value}. {life.line}. Master 11, 22, 33 kept. Not a forecast.</p> : null}
              {!named && !life ? <p className="text-white/50">Enter a name, a date, or both. Nothing is uploaded.</p> : null}
            </div>
          </section>
        ) : null}
        <ul className="flex flex-col gap-3">
          {domain.entries.map((entry) => (
            <li key={entry.title} className="rounded-2xl border border-white/10 bg-black/65 p-4 backdrop-blur-xl">
              <h3 className="font-serif text-2xl text-white">{entry.title}</h3>
              <p className="mt-1 text-sm text-cyan-100/80">{entry.summary}</p>
              <p className="mt-3 text-sm leading-relaxed text-white/80">{entry.body}</p>
              <ul className="mt-3 border-t border-white/10">
                {entry.claims.map((claim) => (
                  <li key={claim.text} className="py-2">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-300">{claim.kind}</p>
                    <p className="mt-1 text-sm text-white/75">{claim.text}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
