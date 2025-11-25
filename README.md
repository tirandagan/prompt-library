# PromptForge 🚀

A modern, responsive web application for browsing and discovering curated LLM prompts. Built with Next.js 16, TypeScript, Tailwind CSS v4, and PostgreSQL.

![PromptForge](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwind-css)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat-square&logo=postgresql)

## ✨ Features

- 🎨 **Modern UI/UX** - Beautiful, responsive design with smooth animations
- 🔍 **Advanced Search** - Find prompts by category, tool, or keyword
- 📱 **Mobile-First** - Fully responsive across all devices
- 💾 **PostgreSQL Database** - Robust data storage with Drizzle ORM
- 🎯 **Type-Safe** - Full TypeScript support
- ⚡ **Fast Performance** - Optimized with Next.js 16 and Turbopack
- 🎨 **OKLCH Colors** - Modern color system for better consistency
- 📋 **Copy to Clipboard** - One-click prompt copying
- ❤️ **Like & View Tracking** - Engagement metrics
- 🏷️ **Tag System** - Organize prompts with tags

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Components**: Custom components with Radix UI primitives

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ database

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone git@github.com:tirandagan/prompt-library.git
cd prompt-library
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file and configure your database:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your PostgreSQL connection string:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/promptforge
```

### 4. Set up the database

Generate the database schema:

```bash
npm run db:generate
```

Push the schema to your database:

```bash
npm run db:push
```

Seed the database with initial data:

```bash
npm run db:seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## 📁 Project Structure

```
prompt-library/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── category/[id]/     # Category browsing page
│   │   ├── prompt/[id]/       # Prompt detail page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── Navbar.tsx        # Navigation component
│   │   └── PromptCard.tsx    # Prompt card component
│   ├── db/                   # Database layer
│   │   ├── schema.ts         # Drizzle schema definitions
│   │   ├── queries.ts        # Database query functions
│   │   ├── index.ts          # Database connection
│   │   └── seed.ts           # Database seed script
│   ├── hooks/                # Custom React hooks
│   └── lib/                  # Utility functions
├── design/                   # Design documents & plans
├── drizzle/                  # Generated migrations
├── public/                   # Static assets
└── package.json
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- **categories** - Prompt categories (Marketing, Coding, etc.)
- **tools** - AI tools (ChatGPT, Midjourney, etc.)
- **prompts** - The actual prompts with metadata
- **tags** - Tags for organizing prompts
- **prompt_categories** - Many-to-many relationship
- **prompt_tools** - Many-to-many relationship
- **prompt_tags** - Many-to-many relationship

## 🎨 Design System

The application uses a modern design system with:

- **OKLCH color space** for better color consistency
- **Inter font family** for clean typography
- **Consistent spacing scale** based on Tailwind
- **Smooth animations** and micro-interactions
- **Dark mode support** (system preference)

## 🔧 Configuration

### Tailwind CSS v4

The project uses Tailwind CSS v4 with custom theme configuration in `src/app/globals.css`.

### Drizzle ORM

Database configuration is in `drizzle.config.ts`. The schema is defined in `src/db/schema.ts`.

## 📝 Adding New Prompts

You can add prompts through:

1. **Database directly** - Insert into the `prompts` table
2. **Seed script** - Modify `src/db/seed.ts`
3. **Future admin panel** - Coming soon!

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add your `DATABASE_URL` environment variable
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify

Make sure to:
- Set the `DATABASE_URL` environment variable
- Run database migrations before deployment
- Set `NODE_ENV=production`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Design inspired by modern SaaS applications
- Built with amazing open-source tools
- Community feedback and contributions

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

Built with ❤️ using Next.js and TypeScript
