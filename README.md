# RELTO
A community-driven lost and found platform with an interactive map interface. Users can report found items, claim lost belongings, and earn rewards for helping reunite items with their owners.

## Features

### Interactive Map
- **Mapbox GL** powered map view with real-time item markers
- Geolocation-based nearby item discovery
- Animated fly-to navigation when selecting items
- Visual route lines showing distance to selected items

### Item Management
- Post found items with photos, descriptions, and precise locations
- **16 item categories** with urgency levels: Wallet, Phone, Keys, Pets (Dog/Cat), Bags, Documents, Watch, Glasses, Headphones, Camera, Books, Cards, Jewelry, and more
- Claim system connecting finders with owners
- Item expiration dates for automatic cleanup
- Radius-based location privacy

### Gamification System
- **Points**: 50 pts for posting, 100 pts for claiming, 200 pts for confirming returns
- **Leveling**: Progress through ranks (Beginner → Helper → Expert → Master → Legend)
- **Achievements**: Unlock badges like "First Post", "Good Samaritan", "Lucky Finder"
- Profile statistics tracking posts, claims, and returns

### Authentication
- JWT-based secure authentication
- User registration with phone verification
- Protected routes and API endpoints

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS 3 | Styling |
| Zustand | State Management |
| React Router 7 | Routing |
| React Map GL / Mapbox GL | Maps |
| Framer Motion | Animations |
| React Hook Form | Form Handling |
| React Hot Toast | Notifications |
| Lucide React | Icons |
| Axios | HTTP Client |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | Server Framework |
| TypeScript | Type Safety |
| MongoDB + Mongoose | Database + ODM |
| Cloudinary | Image Storage |
| JWT + bcryptjs | Authentication |
| Multer | File Uploads |

## Project Structure

```
Relto/
├── client/
│   ├── src/
│   │   ├── app/              # App, Providers, Router setup
│   │   ├── components/
│   │   │   ├── feedback/     # EmptyState, UserStatsBadge
│   │   │   ├── layout/       # ItemsSidebar
│   │   │   └── ui/           # Button, Input, Modal, Sheet, Select, etc.
│   │   ├── features/
│   │   │   ├── auth/         # LoginForm, RegisterForm
│   │   │   ├── items/        # ItemCard, ItemList, ItemDetailsSheet
│   │   │   ├── map/          # MapView, ItemMarker, UserMarker
│   │   │   └── post-item/    # PostItemModal (3-step wizard)
│   │   ├── pages/            # LoginPage, RegisterPage, MapPage, ProfilePage
│   │   ├── services/         # API client, auth & item services
│   │   ├── store/            # Zustand stores (auth, item, map)
│   │   ├── types/            # TypeScript types & category configs
│   │   └── utils/            # Date, location, gamification helpers
│   └── public/
│
└── server/
    └── src/
        ├── config/           # MongoDB & Cloudinary config
        ├── controllers/      # User & Item controllers
        ├── middlewares/      # Auth guard, Multer upload
        ├── models/           # User & Item Mongoose schemas
        ├── routes/           # API route definitions
        └── utils/            # Gamification logic
```

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Mapbox account (for map access token)
- Cloudinary account (for image uploads)

### Environment Variables

**Server** (`server/.env`):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/Relto
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Client** (`client/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_MAPBOX_TOKEN=your_mapbox_access_token
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Relto.git
cd Relto

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Development

```bash
# Terminal 1: Start backend (runs on port 5000)
cd server
npm run dev

# Terminal 2: Start frontend (runs on port 5173)
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
# Build server
cd server
npm run build
npm start

# Build client
cd client
npm run build
npm run preview
```

## API Reference

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/users/register` | Create new account | No |
| `POST` | `/api/users/login` | Login & get token | No |
| `GET` | `/api/users/me` | Get current user profile | Yes |

### Items
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/items` | Get all unresolved items | Yes |
| `POST` | `/api/items` | Post new item (with image) | Yes |
| `GET` | `/api/items/nearby?lat=&lng=&radius=` | Get nearby items | Yes |
| `GET` | `/api/items/:id` | Get item details | Yes |
| `PATCH` | `/api/items/:id/claim` | Claim an item | Yes |
| `PATCH` | `/api/items/:id/resolve` | Mark item as returned | Yes |

## User Flow

1. **Register/Login** → Create account with name, email, phone, password
2. **Browse Map** → View nearby lost/found items on interactive map
3. **Post Found Item** → 3-step wizard: Select type → Enter details → Pick location
4. **Claim Item** → Contact finder to arrange pickup
5. **Confirm Return** → Owner marks item as returned, both earn points
6. **Track Progress** → View stats, level, and achievements on profile

## Points & Levels

| Action | Points |
|--------|--------|
| Post an item | +50 |
| Claim an item | +100 |
| Confirm return | +200 |

| Level | Points Required | Rank |
|-------|-----------------|------|
| 1-4 | 0-1999 | Beginner |
| 5-9 | 2000-4499 | Helper |
| 10-14 | 4500-7499 | Expert |
| 15-19 | 7500-9999 | Master |
| 20+ | 10000+ | Legend |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">Built for communities to help reunite people with their belongings</p>
