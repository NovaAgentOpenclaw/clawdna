# ClawDNA Frontend

React + TypeScript + Tailwind CSS dashboard for visualizing agent evolution.

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:3000

## 🛠️ Build

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   └── Dashboard.tsx    # Main dashboard component
├── hooks/
│   └── useSimulation.ts # Evolution simulation logic
├── types/
│   └── index.ts         # TypeScript types
├── utils/
│   └── index.ts         # Helper functions
├── App.tsx
├── main.tsx
└── index.css            # Tailwind + custom styles
```

## 🎨 Design System

- **Colors**: Dark theme with neon green (#4ade80) accents
- **Spacing**: 8pt grid system
- **Typography**: Inter (sans), JetBrains Mono (mono)
- **Components**: Glass-morphism panels with backdrop blur

## 📊 Features

- Real-time evolution timeline (Chart.js)
- Interactive trait radar charts
- Genealogy tree visualization
- Top agents leaderboard
- Configurable simulation parameters
