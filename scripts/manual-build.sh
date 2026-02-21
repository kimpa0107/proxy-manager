#!/bin/bash

# 手动打包脚本 - 不使用 electron-builder 的 Electron 下载

VERSION="0.0.1"
APP_NAME="Proxy Manager"
OUT_DIR="release/${VERSION}/mac"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "${SCRIPT_DIR}")"
ELECTRON_APP="${PROJECT_DIR}/node_modules/.pnpm/electron@24.8.8/node_modules/electron/dist/Electron.app"

echo "Building ${APP_NAME} v${VERSION}..."

# 清理旧输出
rm -rf "${OUT_DIR}"
mkdir -p "${OUT_DIR}"

# 复制 Electron.app
echo "Copying Electron.app..."
cp -r "${ELECTRON_APP}" "${OUT_DIR}/${APP_NAME}.app"

# 复制应用文件
echo "Copying application files..."
mkdir -p "${OUT_DIR}/${APP_NAME}.app/Contents/Resources/app"
cp -r "${PROJECT_DIR}/dist" "${OUT_DIR}/${APP_NAME}.app/Contents/Resources/app/"
cp -r "${PROJECT_DIR}/dist-electron" "${OUT_DIR}/${APP_NAME}.app/Contents/Resources/app/"
cp -r "${PROJECT_DIR}/public" "${OUT_DIR}/${APP_NAME}.app/Contents/Resources/app/"
cp "${PROJECT_DIR}/package.json" "${OUT_DIR}/${APP_NAME}.app/Contents/Resources/app/"

# 更新 Info.plist - 设置入口文件
INFO_PLIST="${OUT_DIR}/${APP_NAME}.app/Contents/Info.plist"
echo "Updating Info.plist..."

# 使用 PlistBuddy 更新 Info.plist
/usr/libexec/PlistBuddy -c "Set :CFBundleName \"${APP_NAME}\"" "${INFO_PLIST}"
/usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName \"${APP_NAME}\"" "${INFO_PLIST}"
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion \"${VERSION}\"" "${INFO_PLIST}"
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString \"${VERSION}\"" "${INFO_PLIST}"
/usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier \"com.proxymanager.app\"" "${INFO_PLIST}"

echo "Build complete! Output: ${OUT_DIR}/${APP_NAME}.app"
echo "You can now create a DMG or copy the app to Applications folder."
