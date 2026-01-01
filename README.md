# Global New Year - Instagram Template Generator

A React application for generating Global New Year Instagram templates, powered by Google Gemini AI.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```


### Development

To start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or `http://localhost:5173` depending on Vite configuration).

### Building

To build the project for production:
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Preview

To preview the production build locally:
```bash
npm run preview
```

## 🛠 Deployment

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

### Steps to Deploy:
1. Push your changes to the `main` or `master` branch.
2. The "Deploy to GitHub Pages" workflow will automatically trigger.
3. Once completed, your site will be live at `https://<your-username>.github.io/<repo-name>/`.

### Configuration
- The deployment workflow file is located at `.github/workflows/deploy.yml`.
- Ensure your GitHub repository settings have Pages enabled and set to "GitHub Actions" source.

## 📁 Project Structure

- `src/` - Source code for the application
- `public/` - Static assets
- `dist/` - Production build output (ignored by git)
