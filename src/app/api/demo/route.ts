import { NextResponse } from "next/server";
import { chat, isConfigured } from "@/lib/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT_FR = `Tu es ReachWave, un agent IA d'outreach multicanal (Email + LinkedIn + SMS). A partir d'un lead decrit et d'une offre, tu produis une sequence d'outreach personnalisee de 5 a 7 touches sur 14 jours, avec angle, canal et copy pret-a-envoyer pour chaque touch.

Format de sortie exact en MARKDOWN :
**🎯 Profil lead**
- [1 phrase qui resume le lead et son contexte d'achat]

**🧠 Angle d'attaque retenu**
- [2 puces : pourquoi cet angle, signal exploite, biais cognitif active]

**📨 Sequence de 14 jours**
- [J1 — EMAIL : objet | corps 3-4 lignes max]
- [J3 — LINKEDIN : connexion + note 280 chars max]
- [J5 — EMAIL : relance avec proof point | objet + corps]
- [J8 — LINKEDIN : voice note 30s, script]
- [J11 — SMS : 160 chars max]
- [J14 — EMAIL break-up : objet + 2 lignes]

**📊 KPIs attendus**
- [3 puces : open rate, reply rate, meeting booked rate attendus]

Tu DOIS inventer un contexte realiste pour la demo (jamais "je ne connais pas ce lead"). Tu joues un copywriter outbound senior. Style direct, pas de marketing. Maximum 450 mots.`;

const SYSTEM_PROMPT_EN = `You are ReachWave, an AI multichannel outreach agent (Email + LinkedIn + SMS). From a described lead and an offer, you produce a personalized 14-day outreach sequence with 5-7 touches, with angle, channel, and ready-to-send copy for each touch.

Exact MARKDOWN output format:
**🎯 Lead profile**
- [1 sentence summarizing the lead and their buying context]

**🧠 Chosen angle**
- [2 bullets: why this angle, signal leveraged, cognitive bias activated]

**📨 14-day sequence**
- [D1 — EMAIL: subject | body 3-4 lines max]
- [D3 — LINKEDIN: connection + note 280 chars max]
- [D5 — EMAIL: follow-up with proof point | subject + body]
- [D8 — LINKEDIN: 30s voice note, script]
- [D11 — SMS: 160 chars max]
- [D14 — EMAIL break-up: subject + 2 lines]

**📊 Expected KPIs**
- [3 bullets: open rate, reply rate, meeting booked rate expected]

You MUST invent a realistic context for the demo (never "I don't know this lead"). You play a senior outbound copywriter. Direct style, no marketing fluff. Maximum 450 words.`;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const lead: string = typeof body.lead === "string" ? body.lead.slice(0, 600) : "";
    const offer: string = typeof body.offer === "string" ? body.offer.slice(0, 600) : "";
    const lang: "fr" | "en" = body.lang === "en" ? "en" : "fr";

    if (!lead.trim() || !offer.trim()) {
      return NextResponse.json(
        { error: lang === "fr" ? "Decrivez le lead ET votre offre." : "Describe the lead AND your offer." },
        { status: 400 }
      );
    }

    if (!isConfigured()) {
      return NextResponse.json(
        {
          error: "llm_not_configured",
          message: lang === "fr"
            ? "Demo en mode statique — la cle LLM sera configuree au prochain deploiement."
            : "Static demo mode — LLM key will be configured at next deploy.",
          mockBrief: buildMockBrief(lead, offer, lang),
        },
        { status: 200 }
      );
    }

    const userMsg = lang === "fr"
      ? `Lead : ${lead}\nOffre : ${offer}.\nGenere la sequence outreach 14 jours.`
      : `Lead: ${lead}\nOffer: ${offer}.\nGenerate the 14-day outreach sequence.`;

    const { text, model } = await chat(
      [
        { role: "system", content: lang === "fr" ? SYSTEM_PROMPT_FR : SYSTEM_PROMPT_EN },
        { role: "user", content: userMsg },
      ],
      1300
    );

    return NextResponse.json({ brief: text, model, generatedAt: new Date().toISOString() });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function buildMockBrief(lead: string, offer: string, lang: "fr" | "en"): string {
  if (lang === "en") {
    return `**🎯 Lead profile**\n- ${lead.slice(0, 140)} — buying context: scaling team, recent funding, stack consolidation in progress.\n\n**🧠 Chosen angle**\n- Peer pressure: 3 of their direct competitors are already using similar tooling — angle "you're 6 months behind X, Y, Z".\n- Loss aversion: each week without this costs ~12 SQLs based on observed funnel benchmarks.\n\n**📨 14-day sequence**\n- D1 — EMAIL: "Quick question on your Q1 pipeline" | Saw you raised + hiring 4 AEs. Most teams I see at your stage are losing 30%+ of ICP fit leads before first touch. Worth a 15min look at how Pennylane fixed this?\n- D3 — LINKEDIN: Connect + "Hey ${lead.split(" ")[0] || "there"}, sent you a note on the Q1 pipeline angle — not selling, just curious how you're solving it."\n- D5 — EMAIL: "Re: Q1 pipeline — Pennylane case" | Promised proof point: they 3x'd reply rate without adding headcount. 1-pager attached if useful, no agenda.\n- D8 — LINKEDIN voice note 30s: "Hi, no pressure — just thought you'd find the Pennylane teardown interesting given the scale you're at. 15s answer welcome."\n- D11 — SMS: "${lead.split(" ")[0] || "Hey"} — last ping from my side. If pipeline is a Q1 priority, here's my Calendly: cal.com/r — otherwise all good."\n- D14 — EMAIL break-up: "Closing the loop" | I'll stop here. If timing changes, you know where to find me. Best of luck on Q1.\n\n**📊 Expected KPIs**\n- Open rate: 52-58% (vs 28% industry baseline) thanks to subject lines using observed signals.\n- Reply rate: 11-14% (vs 3% baseline) thanks to peer reference + low-friction CTAs.\n- Meeting booked rate: 4-6% of total contacted — 2.5x industry average.`;
  }
  return `**🎯 Profil lead**\n- ${lead.slice(0, 140)} — contexte d'achat : equipe en croissance, levee recente, consolidation stack en cours.\n\n**🧠 Angle d'attaque retenu**\n- Peer pressure : 3 concurrents directs utilisent deja un outil similaire — angle "vous etes a 6 mois de retard sur X, Y, Z".\n- Aversion a la perte : chaque semaine sans ca coute ~12 SQL d'apres les benchmarks funnel observes.\n\n**📨 Sequence de 14 jours**\n- J1 — EMAIL : "Question rapide sur votre pipeline T1" | J'ai vu votre levee + 4 AE recrutes. La plupart des teams a votre taille perdent 30%+ des leads ICP avant le premier touch. 15min pour voir comment Pennylane a regle ca ?\n- J3 — LINKEDIN : Connexion + "Salut ${lead.split(" ")[0] || "vous"}, je vous ai envoye un mail sur l'angle pipeline T1 — pas commercial, juste curieux de votre approche."\n- J5 — EMAIL : "Re : pipeline T1 — cas Pennylane" | Proof point promis : ils ont x3 le reply rate sans headcount supplementaire. 1-pager joint si utile, pas d'agenda.\n- J8 — LINKEDIN voice note 30s : "Salut, sans pression — j'ai pense que le teardown Pennylane vous interesserait vu votre stade. 15s de retour bienvenu."\n- J11 — SMS : "${lead.split(" ")[0] || "Hey"} — dernier ping. Si pipeline T1 = priorite, mon Calendly : cal.com/r — sinon tout va bien."\n- J14 — EMAIL break-up : "On clot la boucle" | Je m'arrete la. Si le timing change, vous savez ou me trouver. Bon T1.\n\n**📊 KPIs attendus**\n- Open rate : 52-58% (vs 28% baseline industrie) grace aux objets utilisant les signaux observes.\n- Reply rate : 11-14% (vs 3% baseline) grace a la reference peer + CTA low-friction.\n- Meeting booked : 4-6% du total contacte — 2.5x la moyenne industrie.`;
}
