# Studex Marketing Factory

AI-powered autonomous marketing platform with virtual influencer creation, multi-platform posting, and intelligent analytics.

## Features

- **Virtual Influencer Creation** - Generate AI influencers using Higgsfield AI
- **Multi-Platform Posting** - Post to Twitter, Instagram, TikTok, LinkedIn, Facebook, Pinterest, Threads, Bluesky, YouTube via Blotato
- **Auto Mode** - GSD + Ralph Loop for autonomous content creation and posting
- **Analytics Dashboard** - HEX.tech powered analytics

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run the system
npm run start
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `HIGGSFIELD_API_KEY` | Your Higgsfield API key |
| `BLOTATO_API_KEY` | Your Blotato API key |
| `LOG_LEVEL` | Logging level (debug, info, warn, error) |

## API Documentation

- [Higgsfield API](https://docs.higgsfield.ai)
- [Blotato API](https://help.blotato.com/api/publish-post)
- [HEX.tech](https://hex.tech)

## Architecture

```
┌─────────────────────────────────────────────┐
│           Studex Marketing Factory          │
├─────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌─────────┐ │
│  │Higgsfield │→ │  Blotato  │→ │   HEX   │ │
│  │  (Create) │  │  (Post)   │  │(Dashboard│
│  └───────────┘  └───────────┘  └─────────┘ │
├─────────────────────────────────────────────┤
│         GSD + Ralph Loop Controller          │
│  • Queue management                          │
│  • Auto-retry on failure                     │
│  • Scheduled runs                            │
└─────────────────────────────────────────────┘
```

## License

MIT