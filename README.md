# Maseke DanielsMinistries Mobile App

A React Native mobile application built with Expo for Maseke DanielsMinistries, providing users with an intuitive onboarding experience and seamless navigation.

## 🚀 Features

- **Onboarding Flow** : Welcome screens that introduce users to the app
- **Authentication** : Login and signup functionality
- **Responsive Design** : Optimized for both iOS and Android devices
- **Modern UI** : Clean, accessible interface with custom components
- **Type Safety** : Built with TypeScript for better development experience

## 📱 Tech Stack

- **Framework** : React Native with Expo
- **Language** : TypeScript
- **Navigation** : Expo Router
- **Storage** : AsyncStorage for local data persistence
- **UI Components** : Custom component library
- **Fonts** : DM Sans and Space Grotesk font families
- **Status Bar** : Expo Status Bar for cross-platform status bar management

## 🛠️ Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (Mac only) or Android Studio for device testing

### Setup

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd maseke-daniel-ministries
   ```
2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Start the development server**
   ```bash
   npx expo start
   ```
4. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your device

## 📁 Project Structure

```
maseke-daniel-ministries/
├── app/                    # App screens and navigation
│   ├── (auth)/            # Authentication screens
│   ├── _layout.tsx        # Root layout configuration
│   └── index.tsx          # Entry point
├── assets/                # Static assets
│   ├── fonts/             # Custom fonts
│   ├── images/            # App images
│   └── icons/             # App icons
├── components/            # Reusable components
│   ├── ui/                # UI components
│   │   ├── Button.tsx
│   │   ├── ThemeText.tsx
│   │   └── ...
│   └── SafeAreaWrapper.tsx
├── constants/             # App constants
│   └── data.ts           # Static data
├── utils/                 # Utility functions
└── app.json              # Expo configuration
```

## 🎨 Components

### UI Components

- **Button** : Customizable button with variants (primary, secondary, outline)
- **ThemeText** : Typography component with predefined variants
- **SafeAreaWrapper** : Handles safe area insets
- **PaginationDots** : Onboarding pagination indicator
- **TextLink** : Interactive text links

### Key Features

- **Onboarding System** : Multi-screen introduction with pagination
- **Theme Support** : Consistent color scheme throughout the app
- **Responsive Design** : Adapts to different screen sizes
- **Type Safety** : Full TypeScript support

## 🔧 Configuration

### App Configuration (`app.json`)

```json
{
  "expo": {
    "name": "maseke-daniel-ministries",
    "slug": "maseke-daniel-ministries",
    "scheme": "maseke-daniel-ministries",
    "version": "1.0.0",
    "orientation": "portrait",
    "newArchEnabled": true
  }
}
```

### Environment Setup

The app uses Expo's managed workflow with:

- **New Architecture** : Enabled for better performance
- **Edge-to-Edge** : Android edge-to-edge display
- **Custom Fonts** : DM Sans and Space Grotesk loaded via Expo Font

## 🧪 Development

### Running Tests

```bash
npm test
# or
yarn test
```

### Building for Production

```bash
# Build for Android
expo build:android

# Build for iOS
expo build:ios
```

### Development Tips

1. **Clear AsyncStorage** during development:
   ```bash
   npx expo start --clear
   ```
2. **Reset onboarding** for testing:
   ```typescript
   await AsyncStorage.removeItem("hasSeenOnboarding");
   ```
3. **Access dev menu** : Shake device or press `m` in terminal

## 📱 Onboarding Flow

1. **Welcome Screen** : Introduction to the app
2. **Feature Highlights** : Key app features
3. **Get Started** : Call-to-action to begin
4. **One-time Display** : Onboarding shows only once per installation

## 🔐 Authentication

The app includes authentication screens for:

- User login
- User registration
- Account recovery (if implemented)

## 🎯 Future Enhancements

- Push notifications
- Deep linking integration
- Offline functionality
- Multi-language support
- Dark mode theme
- User profile management

## 🐛 Troubleshooting

### Common Issues

1. **Font loading errors** : Ensure fonts are properly loaded in `_layout.tsx`
2. **Navigation issues** : Check Expo Router configuration
3. **AsyncStorage errors** : Clear storage and restart app
4. **Build errors** : Run `expo doctor` to check for issues

### Debug Commands

```bash
# Check for issues
expo doctor

# Clear cache
expo start --clear

# Reset Metro bundler
npx expo start --clear
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built By Kagayki with ❤️ for Maseke DanielsMinistries**
