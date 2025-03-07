# Cuan - Personal Financial Management Application

![Cuan Screenshot](Screenshot_8-3-2025_13259_127.0.0.1.jpeg)

**Cuan** is a personal financial management application that makes it easy to manage your finances. This application helps you record and monitor expenses, income, and transfers between accounts in an intuitive and modern interface.

> **Cuan**: Catat Uang, Analisis, Nikamati!

## Key Features

- **Dashboard** - Visualization and summary of finances with interactive graphs
- **Transactions** - Recording income, expenses, and transfers between accounts
- **Categories** - Management of transaction categories for income and expenses
- **Accounts** - Management of various types of financial accounts
- **Reports** - Financial analysis with various filters and periods
- **Responsive** - Optimal interface for desktop and mobile

## Technology

- **Frontend**: React, TypeScript, Tailwind CSS
- **State Management**: React Hooks
- **Routing**: React Router
- **Visualization**: Chart.js
- **UI Components**: Headless UI, Heroicons
- **Toast Notifications**: React Hot Toast

## Installation

```bash
# Clone repository
git clone https://github.com/yudopr11/cuan.git

# Enter the project directory
cd cuan

# Install dependencies
npm install

# Run the app in development mode
npm run dev
```

## Project Structure

```
/src
  /components          # Komponen React
    /accounts          # Komponen terkait akun/rekening
    /auth              # Komponen autentikasi
    /categories        # Komponen kategori transaksi
    /common            # Komponen yang digunakan di berbagai tempat
    /dashboard         # Komponen dashboard utama
    /layout            # Layout dan struktur halaman
    /settings          # Komponen pengaturan aplikasi
    /transactions      # Komponen transaksi keuangan
  /hooks               # Custom React hooks
  /services            # Layanan dan utilitas aplikasi
  /utils               # Fungsi utilitas
```

## Security

- User authentication with tokens
- Sensitive data encryption
- Input validation to prevent injection

## Development

### Prerequisites

- Node.js (version 16.x or later)
- npm or yarn

### Build for Production

```bash
npm run build
```

## Deployments

### Railway

Deploying to Railway is simple:

1. Create an account on [Railway](https://railway.app)
2. Click "New Project" on the Railway dashboard or "New Services" inside Railway Project
3. Select "Deploy from GitHub repo"
4. Choose your cloned repository
5. Railway will automatically detect the Vite configuration and deploy your site

That's it! Railway will automatically build and deploy your application. If needed, you can add environment variables in your project settings.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## Acknowledgments
- Created by [yudopr](https://github.com/yudopr11)
- Built with [Vite](https://vitejs.dev/), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS](https://tailwindcss.com/)
- Deploy with [Railway](https://railway.app)