export default function ReachWave() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "var(--font-body)" }}>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
            <span className="font-bold text-orange-900 text-lg" style={{ fontFamily: "var(--font-display)" }}>ReachWave</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-orange-700">
            <a href="#channels" className="hover:text-orange-500 transition-colors">Canaux</a>
            <a href="#results" className="hover:text-orange-500 transition-colors">Résultats</a>
            <a href="#how" className="hover:text-orange-500 transition-colors">Process</a>
          </div>
          <a href="#cta" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full text-sm font-bold transition-colors">
            Lancer mes campagnes
          </a>
        </div>
      </nav>

      {/* HERO — bold typographic */}
      <section className="pt-28 pb-16 bg-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-orange-50 -skew-x-6 translate-x-10 origin-top-right pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-bold mb-8">
            📢 Multicanal automatisé — Email · LinkedIn · SMS
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-[120px] md:text-[160px] font-black text-orange-100 leading-none select-none absolute -left-4 top-0 pointer-events-none" style={{ fontFamily: "var(--font-display)" }} aria-hidden>×3</div>
              <h1 className="relative text-5xl md:text-7xl font-black text-orange-950 leading-tight mb-6" style={{ fontFamily: "var(--font-display)" }}>
                Multipliez<br />
                vos réponses<br />
                <span className="text-orange-500">par 3.</span>
              </h1>
              <p className="text-orange-700 text-xl mb-8 leading-relaxed max-w-md">
                ReachWave orchestre vos séquences multicanal : le bon message, au bon moment, sur le bon canal — Email, LinkedIn et SMS en parallèle.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#cta" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-black text-lg transition-all shadow-lg shadow-orange-200">
                  Démarrer maintenant →
                </a>
                <a href="#channels" className="text-orange-700 border-2 border-orange-200 hover:border-orange-500 px-8 py-4 rounded-full font-bold text-lg transition-all text-center">
                  Voir les canaux
                </a>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { day: "Lun", channel: "Email", msg: "Présentation initiale + cas client pertinent", status: "Envoyé", color: "bg-blue-50 border-blue-200" },
                { day: "Mer", channel: "LinkedIn", msg: "Connexion + note personnalisée selon son profil", status: "Vu", color: "bg-sky-50 border-sky-200" },
                { day: "Ven", channel: "SMS", msg: "Suivi bref + lien vers démo courte", status: "Répondu ✓", color: "bg-orange-50 border-orange-200" },
              ].map((t) => (
                <div key={t.day} className={`${t.color} border rounded-xl p-4 flex items-center gap-4`}>
                  <div className="text-xs font-bold text-gray-500 w-8">{t.day}</div>
                  <div className="w-16 text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full text-center">{t.channel}</div>
                  <div className="flex-1 text-sm text-gray-700">{t.msg}</div>
                  <div className="text-xs text-green-600 font-semibold whitespace-nowrap">{t.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CHANNELS */}
      <section id="channels" className="py-20 bg-orange-950 text-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-14" style={{ fontFamily: "var(--font-display)" }}>
            3 canaux. 1 orchestration.
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "📧", channel: "Email", metrics: ["+47% d'ouvertures", "Personnalisation IA", "Suivi automatique"], color: "bg-blue-900/50 border-blue-700" },
              { icon: "💼", channel: "LinkedIn", metrics: ["+62% d'acceptations", "Notes sur-mesure", "Engagement automatisé"], color: "bg-sky-900/50 border-sky-700" },
              { icon: "📱", channel: "SMS", metrics: ["98% de taux d'ouverture", "Réponse en < 4min", "Lien démo intégré"], color: "bg-orange-900/50 border-orange-700" },
            ].map((c) => (
              <div key={c.channel} className={`${c.color} border rounded-2xl p-8`}>
                <div className="text-5xl mb-4">{c.icon}</div>
                <h3 className="text-2xl font-black mb-5" style={{ fontFamily: "var(--font-display)" }}>{c.channel}</h3>
                {c.metrics.map((m) => (
                  <div key={m} className="flex items-center gap-2 mb-2">
                    <span className="text-orange-400">→</span>
                    <span className="text-orange-100 text-sm">{m}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section id="results" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-orange-950 text-center mb-14" style={{ fontFamily: "var(--font-display)" }}>
            Des chiffres qui parlent
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "×3", label: "taux de réponse vs email seul" },
              { value: "72h", label: "pour les premiers retours" },
              { value: "12k+", label: "séquences envoyées / mois" },
              { value: "89%", label: "clients renouvellent" },
            ].map((s) => (
              <div key={s.label} className="text-center p-6 bg-orange-50 rounded-2xl border border-orange-100">
                <div className="text-4xl font-black text-orange-500 mb-2" style={{ fontFamily: "var(--font-display)" }}>{s.value}</div>
                <div className="text-sm text-orange-700">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 bg-orange-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-orange-950 text-center mb-14" style={{ fontFamily: "var(--font-display)" }}>
            Branché en 1 journée
          </h2>
          <div className="space-y-5">
            {[
              { n: "1", title: "Connectez vos outils", desc: "Gmail, LinkedIn, Twilio (SMS). OAuth 1-clic pour chaque canal. Aucune API à configurer manuellement." },
              { n: "2", title: "Définissez votre séquence", desc: "Choisissez le timing et le ton. ReachWave personnalise chaque message via IA selon le profil du prospect." },
              { n: "3", title: "Activez et observez", desc: "Le dashboard en temps réel montre ouvertures, clics, réponses — canal par canal. Vous intervenez seulement pour closer." },
            ].map((s) => (
              <div key={s.n} className="flex gap-5 bg-white rounded-2xl p-6 border border-orange-100">
                <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-black flex-shrink-0" style={{ fontFamily: "var(--font-display)" }}>{s.n}</div>
                <div>
                  <h3 className="font-bold text-orange-950 mb-1" style={{ fontFamily: "var(--font-display)" }}>{s.title}</h3>
                  <p className="text-orange-600 text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-20 bg-orange-500">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Vos premières réponses en 72h
          </h2>
          <p className="text-orange-100 text-xl mb-10">Setup en 1 journée. Séquences actives le lendemain.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://calendly.com/wikolabs" target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-orange-600 hover:bg-orange-50 px-10 py-5 rounded-full font-black text-xl transition-all shadow-xl">
              📅 Réserver un créneau →
            </a>
            <a href="https://wa.me/261386626100?text=Bonjour%2C%20je%20souhaite%20discuter%20de%20ReachWave%20avec%20Wikolabs." target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-orange-600 hover:bg-orange-50 px-10 py-5 rounded-full font-black text-xl transition-all shadow-xl" style={{ background: "#25d366", borderColor: "#25d366" }}>
              💬 WhatsApp →
            </a>
          </div>
          <p className="text-orange-200 text-sm mt-5">Essai 14 jours. Aucune carte bancaire.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-orange-950 text-orange-400 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-black text-white" style={{ fontFamily: "var(--font-display)" }}>ReachWave</span>
          <p className="text-sm">© 2025 ReachWave — Un produit <a href="https://wikolabs.com" className="text-orange-400 hover:text-orange-200">Wikolabs</a></p>
          <div className="flex gap-6 text-sm">
            <a href="mailto:team@wikolabs.com" className="hover:text-orange-200 transition-colors">Contact</a>
            <a href="https://wikolabs.com" className="hover:text-orange-200 transition-colors">Wikolabs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
