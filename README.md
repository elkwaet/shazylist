# 🎧 Shazylist

> Un outil léger pour extraire et organiser vos découvertes Shazam (macOS) afin de faciliter le "digging" DJ.

## 🌟 Caractéristiques

- **Extraction automatique** : Récupère les morceaux depuis la base de données locale de Shazam sur macOS.
- **Support Auto-Shazam** : Identifie les tracks capturées en mode automatique (🚀).
- **Dashboard DJ** : Génère un fichier Markdown interactif avec des liens de recherche directs.
- **Liens de recherche** : Accès rapide à **Beatport** et **Google Search** pour chaque track.
- **Export Multi-format** : Sorties en CSV et Markdown.

## 🚀 Installation

1. Clonez le dépôt :
   ```bash
   git clone https://gitlab.com/elkwaet/shazylist.git
   cd shazylist
   ```

2. Assurez-vous d'avoir Python 3 installé.

## 🛠️ Utilisation

Lancez simplement le script principal :

```bash
python3 start.py
```

### Fichiers générés :
- `shazam_dashboard.md` : Dashboard visuel pour votre digging.
- `shazam_export.csv` : Export brut pour import dans d'autres outils (Excel, Rekordbox, etc.).

## 📂 Structure du projet

- `start.py` : Script principal de l'outil.
- `scratch/` : Outils de diagnostic et tests.

## 📝 Licence

MIT
