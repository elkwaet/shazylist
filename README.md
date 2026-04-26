# Shazylist

<p align="center">
  <img src="icon.png" width="128" alt="Shazylist Logo">
</p>

Shazylist est un dashboard natif pour macOS conçu pour les DJ et les chercheurs de pépites musicales. Il permet d'extraire, d'analyser et d'exporter l'historique de vos découvertes Shazam directement depuis votre ordinateur.

## Installation rapide

Pour une installation immédiate sur macOS :
1. Téléchargez la dernière version : [**Shazylist-Installer.dmg**](https://github.com/elkwaet/shazylist/releases/latest/download/Shazylist-Installer.dmg)
2. Glissez l'application dans votre dossier Applications.

3. **Important** : Effectuez un clic-droit sur l'application et choisissez "Ouvrir" pour contourner l'absence de signature officielle.

## Fonctionnalités clés
- **Mode Hybride (Double Accès)** : Utilisez Shazylist via l'interface native bureau, ou ouvrez simplement `http://localhost:5050` dans votre navigateur Web en parallèle. (Mode Web seul possible via `python3 app.py`).
- **Dashboard Natif** : Interface ultra-rapide basée sur WebKit, sans dépendance de navigateur.
- **Analyse de Fréquence** : Visualisez vos morceaux les plus "shazamés" (Hits).
- **Filtrage Avancé** : Tri par date, par type (Auto-Shazam vs Solo) et recherche textuelle instantanée.
- **Gestion des Doublons** : Scan local pour identifier les titres que vous possédez déjà dans votre bibliothèque.
- **Export Pro** : Exportation de vos listes en formats TXT ou CSV pour une intégration dans Rekordbox ou Serato.
- **Design Minimaliste** : Thème Noir & Blanc pur, moderne et épuré.

## Développement et compilation

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
- [Wiki Développeur](wiki/WIKI-DEV.md) : Architecture technique.
- [Changelog](CHANGELOG.md)

## Licence
Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.
