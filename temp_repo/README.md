# 🌟 Astrologer Studio

<div align="center">

**The Professional Astrology Workspace**

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Built with Kerykeion](https://img.shields.io/badge/Powered%20by-Kerykeion-purple.svg)](https://github.com/g-battaglia/kerykeion)

[🚀 Try it Live](https://astrologerstudio.com) · [📖 Documentation](./DEVELOPMENT.md) · [🐛 Report Bug](https://github.com/g-battaglia/AstrologerStudio/issues)

<br />

> **⚠️ This is the legacy version of Astrologer Studio.**
> The online version at [astrologerstudio.com](https://astrologerstudio.com) has been completely rewritten with a new stack.
> **Astrologer Studio 2** (OSS) is coming soon — stay tuned!

<br />

[![Astrologer Studio Dashboard](https://raw.githubusercontent.com/g-battaglia/AstrologerStudio/main/CDN/screenshots/birth-chart.webp)](https://astrologerstudio.com)

</div>

---

## What is Astrologer Studio?

Astrologer Studio is a **free/libre** open-source **professional astrology** workspace that helps astrologers manage their clients, generate precise astrological charts, and get AI-powered interpretations — all in one beautiful, modern interface.

Whether you're a professional astrologer managing hundreds of clients or an enthusiast exploring your own birth chart, Astrologer Studio has everything you need.

## ✨ Features

### 🎨 Beautiful Charts

Generate stunning, high-precision astrological charts including:

- **Natal Charts** — Your complete birth chart
- **Transit Charts** — Current planetary positions against your natal chart
- **Synastry Charts** — Relationship compatibility analysis
- **Composite Charts** — The chart of your relationship itself
- **Solar & Lunar Returns** — Annual and monthly forecasts

### 👥 Client Management

Keep all your clients organized:

- Store birth data, locations, and notes
- Tag and categorize subjects
- Rodden Rating support for data reliability
- Quick search and filtering

### 📊 Ephemeris & Timeline Tools

- Yearly ephemeris tables and visual charts
- Transit timeline with customizable filters
- Track planetary movements over time

### 🤖 AI Interpretations (Optional)

Get intelligent, context-aware readings powered by:

- The Kerykeion astrology engine
- Advanced AI language models
- Your custom interpretation preferences

### 🎨 Fully Customizable

- Light and dark themes
- Choose your favorite zodiac system (Tropical/Sidereal)
- Multiple house systems (Placidus, Whole Sign, Koch, and more)
- Configure which planets, points, and aspects to display

## 🖼️ Screenshots

### Transits & Bi-Wheels

![Transit Chart](https://raw.githubusercontent.com/g-battaglia/AstrologerStudio/main/CDN/screenshots/transit-chart.webp)

### Interactive Timeline

![Timeline](https://raw.githubusercontent.com/g-battaglia/AstrologerStudio/main/CDN/screenshots/timeline.webp)

### Client Management

![Data Management](https://raw.githubusercontent.com/g-battaglia/AstrologerStudio/main/CDN/screenshots/data.webp)

### Visual Ephemeris

![Ephemeris](https://raw.githubusercontent.com/g-battaglia/AstrologerStudio/main/CDN/screenshots/ephemeris-chart.webp)

## 💡 Why Open Source?

Astrologer Studio is licensed under the **GNU Affero General Public License v3 (AGPLv3)**.

> **Note:** "Free" means **free as in freedom**, not free as in "gratis" (free of cost). You have the freedom to use, study, modify, and share this software. However, developing and maintaining quality software requires resources.

### What This Means:

- ✅ **Libre software** — Use, modify, and distribute freely under AGPLv3
- ✅ **Transparent** — You can inspect exactly how your charts are calculated
- ✅ **Community-driven** — Contribute features, report bugs, suggest improvements
- ✅ **Self-hosting option** — Run your own instance with full control

### Support the Project 💜

The best way to support Astrologer Studio is by subscribing to the hosted version at [astrologerstudio.com](https://astrologerstudio.com):

| Plan                | Price        |
| ------------------- | ------------ |
| **Launch Price** 🚀 | **$5/month** |
| Regular Price       | $10/month    |

Your subscription directly funds:

- Continued development of Astrologer Studio
- The [Kerykeion](https://github.com/g-battaglia/kerykeion) open-source astrology engine
- Server infrastructure and support

> 💡 **Self-hosting is always an option.** If you can't afford a subscription, feel free to run your own instance — that's the beauty of libre software! However, if you have the resources, please consider subscribing to support the project and ensure it continues to grow.

## 🛠️ Built With

- [Kerykeion](https://github.com/g-battaglia/kerykeion) — The powerful open-source astrology engine
- [Next.js](https://nextjs.org/) — React framework for production
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework
- [PostgreSQL](https://www.postgresql.org/) — Robust database
- [Prisma](https://www.prisma.io/) — Modern database toolkit

## 🚀 Getting Started

### Use the Hosted Version

The easiest way to get started is to use our hosted version at **[astrologerstudio.com](https://astrologerstudio.com)**. No setup required!

### Self-Host

Run your own instance in minutes:

#### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/g-battaglia/AstrologerStudio.git
cd AstrologerStudio

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start with Docker
docker-compose up -d
```

#### Option 2: Manual Setup

```bash
# Clone the repository
git clone https://github.com/g-battaglia/AstrologerStudio.git
cd AstrologerStudio

# Install dependencies
bun install

# Configure environment
cp .env.example .env
# Edit .env with your database and API keys

# Setup database
bun run db:generate
bun run db:migrate

# Create your first user
bun run user:create -- admin yourpassword

# Start the app
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in!

> **Note:** Astrologer Studio requires the [Astrologer API](https://github.com/g-battaglia/Astrologer-API) for astrological calculations. You can self-host the API or use the hosted version via [RapidAPI](https://rapidapi.com/gbattaglia/api/astrologer).

📖 **Documentation:**

- [DEVELOPMENT.md](./DEVELOPMENT.md) — Detailed development guide
- [docs/SELF_HOSTING.md](./docs/SELF_HOSTING.md) — Complete self-hosting instructions
- [CONTEXT.md](./CONTEXT.md) — Project context for AI assistants

## 🤝 Contributing

We welcome contributions of all kinds! Whether you're:

- 🐛 Reporting bugs
- 💡 Suggesting new features
- 📖 Improving documentation
- 🔧 Submitting pull requests

Please read our contributing guidelines before getting started.

## 📜 License

Astrologer Studio is licensed under the **GNU Affero General Public License v3 (AGPLv3)**.

This means you're free to use, modify, and distribute this software, but if you run a modified version as a network service, you must make your source code available to users of that service under the same license.

See the [LICENSE](./LICENSE) file for details.

## 💖 Support the Project

The best way to support Astrologer Studio:

- 💜 **[Subscribe](https://astrologerstudio.com)** — Use the hosted version ($5/month launch price!)
- ⭐ Star this repository
- 🐛 Report bugs and suggest features
- 💬 Spread the word

---

<div align="center">

**Made with 💜 by the Kerykeion team**

[Website](https://astrologerstudio.com) · [Kerykeion](https://github.com/g-battaglia/kerykeion) · [Report Issue](https://github.com/g-battaglia/AstrologerStudio/issues)

</div>
