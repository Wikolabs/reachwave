"""ReachWave demo backend — production-ready POC.

In production: this service would also enqueue multichannel sends (Email +
LinkedIn + SMS) via per-tenant OAuth providers. For the demo: it only
invokes the LLM and returns the brief.
"""
from datetime import datetime, timezone
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .llm import chat, is_configured

app = FastAPI(
    title="ReachWave Demo Backend",
    description="POC backend — Groq/Gemini LLM. No third-party connections.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# Prompts
# ─────────────────────────────────────────────────────────────────────────────
SYSTEM_PROMPT_FR = """Tu es ReachWave, un agent IA d'outreach multicanal (Email + LinkedIn + SMS). A partir d'un lead decrit et d'une offre, tu produis une sequence d'outreach personnalisee de 5 a 7 touches sur 14 jours, avec angle, canal et copy pret-a-envoyer pour chaque touch.

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

Tu DOIS inventer un contexte realiste pour la demo (jamais "je ne connais pas ce lead"). Tu joues un copywriter outbound senior. Style direct, pas de marketing. Maximum 450 mots."""

SYSTEM_PROMPT_EN = """You are ReachWave, an AI multichannel outreach agent (Email + LinkedIn + SMS). From a described lead and an offer, you produce a personalized 14-day outreach sequence with 5-7 touches, with angle, channel, and ready-to-send copy for each touch.

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

You MUST invent a realistic context for the demo (never "I don't know this lead"). You play a senior outbound copywriter. Direct style, no marketing fluff. Maximum 450 words."""


# ─────────────────────────────────────────────────────────────────────────────
# Models
# ─────────────────────────────────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    lead: str
    offer: str
    lang: Literal["fr", "en"] = "fr"


class GenerateResponse(BaseModel):
    brief: str
    model: str
    generated_at: str
    static_mode: bool = False


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "reachwave-backend",
        "llm_configured": is_configured(),
    }


@app.post("/process", response_model=GenerateResponse)
async def process(req: GenerateRequest) -> GenerateResponse:
    lead = (req.lead or "").strip()[:600]
    offer = (req.offer or "").strip()[:600]
    if not lead or not offer:
        raise HTTPException(status_code=400, detail="missing_lead_or_offer")

    now_iso = datetime.now(timezone.utc).isoformat()
    user_msg = (
        f"Lead : {lead}\nOffre : {offer}.\nGenere la sequence outreach 14 jours."
        if req.lang == "fr"
        else f"Lead: {lead}\nOffer: {offer}.\nGenerate the 14-day outreach sequence."
    )

    if not is_configured():
        return GenerateResponse(
            brief=_build_mock_brief(lead, offer, req.lang),
            model="static-mock",
            generated_at=now_iso,
            static_mode=True,
        )

    try:
        text, model = await chat(
            [
                {"role": "system", "content": SYSTEM_PROMPT_FR if req.lang == "fr" else SYSTEM_PROMPT_EN},
                {"role": "user", "content": user_msg},
            ],
            max_tokens=1300,
        )
    except Exception:
        return GenerateResponse(
            brief=_build_mock_brief(lead, offer, req.lang),
            model="static-mock",
            generated_at=now_iso,
            static_mode=True,
        )

    return GenerateResponse(brief=text, model=model, generated_at=now_iso)


