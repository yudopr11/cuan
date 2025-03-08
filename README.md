# Cuan - Personal Financial Management Made Easy

Cuan (Catat Uang, Analisis, Nikmati!) is a modern personal financial management application that makes it easy to track and analyze your finances with an intuitive and beautiful interface.

![Cuan Screenshot](Screenshot_8-3-2025_13259_127.0.0.1.jpeg)

## Features

* 💰 Track income, expenses, and transfers between accounts
* 📊 Interactive dashboard with financial visualizations
* 🗂️ Organize transactions with customizable categories
* 💼 Manage multiple financial accounts in one place
* 📈 Generate detailed financial reports with various filters
* 🔒 Secure user authentication with token-based security
* 🎨 Modern dark-themed UI for reduced eye strain
* 📱 Responsive design for desktop and mobile devices

## Tech Stack

* **Frontend Framework**: React with TypeScript
* **Styling**: Tailwind CSS
* **Build Tool**: Vite
* **UI Components**:  
   * Headless UI for accessible components  
   * Heroicons for beautiful icons
* **Visualization**: Chart.js for financial graphs
* **State Management**: React Hooks
* **Routing**: React Router
* **Notifications**: React Hot Toast
* **Security**:  
   * Token-based authentication  
   * Encryption for sensitive data  
   * Input validation against injection
* **Development Tools**:  
   * ESLint for code quality  
   * TypeScript for type safety  
   * PostCSS for CSS processing

## UI Design

Cuan features a modern, intuitive interface with a clean design that makes financial management a pleasant experience. The interface uses a carefully designed color scheme with:

* Dark mode support for reduced eye strain
* Intuitive navigation between different sections
* Interactive charts and visualizations
* Clean, uncluttered transaction views
* Responsive design that works on all devices

## Getting Started

1. Clone the repository

```bash
git clone https://github.com/yourusername/cuan.git
cd cuan
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables (if applicable)

```bash
cp .env.example .env
```

Edit `.env` with your configuration.

4. Start development server

```bash
npm run dev
```

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` file to version control
   - Use different encryption keys for development and production
   - Keep your production encryption key secure

2. **Token Storage**
   - JWT tokens are encrypted using AES before storage in localStorage
   - Tokens are automatically decrypted when making API requests
   - Failed encryption/decryption is logged with fallback behavior
   - Error handling provides security-related feedback without exposing sensitive details

3. **Authentication**
   - Axios interceptors automatically handle authentication and refresh tokens
   - Toast notifications for authentication errors with appropriate error messages
   - Automatic redirection for expired sessions

4. **Data Security**  
   * Encryption of sensitive financial data  
   * Input validation to prevent injection attacks  
   * Secure API communication

## Project Structure

```
cuan/
├── public/               # Static assets
├── src/                  # Source code
│   ├── components/       # React components
│   │   ├── accounts/     # Account management components
│   │   ├── auth/         # Authentication components
│   │   ├── categories/   # Category management components
│   │   ├── common/       # Shared/common components
│   │   ├── dashboard/    # Dashboard and visualization components
│   │   ├── layout/       # Page layout components
│   │   ├── settings/     # Application settings components
│   │   └── transactions/ # Transaction management components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API and services
│   ├── utils/            # Utility functions
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
├── index.html           # HTML entry point
├── package.json         # Project dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Deployment

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

* Created by [yudopr](https://github.com/yudopr11)
* Built with [Vite](https://vitejs.dev/), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS](https://tailwindcss.com/)
* Deploy with [Railway](https://railway.app)