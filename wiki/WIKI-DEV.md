# 🛠️ Wiki Développeur - Shazylist

Documentation technique sur l'architecture et le fonctionnement interne de Shazylist.

## 🏗️ Architecture

L'application est structurée comme une "Lite App" locale :
- **Backend** : Flask (Python 3).
- **Extraction** : SQLite3 avec mode `ro` (Read-Only) pour éviter de verrouiller la DB Shazam.
- **Frontend** : Vanilla JS / CSS3 (Variables). Pas de dépendances externes à part Google Fonts.

## 💾 Gestion de la Donnée

### Base de Données Shazam
Shazam utilise SQLite via Core Data.
- **Timestamp** : Les dates sont au format "Mac Absolute Time" (secondes depuis le 01/01/2001). Conversion effectuée dans `start.py`.
- **Accès** : L'URL SQLite inclut `?mode=ro` pour permettre la lecture simultanée pendant que Shazam est ouvert.

### Filtrage & Tri
- **Backend** : Le filtrage par dates s'effectue au niveau SQL/Python pour limiter le volume de données transférées.
- **Frontend** : Le tri (Date/Hits) et la recherche textuelle s'effectuent côté client en Vanilla JS sur l'objet `allTracks` pour une réactivité instantanée.

## 🎨 Design System

### Thèmes (Sombre/Clair)
Utilisation systématique des **Variables CSS** (`--bg-color`, etc.). Le basculement s'opère par l'ajout de la classe `.light-theme` sur le `body`. La préférence est stockée dans le `localStorage`.

### Icônes (SVG Sprite)
Toutes les icônes sont centralisées dans un **SVG Sprite** caché en haut de `index.html`. Cela permet une réutilisation simple via `<use xlink:href="#id">` et un contrôle total des couleurs via CSS (`fill`, `stroke`).

### Sticky Header
Le header utilise `position: sticky` avec un `backdrop-filter: blur` pour l'effet de transparence. 

## ⚙️ Configuration

- **Port** : Fixé à **5050** dans `app.py`.
- **Sessions** : Logique JS calculant l'écart entre deux timestamps consécutifs. Seuil actuel : **10 minutes**.

## 🚀 Évolutions
Consulter [BACKLOG.md](../BACKLOG.md).
