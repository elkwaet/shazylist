# 📖 Wiki Utilisateur - Shazylist

Bienvenue dans le guide utilisateur de Shazylist.

## 🚀 Lancement rapide

1. Ouvrez votre terminal.
2. Allez dans le répertoire du projet.
3. Lancez l'application :
   ```bash
   python3 app.py
   ```
4. Accédez à l'interface via votre navigateur : [http://127.0.0.1:5050](http://127.0.0.1:5050)

## 🎧 Fonctionnalités

### Dashboard Web (Command Center)
- **Sticky Header** : La barre de contrôle reste fixée en haut lors du défilement.
- **Tri Dynamique** : Cliquez sur les en-têtes **Date** ou **Hits** pour trier votre collection.
- **Thèmes** : Basculez entre le mode **Sombre** 🌙 et **Clair** ☀️ via l'icône dans le header.
- **Stats Flash** : Un résumé en temps réel (Total, Top Artiste, Ratio Auto) s'affiche sous les filtres.

### Filtrage Avancé
- **Recherche (Raccourci `F`)** : Filtrez instantanément par artiste ou titre. Appuyez sur `ESC` pour effacer.
- **Dates** : Définissez une plage précise ou utilisez les raccourcis **Aujourd'hui**, **Hier**, **Semaine**.
- **Source** : Filtrez entre **Auto-shazam** 🚀 (sessions automatiques) et **Solo-shazam** 👤 (tags manuels).
- **Sessions** : Les morceaux sont séparés visuellement si plus de 10 minutes les séparent.

### Recherche DJ
Cliquez sur les liens à droite de chaque morceau pour ouvrir une recherche sur :
- **Beatport (BP)**
- **Traxsource (TX)**
- **Juno Download (JN)**
- **YouTube (YT)**
- **Google (G)**

### Exports
- **CSV** : Un export complet respectant vos filtres de dates.
- **TXT** : Une liste épurée (N° - Titre - Artiste) pour vos tracklists.

## ⚠️ Notes importantes
- **Port 5050** : Shazylist utilise le port 5050 pour éviter les conflits avec AirPlay sur macOS.
- **Accès Disque** : L'application lit la base de données locale de Shazam. Si rien ne s'affiche, vérifiez les permissions.
