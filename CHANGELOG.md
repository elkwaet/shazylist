# Changelog - Shazylist

## [4.2.2] - 2026-05-01
### Added
- **Player Widget** : Ajout d'un bouton de fermeture (X) pour masquer le lecteur et libérer les ressources audio.
- **Gestion Audio** : Amélioration du nettoyage des instances audio lors de la fermeture ou du changement de morceau.

## [4.2.1] - 2026-05-01
### Fixed
- **Exportation Desktop** : Correction d'un bug où les boutons d'exportation TXT/CSV affichaient le contenu brut au lieu de télécharger le fichier dans l'application Desktop. Les exports s'ouvrent désormais dans le navigateur système pour garantir le téléchargement.

## [4.2.0] - 2026-04-26
### Added
- **Link Expansion** : Ajout des liens vers Spotify, Apple Music, SoundCloud et Juno Download.
- **Library Highlighting** : Mise en évidence visuelle (opacité réduite) des morceaux déjà présents dans la bibliothèque locale.
- **Système de Logs** : Création d'un fichier `debug.log` pour le diagnostic des erreurs en mode desktop.
- Correction de la fenêtre vide dans l'application compilée (gestion des chemins `sys._MEIPASS`).

## [4.1.0] - 2026-04-26

## [4.0.0] - 2026-04-25
### Added
- Passage à une **Application Native macOS** (`pywebview`).
- Icône d'application monochrome personnalisée.
- Persistance de la taille de la fenêtre.
- Raccourci clavier `Cmd + ,` pour les réglages.
- Gestion visuelle des permissions macOS (Accès complet au disque).

## [3.0.0] - 2026-04-23
### Added
- Fonction de **Scan Local** : détection des fichiers déjà présents sur le disque.
- Sélecteur de dossier natif macOS.

## [2.0.0] - 2026-04-20
### Added
- Interface Dashboard complète (Web App).
- Filtres par plage de dates.
- Exportations CSV et TXT.
- Calcul automatique des "Hits" (fréquence d'écoute).

## [1.0.0] - 2026-04-15
### Added
- Script initial d'extraction SQLite pour la base Shazam locale.
