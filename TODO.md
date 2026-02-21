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

- [x] **Network Change Detection** - Auto-apply proxy on network switch
  - [x] Listen to network change events
  - [x] Auto-apply last used profile
- [x] **Rule-based Mode** - Auto-proxy based on domain rules
  - [x] Create rule editor UI
  - [x] Implement PAC file support
- [x] **Launch at Login** - Start automatically on system boot
  - [x] Add launch at login toggle
  - [x] Configure hidden launch option

### 🟡 Medium Priority

#### 3. User Experience

- [x] **System Tray** - Minimize to tray for quick access
  - [x] Create tray icon
  - [x] Add tray menu (Toggle, Quit)
  - [x] Hide window to tray on close
- [x] **System Notifications** - Native notifications for status changes
  - [x] Use Notification Center API
  - [x] Add notification preferences
- [x] **Dark/Light Theme** - Theme toggle or system follow
  - [x] Add theme switcher
  - [x] Create light theme styles
  - [x] Detect system theme preference

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

- [x] Launch at login
- [x] Network change detection
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
