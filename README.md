# Eventuras knowledge management system

** Open Source Knowledge Stack and Event Management **

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

**Eventuras** is a complete open-source platform for content, knowledge, event and course management, built with modern technologies and best practices. The project provides a robust backend API, a responsive Next.js frontend, and a set of reusable libraries — all brought together in a modern monorepo architecture.

---

## ✨ Key Features

### 🚀 **Apps: Core Products**

- **`apps/api`** — .NET Core REST API for event management
  - Complete event and registration system
  - User management with roles and access control
  - Payment integration and certificate generation
  - OpenAPI/Swagger documentation
- **`apps/web`** — Next.js frontend for customers and administrators
  - Modern React-based user interface
  - Server-side rendering (SSR) for optimal performance
  - Separate interfaces for participants and organizers
  - Internationalization with next-intl
- **`apps/historia`** — Upcoming knowledge focuses cms. 
- **`apps/convertoapi`** — PDF generator - converts html to pdf
- **`apps/dev-docs`** — Developer documentation website

### 📚 **Libs: Reusable Libraries**

A powerful collection of shared libraries powering the Eventuras ecosystem:

- **`@eventuras/event-sdk`** — TypeScript SDK for API integration
- **`@eventuras/smartform`** — Intelligent form system with validation
- **`@eventuras/ratio-ui`** — UI components and design system
- **`@eventuras/fides-auth`** — Authentication and authorization
- **`@eventuras/scribo`** — Markdown editor
- **`@eventuras/markdown`** — Markdown processing and rendering
- And more…

---

## 🏗️ Architecture

Eventuras is built as a **monorepo** with Turborepo and npm workspaces:

```
eventuras/
├── apps/               # Main applications
│   ├── api/            # .NET Core backend
│   ├── web/            # Next.js frontend
│   ├── historia/       # Historical data
│   └── convertoapi/    # PDF generator
├── libs/               # Shared libraries
│   ├── sdk/            # TypeScript API client
│   ├── smartform/      # Form system
│   ├── ratio-ui/       # UI components
│   └── ...             # More reusable packages
└── docs/               # Documentation
```

**Technology stack:**
- **Backend:** Node, .NET Core, C#, Entity Framework Core, PostgreSQL
- **Frontend:** Next.js 15, React 19, TypeScript 5.9
- **Styling:** Tailwind CSS 4, React Aria Components
- **State Management:** XState 5
- **Testing:** Playwright, Storybook
- **CI/CD:** GitHub Actions, Docker

---

## 🚀 Getting Started

### Docker (Quickest Path)

**Prerequisites:** [Docker](https://docs.docker.com/get-docker/)

```bash
# Clone the repository
git clone https://github.com/losol/eventuras.git
cd eventuras

# Build and start the application
docker-compose up
```

The applications will be available at
- **Backend API HTTP**: `http://localhost:5000`
- **Backend API HTTPS**: `https://localhost:5001`
- **Backend API Swagger UI**: `http://localhost:5000/swagger` - only available if ASPNETCORE_ENVIRONMENT=Development
- **Backend API Integration tests**: `https://localhost:5002`


## 📖 Documentation
- **Docs**: Take a look at the `docs` folder
- **API Documentation:** Available at `/swagger` when the backend is running
- **AI Agent Guides:** Specialized instructions for AI-assisted development
  - [Backend Agent](.github/agents/backend-developer.md) — for `apps/api`
  - [Frontend Agent](.github/agents/frontend-developer.md) — for `apps/web` and `libs/*`
  - [Converto Agent](.github/agents/converto-developer.md) — for `apps/convertoapi`
  - [Complete AI Guide](.ai/README.md)

---

## 📦 Release Process

Eventuras uses [Changesets](https://github.com/changesets/changesets) for version management and automated deployments.

### Creating a Release

**In feature branches:**
```bash
# 1. Make your changes
# 2. Create a changeset describing your changes
pnpm changeset

# 3. Commit and create PR
git add .
git commit -m "feat: your feature"
git push
```

**After PR is merged to main:**
```bash
# 1. Switch to main and pull latest
git checkout main
git pull

# 2. Run the release command (this does everything automatically)
pnpm release
```

The `pnpm release` command will:
- ✅ Bump package versions based on accumulated changesets
- ✅ Update CHANGELOGs
- ✅ Commit version changes
- ✅ Create git tags
- ✅ Push to GitHub
- ✅ Trigger automated deployments

### Automated Deployments

- `@eventuras/api@*` tags → Deploy API to Azure
- `@eventuras/web@*` tags → Deploy web app to Vercel (prod-1 and prod-2)

**Note:** The packages `@eventuras/api`, `@eventuras/web`, and `@eventuras/event-sdk` have linked versions — they always bump together to the same version number.

---

## 🤝 Contributing

Contributions are welcome! Eventuras is open source, and we appreciate all forms of contributions — from bug fixes to new features.

See our [Contributing Guide](CONTRIBUTING.md) for detailed guidelines.

---

## 📜 License

This project is licensed under the [GNU General Public License v3.0](LICENSE).

**In short:**
- ✅ You may use, modify, and distribute the code
- ✅ Commercial use is permitted
- ⚠️ Changes must also be open source under GPL-3.0
- ⚠️ You must include the license and copyright notices

---

## 🙏 Acknowledgments

Eventuras is developed and maintained by [Losol AS](https://losol.no) and a dedicated community of contributors.

**Built with:** .NET, Next.js, PostgreSQL, React, TypeScript, Tailwind CSS, and many fantastic open-source libraries.

---

## 📬 Contact & Support

- **Issues:** [GitHub Issues](https://github.com/losol/eventuras/issues)
- **Discussions:** [GitHub Discussions](https://github.com/losol/eventuras/discussions)

---

Made with ❤️ to knowledge sharing. 

