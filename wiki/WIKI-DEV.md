# Wiki Développeur - Shazylist

Documentation technique sur l'architecture et le fonctionnement interne de Shazylist.

## Architecture

L'application est structurée comme une "Lite App" hybride proposant un accès Double Mode :
- **Mode Bureau (Natif)** : `desktop.py` encapsule l'UI dans une fenêtre WebKit native macOS via `pywebview` tout en lançant le moteur sur le port 5050.
- **Mode Navigateur (Web)** : Accessible en simultané via `http://localhost:5050` si l'app est ouverte, ou démarrable de manière isolée via `python3 app.py`.
- **Backend** : Flask (Python 3.12).
- **Extraction** : SQLite3 avec mode `ro` (Read-Only) pour éviter de verrouiller la DB Shazam.
- **Frontend** : Vanilla JS / CSS3. Pas de dépendances externes.

## Compilation & Distribution

### Mode Desktop (Natif)
L'application est packagée en tant qu'exécutable macOS (`.app`) via **PyInstaller**.
Le lanceur principal est [desktop.py](../desktop.py).

**Commande de compilation :**
```bash
pyinstaller --noconfirm --windowed --name "Shazylist" --icon "icon.icns" --add-data "static:static" --add-data "templates:templates" desktop.py
```

### Génération du DMG
Un script d'automatisation [build_dmg.sh](../build_dmg.sh) utilise `create-dmg` pour générer un installateur disque. Il positionne les icônes sur un fond monochrome personnalisé.

**Commande :**
```bash
./build_dmg.sh
```

## Gestion de la Donnée

### Base de Données Shazam
Shazam utilise SQLite via Core Data.
- **Timestamp** : Mac Absolute Time (secondes depuis le 01/01/2001).
- **Accès** : L'URL SQLite inclut `?mode=ro`.

### Permissions macOS (TCC)
Le backend vérifie au démarrage si l'accès à la DB est bloqué par le système de sécurité macOS (Full Disk Access). En cas de blocage, une modale d'aide est déclenchée via l'API `/api/access-status`.

## Design System
- **Thèmes** : Variables CSS avec classe `.light-theme`.
- **Fenêtre** : Persistance des dimensions enregistrées dans `config.json`.

## Diagnostics et Logs
Un système de logs a été mis en place pour faciliter le debug en mode production (une fois packagé en `.app`).
- **Fichier** : `debug.log` (généré à la racine de l'app ou dans le dossier de configuration).
- **Contenu** : Erreurs Flask, statut de la base de données, cycle de vie de la fenêtre Webview.
- **Niveau** : DEBUG (en production, il capture les Stack Traces des erreurs fatales).
