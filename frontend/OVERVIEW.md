# ResumeRAG Frontend - Project Overview

## 🎯 What Was Built

A complete, production-ready React frontend for ResumeRAG with:
- **Modern purple gradient UI** matching your image reference
- **Full authentication system** with JWT support
- **Drag-and-drop resume uploads**
- **Job description management**
- **AI match results visualization**
- **Smooth animations** using Framer Motion
- **Fully responsive** design with Tailwind CSS

## 📁 File Structure Overview

```
frontend/
├── src/
│   ├── api/                    # Backend API integration
│   │   ├── axios.js           # Configured Axios instance with interceptors
│   │   ├── authService.js     # Login/Register/Logout
│   │   ├── resumeService.js   # Resume upload & management
│   │   └── jobService.js      # Job description & matching
│   │
│   ├── components/            # Reusable UI components
│   │   ├── Navbar.jsx         # Top navigation with auth state
│   │   ├── HeroSection.jsx    # Landing page hero with 3 cards
│   │   ├── UploadCard.jsx     # Drag-and-drop file upload
│   │   ├── JobDescriptionCard.jsx  # Job input (paste/upload)
│   │   ├── ResultsCard.jsx    # Match score display
│   │   └── ProtectedRoute.jsx # Auth route wrapper
│   │
│   ├── pages/                 # Page-level components
│   │   ├── Landing.jsx        # Home page (/)
│   │   ├── Login.jsx          # Login page (/login)
│   │   ├── Register.jsx       # Registration (/register)
│   │   ├── Upload.jsx         # Resume upload (/upload) 🔒
│   │   ├── Jobs.jsx           # Job descriptions (/jobs) 🔒
│   │   └── Results.jsx        # Match results (/results) 🔒
│   │
│   ├── context/
│   │   └── AuthContext.jsx    # Global auth state management
│   │
│   ├── App.jsx                # Main app with routing
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles + Tailwind
│
├── tailwind.config.js        # Custom colors & animations
├── postcss.config.js
├── .env.example             # Environment template
└── package.json

🔒 = Protected route (requires login)
```

## 🎨 Design Features

### Color Scheme
- **Purple Gradient Background**: `from-purple-800 via-indigo-700 to-purple-900`
- **Dark Cards**: `#1A1A2E` with glow effects
- **Accent Purple**: `#a855f7` for buttons and highlights
- **Text**: White primary, gray-400 secondary

### UI Components
1. **Glowing Cards**: Hover effects with purple shadows
2. **Neumorphic Buttons**: Gradient backgrounds with smooth transitions
3. **Glassmorphism**: Backdrop blur on navbar
4. **Custom Scrollbar**: Purple-themed

### Animations
- Page transitions with Framer Motion
- Hover scale effects on cards
- Fade-in animations on load
- Staggered children animations

## 🔌 API Integration Points

All API calls are ready to connect to your backend:

### Authentication (`authService.js`)
```javascript
POST /api/auth/login       // Login user
POST /api/auth/register    // Register new user
```

### Resumes (`resumeService.js`)
```javascript
POST /api/resumes          // Upload resume file
GET  /api/resumes          // List all resumes (paginated)
GET  /api/resumes/:id      // Get single resume
DELETE /api/resumes/:id    // Delete resume
```

### Jobs (`jobService.js`)
```javascript
POST /api/jobs             // Create job (text)
POST /api/jobs/upload      // Upload job description file
GET  /api/jobs             // List jobs (paginated)
GET  /api/jobs/:id         // Get job details
POST /api/jobs/:id/match   // Get AI match results
DELETE /api/jobs/:id       // Delete job
```

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API:**
   ```bash
   cp .env.example .env
   # Edit .env and set VITE_API_BASE_URL
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🎯 User Flow

1. **Landing Page** → User sees hero section with 3-step process
2. **Sign Up/Login** → User creates account or logs in
3. **Upload Resume** → Drag-and-drop PDF/DOCX file
4. **Add Job Description** → Paste text or upload file
5. **View Results** → See match scores, skill gaps, download tailored resume

## 🔐 Authentication Flow

- JWT tokens stored in `localStorage`
- Automatic token injection via Axios interceptors
- Protected routes redirect to `/login` if not authenticated
- User data persists across page refreshes
- Automatic logout on 401 responses

## 🎭 Page-by-Page Breakdown

### Landing Page (`/`)
- Hero with "Your Resume, Smarter" heading
- 3 animated cards showing the process
- "Get Started" button (links to login if not authenticated)

### Login (`/login`)
- Email and password fields
- Error handling with styled alerts
- Link to registration page

### Register (`/register`)
- Name, email, password, confirm password fields
- Client-side validation
- Link to login page

### Upload (`/upload`) 🔒
- Drag-and-drop zone
- File validation (PDF/DOCX, max 10MB)
- Upload progress feedback
- Auto-redirect to jobs page on success

### Jobs (`/jobs`) 🔒
- Toggle between paste text / upload file
- Job title + description fields
- File upload for job descriptions
- Auto-redirect to results on success

### Results (`/results`) 🔒
- Grid of match result cards
- Match score with color coding (green/yellow/red)
- Matched skills badges
- Missing skills badges
- Download button for tailored resume

## 🎨 Styling Guide

### Custom Tailwind Classes

```css
.gradient-bg          // Main purple gradient
.card-glow           // Glowing card with hover
.btn-primary         // Primary purple button
.btn-secondary       // Outlined purple button
```

### Color Variables (tailwind.config.js)

```javascript
dark: {
  100: '#2D2D44',
  200: '#25253F',
  300: '#1F1F35',
  400: '#1A1A2E',  // Main card background
  500: '#16162A',
}
```

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3 | UI Framework |
| Vite | 7.1 | Build Tool |
| Tailwind CSS | 3.4 | Styling |
| React Router | 6.x | Routing |
| Framer Motion | Latest | Animations |
| Axios | Latest | HTTP Requests |
| React Icons | Latest | Icons |

## 📦 NPM Scripts

```bash
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🔧 Customization Tips

### Change Primary Color
Edit `tailwind.config.js` and replace purple-* with your color.

### Add New Route
1. Create page in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation link in `Navbar.jsx`

### Add API Endpoint
1. Create function in appropriate service file
2. Use `axiosInstance` for automatic auth headers
3. Handle errors with try/catch

## 📝 Next Steps

1. **Connect to Backend**: Update `.env` with your API URL
2. **Replace Mock Data**: The Results page uses mock data - replace with real API calls
3. **Add Features**:
   - Resume preview
   - Job search history
   - User profile page
   - Download analytics
4. **Deploy**: Build and deploy to Vercel, Netlify, or your preferred host

## 🐛 Known Placeholders

- **Results Page**: Currently shows mock match data
- **API Calls**: Will fail until backend is connected
- **Download Button**: Placeholder URL - needs backend integration

## 💡 Tips

- The app is fully functional for UI/UX testing without a backend
- Mock data in Results page can be modified in `Results.jsx`
- All forms have validation and error handling
- JWT tokens auto-refresh not implemented (add if needed)

---

**Ready to integrate with your AI backend!** 🚀
