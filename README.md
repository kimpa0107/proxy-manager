# Proxy Manager

> A simple and elegant proxy manager for macOS

![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)
![Platform](https://img.shields.io/badge/platform-macOS-lightgrey.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- 🚀 **Quick Toggle** - One-click proxy on/off switch
- 📝 **Configuration** - Easy proxy settings management
- 🔄 **Dual Support** - HTTP/HTTPS and SOCKS proxy support
- 💾 **Auto Save** - Automatically save your configurations
- 🎨 **Modern UI** - Beautiful gradient design with dark theme
- 📊 **Status Indicator** - Real-time proxy status display
- 🔒 **Secure** - Context isolation and secure IPC communication

## 📸 Screenshots

![App Screenshot](./docs/screenshot.png)

## 🚀 Quick Start

### Installation

1. Download the latest release from [Releases](https://github.com/your-org/proxy-manager/releases)
2. Drag `Proxy Manager.app` to your Applications folder
3. Launch the app

### Usage

1. Enter your proxy **Host** (e.g., `127.0.0.1`)
2. Enter your proxy **Port** (e.g., `1080`)
3. Select proxy type: **HTTP/HTTPS** and/or **SOCKS**
4. Click **Save** to store configuration
5. Click **Turn On** to activate proxy

## 🛠 Development

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- macOS (for building)

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/proxy-manager.git
cd proxy-manager

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build the application
pnpm build:app
```

### Project Structure

proxy-manager/
├── electron/
│   ├── main.ts          # Main process
│   ├── preload.ts       # Preload script (IPC bridge)
│   └── types.ts         # TypeScript definitions
├── src/
│   ├── App.tsx          # Main React component
│   ├── main.tsx         # React entry point
│   └── utils/
│       └── proxy.sh     # Shell script for proxy management
├── public/
│   ├── rocket-icon.png  # App icon
│   └── proxy.sh         # Proxy configuration script
├── electron-builder.json5  # Build configuration
└── package.json

## 📋 Roadmap

See [TODO.md](./TODO.md) for detailed feature roadmap.

### Planned Features

#### High Priority

- [ ] Multiple proxy profiles
- [ ] Quick profile switching
- [ ] Launch at login
- [ ] Network change auto-detection

#### Medium Priority

- [ ] System tray integration
- [ ] Global keyboard shortcut
- [ ] System notifications
- [ ] Proxy speed test
- [ ] Dark/Light theme toggle

#### Low Priority

- [ ] Traffic statistics
- [ ] Activity log
- [ ] Auto update

## 🔧 Technical Stack

- **Framework**: Electron 24
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite + electron-builder
- **IPC**: contextBridge + ipcRenderer

## 📄 How It Works

The app uses macOS's built-in `networksetup` command to configure system proxy settings:

```bash
# Enable HTTP/HTTPS proxy
networksetup -setwebproxy "Wi-Fi" <host> <port>
networksetup -setsecurewebproxy "Wi-Fi" <host> <port>

# Enable SOCKS proxy
networksetup -setsocksfirewallproxy "Wi-Fi" <host> <port>
```

## 🔐 Security

- ✅ Context Isolation enabled
- ✅ No nodeIntegration in renderer
- ✅ Secure IPC communication via contextBridge
- ✅ No sensitive data stored in plain text

## 📦 Build

```bash
# Build for macOS
pnpm build:app

# Output location
release/<version>/Proxy Manager_<version>.dmg
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

## 📞 Support

- Create an issue for bug reports
- Use discussions for questions
- Contact: [your-email@example.com]

---

### Made with ❤️ for macOS users
