# Shazylist

<p align="center">
  <img src="icon.png" width="128" alt="Shazylist Logo">
</p>

Shazylist est un dashboard natif pour macOS conçu pour les DJ et les chercheurs de pépites musicales. Il permet d'extraire, d'analyser et d'exporter l'historique de vos découvertes Shazam directement depuis votre ordinateur.

## Installation Rapide

Pour une installation immédiate sur macOS :
1. Téléchargez le fichier [Shazylist-Installer.dmg](./Shazylist-Installer.dmg) (si disponible dans les releases).
2. Glissez l'application dans votre dossier Applications.
3. **Important** : Effectuez un clic-droit sur l'application et choisissez "Ouvrir" pour contourner l'absence de signature officielle.

## Fonctionnalités Clés

- **Dashboard Natif** : Interface ultra-rapide basée sur WebKit, sans dépendance de navigateur.
- **Analyse de Fréquence** : Visualisez vos morceaux les plus "shazamés" (Hits).
- **Filtrage Avancé** : Tri par date, par type (Auto-Shazam vs Solo) et recherche textuelle instantanée.
- **Gestion des Doublons** : Scan local pour identifier les titres que vous possédez déjà dans votre bibliothèque.
- **Export Pro** : Exportation de vos listes en formats TXT ou CSV pour une intégration dans Rekordbox ou Serato.
- **Design Minimaliste** : Thème Noir & Blanc pur, moderne et épuré.

## Développement et Compilation

### Pré-requis
- Python 3.12+
- Homebrew (pour la création du DMG)

### Installation des dépendances
```bash
pip install flask pywebview pyinstaller
brew install create-dmg
```

### Compiler l'application native
```bash
pyinstaller --noconfirm --windowed --name "Shazylist" --icon "icon.icns" --add-data "static:static" --add-data "templates:templates" desktop.py
```

### Générer l'installateur DMG
```bash
./build_dmg.sh
```

## Documentation
- [Wiki Utilisateur](wiki/WIKI-USER.md)
- [Wiki Développeur](wiki/WIKI-DEV.md)
- [Changelog](CHANGELOG.md)

## Licence
Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.
