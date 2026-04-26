#!/bin/bash

# Shazylist DMG Build Script
# Dépendance: brew install create-dmg

APP_NAME="Shazylist"
DMG_NAME="Shazylist-Installer.dmg"
APP_PATH="dist/${APP_NAME}.app"

# Vérifier si l'app existe
if [ ! -d "$APP_PATH" ]; then
    echo "❌ Erreur: L'application ${APP_PATH} n'existe pas. Lance d'abord la compilation."
    exit 1
fi

# Supprimer l'ancien DMG si présent
if [ -f "$DMG_NAME" ]; then
    rm "$DMG_NAME"
fi

echo "🔨 Création du DMG pour ${APP_NAME}..."

create-dmg \
  --volname "${APP_NAME} Installer" \
  --volicon "icon.icns" \
  --background "dmg_background.png" \
  --window-pos 200 120 \
  --window-size 600 400 \
  --icon-size 100 \
  --icon "${APP_NAME}.app" 150 180 \
  --hide-extension "${APP_NAME}.app" \
  --app-drop-link 450 180 \
  "${DMG_NAME}" \
  "dist/"

echo "✅ DMG généré avec succès: ${DMG_NAME}"