# ─────────────────────────────────────────────────────────────────────────────
# Mock brief (used when no LLM key configured or LLM fails)
# ─────────────────────────────────────────────────────────────────────────────
def _build_mock_brief(lead: str, offer: str, lang: str) -> str:
    first = (lead.split(" ")[0] if lead.split(" ") else "Hey") or "Hey"
    lead_short = lead[:140]
    if lang == "en":
        return (
            f"**🎯 Lead profile**\n"
            f"- {lead_short} — buying context: scaling team, recent funding, stack consolidation in progress.\n\n"
            f"**🧠 Chosen angle**\n"
            f"- Peer pressure: 3 of their direct competitors are already using similar tooling — angle \"you're 6 months behind X, Y, Z\".\n"
            f"- Loss aversion: each week without this costs ~12 SQLs based on observed funnel benchmarks.\n\n"
            f"**📨 14-day sequence**\n"
            f"- D1 — EMAIL: \"Quick question on your Q1 pipeline\" | Saw you raised + hiring 4 AEs. Most teams I see at your stage are losing 30%+ of ICP fit leads before first touch. Worth a 15min look at how Pennylane fixed this?\n"
            f"- D3 — LINKEDIN: Connect + \"Hey {first}, sent you a note on the Q1 pipeline angle — not selling, just curious how you're solving it.\"\n"
            f"- D5 — EMAIL: \"Re: Q1 pipeline — Pennylane case\" | Promised proof point: they 3x'd reply rate without adding headcount. 1-pager attached if useful, no agenda.\n"
            f"- D8 — LINKEDIN voice note 30s: \"Hi, no pressure — just thought you'd find the Pennylane teardown interesting given the scale you're at. 15s answer welcome.\"\n"
            f"- D11 — SMS: \"{first} — last ping from my side. If pipeline is a Q1 priority, here's my Calendly: cal.com/r — otherwise all good.\"\n"
            f"- D14 — EMAIL break-up: \"Closing the loop\" | I'll stop here. If timing changes, you know where to find me. Best of luck on Q1.\n\n"
            f"**📊 Expected KPIs**\n"
            f"- Open rate: 52-58% (vs 28% industry baseline) thanks to subject lines using observed signals.\n"
            f"- Reply rate: 11-14% (vs 3% baseline) thanks to peer reference + low-friction CTAs.\n"
            f"- Meeting booked rate: 4-6% of total contacted — 2.5x industry average."
        )
    return (
        f"**🎯 Profil lead**\n"
        f"- {lead_short} — contexte d'achat : equipe en croissance, levee recente, consolidation stack en cours.\n\n"
        f"**🧠 Angle d'attaque retenu**\n"
        f"- Peer pressure : 3 concurrents directs utilisent deja un outil similaire — angle \"vous etes a 6 mois de retard sur X, Y, Z\".\n"
        f"- Aversion a la perte : chaque semaine sans ca coute ~12 SQL d'apres les benchmarks funnel observes.\n\n"
        f"**📨 Sequence de 14 jours**\n"
        f"- J1 — EMAIL : \"Question rapide sur votre pipeline T1\" | J'ai vu votre levee + 4 AE recrutes. La plupart des teams a votre taille perdent 30%+ des leads ICP avant le premier touch. 15min pour voir comment Pennylane a regle ca ?\n"
        f"- J3 — LINKEDIN : Connexion + \"Salut {first}, je vous ai envoye un mail sur l'angle pipeline T1 — pas commercial, juste curieux de votre approche.\"\n"
        f"- J5 — EMAIL : \"Re : pipeline T1 — cas Pennylane\" | Proof point promis : ils ont x3 le reply rate sans headcount supplementaire. 1-pager joint si utile, pas d'agenda.\n"
        f"- J8 — LINKEDIN voice note 30s : \"Salut, sans pression — j'ai pense que le teardown Pennylane vous interesserait vu votre stade. 15s de retour bienvenu.\"\n"
        f"- J11 — SMS : \"{first} — dernier ping. Si pipeline T1 = priorite, mon Calendly : cal.com/r — sinon tout va bien.\"\n"
        f"- J14 — EMAIL break-up : \"On clot la boucle\" | Je m'arrete la. Si le timing change, vous savez ou me trouver. Bon T1.\n\n"
        f"**📊 KPIs attendus**\n"
        f"- Open rate : 52-58% (vs 28% baseline industrie) grace aux objets utilisant les signaux observes.\n"
        f"- Reply rate : 11-14% (vs 3% baseline) grace a la reference peer + CTA low-friction.\n"
        f"- Meeting booked : 4-6% du total contacte — 2.5x la moyenne industrie."
    )
