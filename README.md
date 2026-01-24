# 🗺️ RELTO - Community Lost & Found Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-v18%2B-green.svg)
![React](https://img.shields.io/badge/react-v18.3-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-v5.9-blue.svg)
![Vite](https://img.shields.io/badge/vite-v7.2-purple.svg)

> **Reuniting people with their belongings through community power, interactive maps, and gamification.**

RELTO is a modern, full-stack web application designed to simplify the process of reporting lost and found items. By leveraging geolocation, real-time mapping, and a gamified reward system, RELTO encourages community participation to help recovery efforts.

---

## 🌟 Key Features

### 📍 Interactive Map Interface
- **Real-time Visualization**: Mapbox GL powered map displaying lost and found items in your vicinity.
- **Smart Navigation**: Animated fly-to transitions and visual route lines connecting you to items.
- **Geolocation Support**: Automatically detects your location to show relevant nearby items.

### 📦 Comprehensive Item Management
- **Easy Reporting**: 3-step wizard to post found items with images, details, and precise coordinates.
- **16 Categories**: Specialized categorization including Wallet, Phone, Keys, Pets (Dog/Cat), Documents, Electronics, and more.
- **Urgency Levels**: Visual indicators for high-priority items.
- **Claim System**: Secure workflow for owners to claim items and finders to verify ownership.

### 💬 Secure Communication
- **In-App Chat**: Private conversations between finders and owners without exposing personal contact details.
- **Notifications**: Real-time alerts for claims, messages, and status updates.

### 🎮 Gamification & Rewards
- **Points System**: Earn points for good deeds (50 pts for posting, 100 for claiming, 200 for successful returns).
- **Ranking System**: Climb the ladder from **Beginner** to **Legend**.
- **Achievements**: Unlock badges for milestones like "First Post" or "Good Samaritan".
- **Leaderboards**: (Coming Soon) Compete with other community members.

### 🛡️ Safety & Privacy
- **Reporting System**: Users can report suspicious items or behavior.
- **Radius Privacy**: Approximate location circles to protect finder privacy.
- **Auth Security**: JWT-based authentication with bcrypt password hashing.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + PostCSS
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Maps**: [React Map GL](https://visgl.github.io/react-map-gl/) / Mapbox GL
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend (Server)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Image Storage**: [Cloudinary](https://cloudinary.com/)
- **File Uploads**: Multer
- **Email**: Nodemailer (for notifications)

---

## 📂 Project Structure

Verified structure of the codebase:

```
RELTO/
├── client/                 # Frontend Application
│   ├── src/
│   │   ├── app/            # App entry & Providers
│   │   ├── components/     # Reusable UI components
│   │   ├── features/       # Feature-based modules
│   │   │   ├── auth/       # Login/Register logic
│   │   │   ├── chat/       # Messaging system
│   │   │   ├── items/      # Item display & management
│   │   │   ├── map/        # Map visualization components
│   │   │   ├── post-item/  # Reporting wizard
│   │   │   └── report/     # Safety reporting
│   │   ├── pages/          # Route pages (Map, Profile, etc.)
│   │   ├── store/          # Zustand global stores
│   │   └── types/          # TypeScript definitions
│   └── ...
│
└── server/                 # Backend API
    ├── src/
    │   ├── config/         # DB & Cloudinary setup
    │   ├── controllers/    # Route logic handlers
    │   ├── middlewares/    # Auth & Upload middlewares
    │   ├── models/         # Mongoose Schemas (User, Item, Report)
    │   ├── routes/         # API Route definitions
    │   └── utils/          # Helpers
    └── ...
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18 or higher
- **MongoDB**: Local instance or MongoDB Atlas URI
- **Cloudinary Account**: For image storage
- **Mapbox Token**: Customizable map interface

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/RELTO.git
   cd RELTO
   ```

2. **Install Server Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Environment Configuration

Create a `.env` file in both `client` and `server` directories.

**Server** (`server/.env`):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/Relto
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Client** (`client/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_MAPBOX_TOKEN=your_mapbox_public_token
```

### Running the Application

**Development Mode** (Run both terminals):

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

Visit `http://localhost:5173` to view the application.

---

## 📡 API Reference

### Auth & Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/users/register` | Register new user | No |
| `POST` | `/api/users/login` | Login user | No |
| `GET` | `/api/users/me` | Get current user profile | Yes |

### Items
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/items` | List all items | Yes |
| `POST` | `/api/items` | Report found item | Yes |
| `GET` | `/api/items/nearby` | Get items near location | Yes |
| `GET` | `/api/items/:id` | Get item details | Yes |
| `PATCH` | `/api/items/:id/claim` | Claim an item | Yes |
| `PATCH` | `/api/items/:id/resolve` | Mark as returned | Yes |
| `DELETE`| `/api/items/:id` | Delete an item | Yes |

### Conversations (Chat)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/conversations` | Get my conversations | Yes |
| `POST` | `/api/conversations` | Start new conversation | Yes |
| `GET` | `/api/conversations/:id/messages` | Get messages | Yes |
| `POST` | `/api/conversations/:id/messages` | Send message | Yes |

### Reports
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/reports` | Create safety report | Yes |

---

## 🏆 Points System

| Action | Points | Rank Progression |
|--------|--------|------------------|
| **Post Item** | +50 | **Beginner**: 0 - 1,999 |
| **Claim Item** | +100 | **Helper**: 2,000 - 4,499 |
| **Return Item** | +200 | **Expert**: 4,500 - 7,499 |
| | | **Master**: 7,500 - 9,999 |
| | | **Legend**: 10,000+ |

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any features, bug fixes, or enhancements.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
