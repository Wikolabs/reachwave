# ReachWave — Automatisation des campagnes d'outreach B2B multicanal

> Atteignez vos prospects sur le bon canal, au bon moment, avec le bon message.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://postgresql.org)
[![Celery](https://img.shields.io/badge/Celery-5.4-37814A?style=flat)](https://docs.celeryq.dev)

---

## Vue d'ensemble

ReachWave est une plateforme d'automatisation des campagnes d'outreach B2B multicanal (email, LinkedIn, SMS). Elle permet de créer des séquences de prospection automatisées, de personnaliser les messages par segment, de suivre les taux d'ouverture/réponse, et d'optimiser l'envoi via des modèles de send-time optimization.

**Domaine :** Sales Automation / Outbound Marketing  
**Port VM :** 3003 | **Sous-domaine :** reachwave.wikolabs.com

---

## Stack technique

| Couche | Technologie | Rôle |
|--------|------------|------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Recharts | Builder séquences, analytics campagnes |
| Backend | FastAPI (Python 3.11), Uvicorn | API campagnes, séquences, tracking |
| Queue | Celery 5.4 + Redis | Envoi programmé, retry, rate limiting |
| Email | SMTP multi-provider (Resend / SendGrid) | Livraison emails |
| Analytics | ClickHouse (optionnel) ou PostgreSQL + views | Métriques opens/clicks/replies |
| Base de données | PostgreSQL 16 | Campagnes, contacts, activités |
| Scheduler | APScheduler | Send-time optimization (9h-11h local) |
| Infra | Docker Compose, Nginx | VM mono-repo (port 3003) |

### backend/requirements.txt
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
celery==5.4.0
redis==5.0.4
apscheduler==3.10.4
asyncpg==0.29.0
sqlalchemy[asyncio]==2.0.30
pydantic==2.7.1
pandas==2.2.2
numpy==1.26.4
httpx==0.27.0
jinja2==3.1.4
```

---

## Architecture mono-repo

```
reachwave/
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx             # Dashboard campagnes + KPIs
│   │   ├── campaigns/new/       # Builder séquences drag-and-drop
│   │   ├── campaigns/[id]/      # Métriques campagne live
│   │   └── templates/           # Bibliothèque templates messages
│   └── src/components/
│       ├── SequenceBuilder.tsx  # Builder étapes drag-and-drop
│       ├── CampaignStats.tsx    # Open/reply/bounce rates
│       ├── HeatmapSend.tsx      # Heatmap meilleurs moments d'envoi
│       ├── ReplyDetector.tsx    # Classification réponses (intéressé/pas)
│       └── PersonaTag.tsx       # Variables personnalisation {firstName}
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── campaigns.py     # CRUD campagnes + launch/pause
│   │   │   ├── sequences.py     # Étapes + conditions
│   │   │   └── tracking.py      # Webhooks opens/clicks/replies
│   │   ├── services/
│   │   │   ├── sender.py        # Multi-provider email dispatch
│   │   │   ├── scheduler.py     # Send-time optimization
│   │   │   ├── template.py      # Jinja2 personnalisation
│   │   │   └── analytics.py     # Agrégation métriques
│   │   └── models/
│   │       ├── campaign.py
│   │       └── contact.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── .github/workflows/deploy.yml
```

---

## Diagrammes UML

### Architecture système

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#7c3aed', 'primaryTextColor': '#fff', 'primaryBorderColor': '#6d28d9', 'lineColor': '#374151', 'secondaryColor': '#f3e8ff'}}}%%
flowchart TB
    subgraph VM["🖥️ VM — Docker Compose (port 3003)"]
        NEXT["Next.js 14\nCampaign Builder"]
        API["FastAPI"]

        subgraph SEQ["📧 Séquence Engine"]
            CELERY["Celery Workers\nEnvoi programmé"]
            SCHED["APScheduler\nSend-time optimization"]
            TMPL["Jinja2\nPersonnalisation"]
        end

        PG[("PostgreSQL\nCampagnes + Tracking")]
        REDIS[("Redis\nQueue + Rate limiting")]
    end

    SMTP["SMTP\nResend/SendGrid"] --> CELERY
    API --> SEQ
    SEQ --> REDIS
    REDIS --> CELERY
```

### Séquence — Envoi d'une séquence outreach

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#7c3aed', 'primaryTextColor': '#fff', 'lineColor': '#374151'}}}%%
sequenceDiagram
    participant SDR as SDR
    participant API as FastAPI
    participant SCHED as Scheduler
    participant CELERY as Celery
    participant SMTP as SMTP Provider

    SDR->>API: POST /campaigns/{id}/launch

    API->>SCHED: schedule_sequence(contacts, steps)
    Note over SCHED: Calcule meilleur horaire par timezone

    SCHED->>CELERY: enqueue(step1, eta=J0_09h30_local)
    CELERY->>SMTP: send_email(personalized_body)
    SMTP-->>CELERY: delivered, message_id=msg_abc

    Note over CELERY: J+3, pas de réponse détectée
    CELERY->>CELERY: check_reply(contact_id)
    CELERY->>SMTP: send_email(step2_followup)

    SMTP-->>API: webhook open_event {message_id, timestamp}
    API->>API: update_metrics(campaign, opened=true)
```

### Modèle de données (ER)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#7c3aed', 'primaryTextColor': '#fff', 'lineColor': '#374151'}}}%%
erDiagram
    CAMPAIGN {
        uuid id PK
        string name
        string status
        int contacts_total
        float open_rate
        float reply_rate
        float bounce_rate
        timestamp launched_at
    }
    SEQUENCE_STEP {
        uuid id PK
        uuid campaign_id FK
        int step_number
        int delay_days
        string channel
        string template_id
        string condition
    }
    CONTACT {
        uuid id PK
        string email
        string first_name
        string company
        string timezone
        string sequence_status
        timestamp last_activity_at
    }
    MESSAGE_EVENT {
        uuid id PK
        uuid contact_id FK
        uuid step_id FK
        string event_type
        timestamp occurred_at
        string provider_message_id
    }

    CAMPAIGN ||--o{ SEQUENCE_STEP : "has"
    CAMPAIGN }o--o{ CONTACT : "targets"
    CONTACT ||--o{ MESSAGE_EVENT : "generates"
    SEQUENCE_STEP ||--o{ MESSAGE_EVENT : "tracks"
```

---

## PRD

### Problème
L'outreach manuel est inefficace : les SDR envoient des emails identiques à tous, sans tenir compte du fuseau horaire, du canal préféré, ou de l'historique d'engagement. Les taux de réponse stagnent à 2-3%.

### Solution
ReachWave orchestre des séquences multicanal personnalisées, avec send-time optimization par timezone, détection automatique des réponses (arrêt de la séquence), et A/B testing des messages pour identifier les meilleures variantes.

### Utilisateurs cibles
| Persona | Besoin |
|---------|--------|
| SDR | Automatiser ses séquences de prospection |
| Sales Manager | Voir les taux de réponse par séquence/SDR |
| Marketing | A/B tester les messages et lignes d'objet |

### OKRs
- Taux de réponse > 8% (vs 2-3% industrie)
- Zéro contact contacté après opt-out (< 1min)
- Gain de temps SDR : 4h/semaine

---

## User Stories

```
US-01 [SDR] En tant que SDR,
      je veux créer une séquence de 5 étapes (email J0, J3, J7, call J10, LinkedIn J14)
      afin d'automatiser ma prospection sans perdre la personnalisation.

US-02 [SDR] En tant que SDR,
      je veux que la séquence s'arrête automatiquement quand un prospect répond
      afin d'éviter d'envoyer un follow-up à quelqu'un qui a déjà répondu.

US-03 [Manager] En tant que Sales Manager,
      je veux voir les taux d'ouverture et de réponse par SDR et par séquence
      afin d'identifier les meilleures pratiques à partager.

US-04 [SDR] En tant que SDR,
      je veux que mes emails soient envoyés à 9h30 heure locale du prospect
      afin de maximiser le taux d'ouverture.

US-05 [Marketing] En tant que marketer,
      je veux A/B tester deux objets d'email sur 200 prospects
      et sélectionner automatiquement le gagnant après 48h
      afin d'optimiser mes campagnes en continu.
```

---

## Règles métier

| # | Règle | Description | Simulable UI |
|---|-------|-------------|-------------|
| R1 | Stop on reply | Réponse détectée → stopper toutes les étapes restantes | ✅ Toggle demo |
| R2 | Cooldown global | Max 1 email/jour par contact, max 3 séquences actives | ✅ Rate limiter UI |
| R3 | Send-time opt | Envoi entre 8h-11h et 14h-17h heure locale du contact | ✅ Heatmap |
| R4 | Bounce handling | Bounce dur → blacklist immédiate, retrait de toutes séquences | ✅ Bounce log |
| R5 | Unsubscribe | Opt-out → suppression sous 1min (RGPD) | ✅ Unsubscribe button |
| R6 | Personnalisation | Variables {firstName}, {company}, {role} dans templates | ✅ Preview template |
| R7 | A/B test | 50% variante A / 50% variante B, sélection auto sur reply_rate | ✅ A/B toggle |
| R8 | Retry SMTP | Échec livraison → retry 3x avec backoff exponentiel | ✅ Retry log |
| R9 | Warm-up | Nouveau domaine expéditeur : augmentation progressive 10→500/jour | ✅ Ramp chart |
| R10 | Reply classification | NLP : "intéressé" / "pas intéressé" / "mauvais timing" / "hors cible" | ✅ Classification |

---

## Spécification API

**Base URL :** `http://reachwave.wikolabs.com/api/v1`

### POST /campaigns
```json
{"name": "ICP Tech Q2", "steps": [{"delay_days": 0, "channel": "email", "template_id": "t1"}, {"delay_days": 3, "channel": "email", "template_id": "t2"}], "contact_list_id": "cl_xyz"}
// Response: {"campaign_id": "camp_abc", "status": "draft"}
```

### POST /campaigns/{id}/launch
```json
// Response: {"status": "running", "scheduled": 47, "eta_first_send": "2024-03-15T09:30:00+01:00"}
```

### GET /campaigns/{id}/stats
```json
// Response: {"open_rate": 0.34, "reply_rate": 0.09, "bounce_rate": 0.02, "unsubscribed": 3, "by_step": [...]}
```

---

## Simulation UI

| Composant | Description |
|-----------|-------------|
| **Sequence Builder** | Drag-and-drop : ajouter étapes, configurer délais, canaux, conditions |
| **Campaign Stats** | Recharts line chart open/reply rate par jour, comparatif campagnes |
| **Send Heatmap** | Heatmap 7j × 24h des meilleurs horaires d'ouverture |
| **Reply Classifier** | Tag automatique "intéressé / pas intéressé" sur les réponses mock |
| **A/B Test Panel** | Toggle variantes A/B avec résultats en temps réel |

---

## Déploiement

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:16-alpine
    environment: {POSTGRES_DB: reachwave, POSTGRES_USER: rw_user, POSTGRES_PASSWORD: "${POSTGRES_PASSWORD}"}
  redis:
    image: redis:7-alpine
  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql+asyncpg://rw_user:${POSTGRES_PASSWORD}@postgres/reachwave
      REDIS_URL: redis://redis:6379
    depends_on: [postgres, redis]
    expose: ["8000"]
  worker:
    build: ./backend
    command: celery -A app.worker worker -Q email,linkedin --loglevel=info
    depends_on: [redis]
  frontend:
    build: ./frontend
    expose: ["3000"]
  nginx:
    image: nginx:alpine
    ports: ["3003:80"]
volumes:
  pg_data:
```

---

## Roadmap

### Phase 1 — MVP
- [ ] Builder séquences email
- [ ] Stop on reply automatique
- [ ] Dashboard taux d'ouverture/réponse

### Phase 2 — Multicanal
- [ ] LinkedIn automation (via LinkedIn API)
- [ ] A/B testing lignes d'objet
- [ ] Send-time optimization ML

### Phase 3 — IA
- [ ] Génération de messages personnalisés (LLM)
- [ ] Prédiction probabilité de réponse
- [ ] Intégration LeadForge (sync ICP score)

---

*Un produit [Wikolabs](https://wikolabs.com) — Intelligence artificielle appliquée aux métiers*
