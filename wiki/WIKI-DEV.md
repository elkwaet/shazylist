# 🛠️ Wiki Développeur - Shazylist

Documentation technique sur l'architecture et le fonctionnement interne de Shazylist.

## 🏗️ Architecture

L'application est structurée comme une "Lite App" locale :
- **Backend** : Flask (Python 3).
- **Extraction** : SQLite3 pour interroger directement la base locale de Shazam.
- **Frontend** : HTML5 / CSS3 / Vanilla JS (pas de framework lourd pour rester "Lite").

## 💾 Base de Données Shazam

Shazam stocke ses données sur macOS via Core Data dans un fichier SQLite.
**Chemin typique** : `~/Library/Group Containers/4GWDBCF5A4.group.com.shazam/com.shazam.mac.Shazam/ShazamDataModel.sqlite`

### Schéma important (Table `ZSHTAGRESULTMO`) :
- `ZTRACKNAME` : Titre du morceau.
- `ZSUBTITLE` : Artiste.
- `ZDATE` : Timestamp (Mac Absolute Time - secondes depuis 2001).
- `ZISAUTO` : Booléen (1 = Auto-Shazam).
- `ZALBUMARTURLSTRING` : URL de la pochette.

## 🛠️ Développement

### Installation des dépendances
```bash
python3 -m pip install flask
```

### Structure des fichiers
- `app.py` : Point d'entrée du serveur Flask et routes d'API/Export.
- `start.py` : Logique métier et extraction SQLite.
- `static/` : Assets frontend (CSS/JS).
- `templates/` : Templates HTML (Jinja2).

## 🚀 Évolutions prévues
Voir le fichier [BACKLOG.md](../BACKLOG.md) pour les prochaines étapes (Sessions, Stats, etc.).
