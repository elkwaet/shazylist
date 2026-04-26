# Guide utilisateur - Shazylist

Shazylist est ton dashboard personnel pour explorer et exporter tes découvertes Shazam sur macOS.

## Installation

1. **Téléchargement** : Récupère le fichier `Shazylist-Installer.dmg`.
2. **Installation** : Ouvre le fichier et glisse l'icône **Shazylist** dans le dossier **Applications**.
3. **Premier Lancement** : 
   - Fais un **Clic-droit > Ouvrir** sur l'application dans tes Applications (nécessaire car l'app n'est pas signée officiellement).
   - Valide l'ouverture dans la boîte de dialogue macOS.

## Sécurité & permissions

Pour lire tes morceaux, Shazylist doit pouvoir accéder à la base de données interne de Shazam. macOS protège ces fichiers.

**Si l'application affiche un message d'accès requis :**
1. Ouvre les **Réglages Système**.
2. Va dans **Confidentialité et sécurité** > **Accès complet au disque**.
3. Ajoute **Shazylist** à la liste et coche la case.
4. Redémarre Shazylist.

## Fonctionnalités

- **Recherche** : Filtre instantanément par artiste ou titre.
- **Top Hits** : Identifie les morceaux que tu as shazamé le plus souvent.
- **Auto vs Solo** : Distingue les morceaux capturés en mode automatique des recherches manuelles.
- **Exports** : Génère des listes propres en TXT ou CSV pour tes sets DJ.
- **Liens Rapides** : Accède directement à Beatport, Traxsource ou YouTube depuis ton dashboard.

### Cas d'usage des fonctions

#### Les filtres
- Le bouton **Refresh** permet de rafraîchir la liste des morceaux.
- L'entete de la colonne **Hits** permet de filtrer les morceaux par fréquence de découverte en ordre croissant/décroissant (par défaut les plus récents d'abord === filtre de la colonne Date en ordre décroissant).
- L'entete de la colonne **Date** permet de filtrer les morceaux par date de découverte en ordre croissant/décroissant (par défaut les plus récents d'abord).
- Les boutons **Auto vs Solo** permet de filtrer les morceaux par type.
- Les filtres de plage de dates **"Aujourd'hui" , "Hier", "Semaine", "Tout"** permettent de filtrer les morceaux par date de découverte en ordre croissant/décroissant (par défaut les plus récents d'abord).


#### Les "Sessions"
Par défaut, tu es sur "Toutes les sessions" (ce qui affiche tous tes sons et filtre les dates comme avant).
- Quand tu lances une session de shazam ("soirée diggin" par exemple), tu cliques sur le "+". L'application va créer et sélectionner une nouvelle session.
- **Important** : À la sélection d'une session, le tableau se vide instantanément (c'est normal). Shazylist applique les timestamps de cette session sur le serveur, ce qui veut dire que seuls les sons Shazamés à partir de la date de création de cette session apparaîtront au fur et à mesure que tu recharges les pistes (bouton ↻).
- L'horodatage a été corrigé avec un support du décalage (timezone UTC) sur le serveur Python, donc tes nouveaux tracks devraient apparaître parfaitement.


---

## Raccourcis
- `Cmd + ,` : Ouvrir les réglages.
- `Echap` : Fermer les modales.
