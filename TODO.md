# Proxy Manager - TODO List

## 📋 Feature Roadmap

### 🔴 High Priority

#### 1. Proxy Configuration Management

- [x] **Multiple Profiles** - Save multiple proxy configurations (Home, Work, Public)
  - [x] Create profile management UI
  - [x] Add profile switcher dropdown
  - [x] Implement profile CRUD operations
  - [x] Store profiles in config file
- [x] **Quick Switch** - One-click switch between saved profiles
- [x] **Import/Export** - Backup and share configurations
  - [x] Export profiles to JSON file
  - [x] Import profiles from JSON file
- [x] **Auto-Detect** - Detect and import current system proxy settings

#### 2. Automation Features

- [ ] **Launch at Login** - Auto-start app on system login
  - [ ] Add toggle in settings
  - [ ] Create launch agent for macOS
- [ ] **Network Change Detection** - Auto-apply proxy on network switch
  - [ ] Listen to network change events
  - [ ] Auto-apply last used profile
- [ ] **Scheduled Tasks** - Schedule proxy on/off times
  - [ ] Add schedule settings UI
  - [ ] Implement background scheduler
- [ ] **Rule-based Mode** - Auto-proxy based on domain rules
  - [ ] Create rule editor UI
  - [ ] Implement PAC file support

### 🟡 Medium Priority

#### 3. User Experience

- [ ] **System Tray** - Minimize to tray for quick access
  - [ ] Create tray icon
  - [ ] Add tray menu (Toggle, Quit)
  - [ ] Hide window to tray on close
- [ ] **Global Shortcut** - Keyboard shortcut to toggle proxy
  - [ ] Add shortcut settings
  - [ ] Register global shortcut handler
- [ ] **System Notifications** - Native notifications for status changes
  - [ ] Use Notification Center API
  - [ ] Add notification preferences
- [ ] **Dark/Light Theme** - Theme toggle or system follow
  - [ ] Add theme switcher
  - [ ] Create light theme styles
  - [ ] Detect system theme preference

#### 4. Advanced Features

- [ ] **Proxy Speed Test** - Test proxy connection latency
  - [ ] Implement ping/test request
  - [ ] Display latency results
  - [ ] Auto-test on profile switch
- [ ] **Proxy Validation** - Verify if proxy is working
  - [ ] Test connection through proxy
  - [ ] Show validation status
- [ ] **Traffic Statistics** - Display proxy traffic usage
  - [ ] Monitor network traffic
  - [ ] Show stats in UI
- [ ] **Activity Log** - View proxy setting history
  - [ ] Log proxy changes
  - [ ] Create log viewer UI

#### 5. Security

- [ ] **Keychain Integration** - Store admin password in system keychain
  - [ ] Use node-keytar or similar
  - [ ] Add keychain management
- [ ] **Config Encryption** - Encrypt sensitive configurations
  - [ ] Implement encryption/decryption
  - [ ] Secure storage handling
- [ ] **Auto Update** - Check and notify new versions
  - [ ] Integrate electron-updater
  - [ ] Add update check UI

### 🟢 Low Priority

#### 6. UI Improvements

- [x] **Enhanced Animations** - Smoother toggle animations
  - [x] Button hover/active animations
  - [x] Modal slide-in animations
  - [x] Status bar bounce animations
  - [x] Shimmer effects for active state
- [x] **Status Visualization** - Graphical proxy status display
  - [x] Animated status bars
  - [x] Color-coded states (green=on, gray=off)
  - [x] Loading state overlay
- [x] **History View** - Show recently used configurations
  - [x] Track proxy enable/disable actions
  - [x] Track profile switches
  - [x] Display relative timestamps
  - [x] Clear history option
- [x] **Responsive Design** - Better window sizing support
  - [x] Resizable window
  - [x] Min/max size constraints
  - [x] Flexible layout

---

## 🎯 Current Sprint

### Phase 1: Core Features (v0.1.0)

- [x] Basic proxy toggle (HTTP/HTTPS & SOCKS)
- [x] Proxy status display
- [x] Configuration save/load
- [x] Multiple profiles
- [ ] System tray integration

### Phase 2: Automation (v0.2.0)

- [ ] Launch at login
- [ ] Network change detection
- [ ] Global shortcut

### Phase 3: Advanced (v0.3.0)

- [ ] Proxy validation
- [ ] Speed test
- [ ] Auto update

---

## 📝 Notes

- Priority may change based on user feedback
- Some features may require additional permissions
- Security features should be thoroughly tested

---

**Last Updated:** 2026-02-21
**Version:** 0.3.0
