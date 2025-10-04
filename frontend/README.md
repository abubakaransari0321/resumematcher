# ResumeRAG Frontend

A stunning, AI-powered resume tailoring web application built with React, Vite, and Tailwind CSS. Features a modern purple gradient UI with smooth animations and glassmorphic effects.

![ResumeRAG](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

- 🎨 **Modern UI Design**: Purple gradient background with glowing cards and neumorphic buttons
- 🔐 **Authentication**: JWT-based login/register system
- 📤 **Resume Upload**: Drag-and-drop file upload with validation
- 💼 **Job Matching**: AI-powered resume-job matching (API integration ready)
- 📊 **Results Dashboard**: Visual match scores with skill gap analysis
- 🎭 **Smooth Animations**: Framer Motion animations throughout
- 📱 **Responsive**: Mobile-first design with Tailwind CSS
- 🚀 **Fast**: Vite for lightning-fast development and builds

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── api/              # API service layer
│   │   ├── axios.js
│   │   ├── authService.js
│   │   ├── resumeService.js
│   │   └── jobService.js
│   ├── components/       # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── HeroSection.jsx
│   │   ├── UploadCard.jsx
│   │   ├── JobDescriptionCard.jsx
│   │   ├── ResultsCard.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/           # Page components
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Upload.jsx
│   │   ├── Jobs.jsx
│   │   └── Results.jsx
│   ├── context/         # React Context providers
│   │   └── AuthContext.jsx
│   ├── App.jsx          # Main app component with routing
│   └── main.jsx         # Entry point
├── tailwind.config.js   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ResumeMatcher/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure your backend API URL:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## 🎨 UI Components

### Pages

- **Landing (`/`)**: Hero section with 3-step process cards
- **Login (`/login`)**: Authentication page
- **Register (`/register`)**: User registration page
- **Upload (`/upload`)**: Resume upload with drag-and-drop *(Protected)*
- **Jobs (`/jobs`)**: Job description input *(Protected)*
- **Results (`/results`)**: Match results with download options *(Protected)*

### Key Components

- **Navbar**: Responsive navigation with auth state
- **HeroSection**: Animated landing section with purple gradients
- **UploadCard**: Drag-and-drop file upload component
- **JobDescriptionCard**: Paste or upload job descriptions
- **ResultsCard**: Display match scores and skill gaps
- **ProtectedRoute**: Route wrapper for authenticated pages

## 🔌 API Integration

The frontend is ready to integrate with your backend API. Update the following in your `.env`:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api
```

### API Endpoints Expected

```
POST   /api/auth/login          - User login
POST   /api/auth/register       - User registration
POST   /api/resumes             - Upload resume
GET    /api/resumes             - List resumes (with pagination)
GET    /api/resumes/:id         - Get resume details
POST   /api/jobs                - Create job description
POST   /api/jobs/:id/match      - Get match results
```

## 🎨 Customization

### Colors

Edit `tailwind.config.js` to customize the color scheme:

```js
theme: {
  extend: {
    colors: {
      dark: {
        400: '#1A1A2E', // Card background
      },
    },
  },
}
```

### Animations

Animations are implemented with Framer Motion. Customize in individual components or add global animations in `index.css`.

## 🛠️ Tech Stack

- **React 18.3** - UI library
- **Vite 7.1** - Build tool
- **Tailwind CSS 3.4** - Utility-first CSS
- **React Router v6** - Client-side routing
- **Framer Motion** - Animation library
- **Axios** - HTTP client
- **React Icons** - Icon library

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Design inspired by modern gradient-based UIs
- Icons from [React Icons](https://react-icons.github.io/react-icons/)
- Animations powered by [Framer Motion](https://www.framer.com/motion/)

---

**Built with ❤️ using React + Vite + Tailwind CSS**
