# ClimateGuard 🌍

**Your AI-powered climate resilience companion**

ClimateGuard is a comprehensive mobile-first web application built with React Native and Expo that helps individuals and communities take meaningful climate action. The app provides real-time environmental monitoring, AI-powered insights, community project coordination, and emergency preparedness tools.

![Built on Bolt](https://img.shields.io/badge/Built%20on-Bolt-blue?style=for-the-badge)
![Expo SDK](https://img.shields.io/badge/Expo%20SDK-52.0.30-black?style=for-the-badge&logo=expo)
![React Native](https://img.shields.io/badge/React%20Native-0.79.1-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=for-the-badge&logo=typescript)

## 🚀 Features

### 🌡️ Real-time Environmental Monitoring
- Live air quality index (AQI) tracking
- Weather conditions and forecasts
- Climate risk assessments
- UV index and health recommendations

### 🤖 AI-Powered Insights
- Personalized environmental recommendations
- Location-based action suggestions
- Interactive AI chat for climate guidance
- Dynamic tips based on current conditions

### 🤝 Community Action Platform
- Discover local environmental projects
- Join tree planting, cleanup, and conservation initiatives
- Create and organize community events
- Track collective impact metrics

### 🚨 Emergency Preparedness
- Climate-related alert system
- Emergency kit management
- Local emergency contacts
- Evacuation route information

### 🏆 Gamified Progress Tracking
- Achievement system with badges
- User levels and experience points
- Monthly environmental goals
- Community leaderboards

## 📱 Screenshots

*Add screenshots of your app here*

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo Router
- **Backend**: Supabase (Database, Auth, Real-time)
- **Styling**: React Native StyleSheet
- **Icons**: Lucide React Native
- **Location**: Expo Location
- **Deployment**: Netlify (Web), Expo (Mobile)

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 20+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tusharbhayani/climateguard.git
   cd climateguard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your API keys (see [Environment Setup](#environment-setup) below)

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   - Web: Open http://localhost:8081 in your browser
   - Mobile: Scan QR code with Expo Go app

## 🔧 Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration (Optional - app works with mock data)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# External API Keys (Optional - app works with mock data)
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key
EXPO_PUBLIC_AIRNOW_API_KEY=your_airnow_api_key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 🔑 How to Get API Keys

#### Supabase (Recommended for full functionality)

1. Go to [supabase.com](https://supabase.com)
2. Create a new account and project
3. Go to Settings → API
4. Copy your Project URL and anon/public key
5. Run the database migrations:
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link your project
   supabase link --project-ref your-project-ref
   
   # Push migrations
   supabase db push
   ```

#### OpenWeather API (Optional - for enhanced weather data)

1. Visit [openweathermap.org](https://openweathermap.org/api)
2. Sign up for a free account
3. Go to API Keys section
4. Generate a new API key
5. Add to your `.env` file

#### AirNow API (Optional - for enhanced air quality data)

1. Visit [airnowapi.org](https://docs.airnowapi.org/)
2. Request an API key
3. Add to your `.env` file

#### Google Maps API (Optional - for enhanced location services)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Maps JavaScript API
4. Create credentials (API Key)
5. Add to your `.env` file

**Note**: The app works perfectly with mock data if you don't want to set up external APIs immediately.

## 📱 Running the App

### Development Mode

```bash
# Start Expo development server
npm run dev

# Or with yarn
yarn dev
```

### Platform-Specific Commands

```bash
# Run on web
npm run web

# Run on iOS (requires macOS and Xcode)
npm run ios

# Run on Android (requires Android Studio)
npm run android
```

### Building for Production

```bash
# Build for web
npm run build:web

# Create production build
npx expo build:web
```

## 🗂️ Project Structure

```
climateguard/
├── app/                          # App routes (Expo Router)
│   ├── (tabs)/                   # Tab navigation
│   │   ├── index.tsx            # Home screen
│   │   ├── monitor.tsx          # Environmental monitoring
│   │   ├── community.tsx       # Community projects
│   │   ├── insights.tsx         # AI insights
│   │   ├── news.tsx             # Climate news
│   │   ├── achievements.tsx     # User achievements
│   │   ├── alerts.tsx           # Emergency alerts
│   │   └── profile.tsx          # User profile
│   ├── _layout.tsx              # Root layout
│   ├── index.tsx                # App entry point
│   └── onboarding.tsx           # User onboarding
├── components/                   # Reusable components
│   ├── AIChat.tsx               # AI chat interface
│   ├── AchievementCard.tsx      # Achievement display
│   ├── ClimateNewsCard.tsx      # News article card
│   ├── EmergencyContactCard.tsx # Emergency contact
│   ├── MonthlyGoalCard.tsx      # Goal tracking
│   └── UserLeaderboard.tsx      # Community leaderboard
├── contexts/                     # React contexts
│   └── ClimateContext.tsx       # Global app state
├── services/                     # API and data services
│   ├── aiService.ts             # AI recommendations
│   ├── climateNewsService.ts    # News aggregation
│   ├── communityService.ts      # Community features
│   ├── emergencyService.ts      # Emergency preparedness
│   ├── environmentalDataService.ts # Environmental data
│   ├── locationService.ts       # Location services
│   └── supabaseService.ts       # Database operations
├── supabase/                     # Database schema
│   └── migrations/              # Database migrations
├── presentation/                 # Project presentation
├── types/                        # TypeScript definitions
└── hooks/                        # Custom React hooks
```

## 🌐 Deployment

### Web Deployment (Netlify)

The app is automatically deployed to Netlify when you push to the main branch.

1. **Manual deployment**:
   ```bash
   npm run build:web
   # Upload dist folder to Netlify
   ```

2. **Automatic deployment**:
   - Connect your GitHub repo to Netlify
   - Set build command: `npm run build:web`
   - Set publish directory: `dist`

### Mobile Deployment

```bash
# Create development build
npx expo install --fix
npx expo run:ios
npx expo run:android

# Create production build
eas build --platform all
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **"Module not found" errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Expo CLI issues**
   ```bash
   # Update Expo CLI
   npm install -g @expo/cli@latest
   ```

3. **Environment variables not loading**
   - Ensure `.env` file is in root directory
   - Restart development server after adding variables
   - Check that variables start with `EXPO_PUBLIC_`

4. **Supabase connection issues**
   - Verify your Supabase URL and key in `.env`
   - Check that database migrations have been applied
   - Ensure RLS policies are properly configured

5. **Location services not working**
   - Grant location permissions in browser/device
   - Check that location services are enabled
   - App falls back to IP-based location if GPS fails

### Getting Help

- 📧 Email: support@climateguard.app
- 🐛 Issues: [GitHub Issues](https://github.com/tusharbhayani/climateguard/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/tusharbhayani/climateguard/discussions)

## 🎯 Roadmap

- [ ] Push notifications for climate alerts
- [ ] Offline mode support
- [ ] Advanced analytics dashboard
- [ ] Integration with IoT sensors
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Social sharing features
- [ ] Calendar integration for events

## 🙏 Acknowledgments

- Built with [Bolt.new](https://bolt.new) - The AI-powered development platform
- Environmental data powered by various climate APIs
- Icons by [Lucide](https://lucide.dev)
- Images from [Pexels](https://pexels.com)
- Database and backend by [Supabase](https://supabase.com)

---

**Made with ❤️ for the planet** 🌍

*Building a more climate-resilient future, one community at a time.*