# Phoenix Admin UI

A modern, responsive admin panel built with React + Vite for managing mail services, domains, organizations, and more.

[![Discord](https://img.shields.io/discord/29zTxvque?label=Discord&logo=discord&logoColor=white&color=5865F2)](https://discord.gg/29zTxvque)

> 💬 **Join our community on Discord:** [discord.gg/29zTxvque](https://discord.gg/29zTxvque) — ask questions, report bugs, share ideas, and get involved.

## 🔗 Related Projects

| Project | Description |
| --- | --- |
| [Phoenix-Admin-API](https://github.com/Yukthi-Systems/Phoenix-Admin-API) | Backend API |

## 🚀 Features

- **Dashboard** - Overview of system metrics and statistics
- **Organization Management** - Manage organizations and hierarchies
- **CRM Module** - Services, Purchase Orders, and Invoicing
- **Mail Manager** - Domains, Mailboxes, Cautions, Disclaimers, and Departments
- **Policy Management** - Incoming/Outgoing policies and rules
- **Logs & Monitoring** - Audit logs, mail flow logs, and login attempts
- **Server Management** - Server stats, migrations, and domain migrations
- **User Management** - Admin users and permission templates
- **AI Support** - Built-in AI chat assistant for help and guidance
- **Multi-language Support** - Internationalization with i18n
- **Dark/Light Theme** - Responsive theme switching
- **Permission-based Access** - Role-based access control

## 🛠️ Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **State Management**: Jotai
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form + Yup validation
- **Routing**: React Router v7
- **Icons**: Lucide React
- **UI Components**: Custom components with Tailwind
- **Select Components**: React Select
- **Internationalization**: react-i18next

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Yukthi-Systems/Phoenix-Admin-UI
cd Phoenix-Admin-UI
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

Copy `.env.example` to `.env` and fill in your own values:

```bash
cp .env.example .env
```

```env
VITE_API_URL=
VITE_WSS_URL=
VITE_DNS_URL=
VITE_DNS_API_KEY=
VITE_BASE_ORG=
VITE_APP_NAME=
VITE_APP_VERSION=
VITE_BUILD_DATE=
VITE_API_VERSION=
VITE_ENVIRONMENT=
VITE_COPYRIGHT=
VITE_RUM_CLIENT_TOKEN=
VITE_RUM_SITE=
```

### 4. Start the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at `http://localhost:5173`

## 📦 Build for Production

To create a production build:

```bash
npm run build
# or
yarn build
# or
pnpm build
```

To preview the production build:

```bash
npm run preview
# or
yarn preview
# or
pnpm preview
```

## 🏗️ Project Structure

```
src/
├── api/                 # API service functions
├── components/          # Reusable UI components
│   ├── common/         # Common components (buttons, inputs, etc.)
│   ├── shared/         # Shared components (header, sidebar, etc.)
│   └── ui/             # Base UI components
├── constants/          # Application constants
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── store/              # Jotai atoms and state management
├── utils/              # Utility functions
├── App.jsx             # Main App component
└── main.jsx            # Application entry point
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🌟 Key Features Explained

### State Management

- **Jotai**: Atomic state management for user info, profiles, and UI state
- **TanStack Query**: Server state management with caching and synchronization

### Styling

- **Tailwind CSS**: Utility-first CSS framework
- **CSS Custom Properties**: Theme variables for dark/light mode
- **Responsive Design**: Mobile-first approach

### Form Handling

- **React Hook Form**: Performant forms with easy validation
- **Yup**: Schema validation for form inputs
- **React Select**: Enhanced select components with search and styling

### Authentication & Permissions

- **JWT-based Authentication**: Secure user authentication
- **Role-based Access Control**: Permission-based feature access
- **Atomic User State**: Centralized user information management

### AI Integration

- **AI Chat Assistant**: Built-in help system with markdown support
- **Context-aware Help**: Page-specific guidance and documentation

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow (fork, branch naming, commit conventions, PR checklist).

Found a bug or have a feature request? [Open an issue](https://github.com/Yukthi-Systems/Phoenix-Admin-UI/issues/new/choose).

## 📝 Code Style

This project uses ESLint for code linting. Run `npm run lint` to check for issues.

### Key conventions:

- Use functional components with hooks
- Follow Tailwind CSS utility patterns
- Use Jotai atoms for global state
- Use React Query for server state
- Keep components small and focused

## 🐛 Troubleshooting

### Common Issues

**Build fails with module not found**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Development server won't start**

```bash
# Check if port 5173 is available
lsof -ti:5173
# Kill the process if needed
kill -9 [PID]
```

**API connection issues**

- Verify your `VITE_API_URL` in `.env`
- Check if backend server is running
- Verify CORS settings on backend

## 💬 Community

Join our [Discord server](https://discord.gg/29zTxvque) to chat with maintainers and other contributors, ask questions, and stay up to date with the project.

## 📄 License

This project is licensed under the [GNU General Public License v3.0](LICENSE).

---

**Built with ❤️ by Yukthi Systems**
