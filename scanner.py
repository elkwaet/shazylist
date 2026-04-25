import os
import re
from pathlib import Path
from difflib import SequenceMatcher

class LocalScanner:
    def __init__(self):
        self.local_index = set()

    def normalize(self, text):
        """Normalise le texte pour faciliter la comparaison (minuscules, sans ponctuation)."""
        if not text:
            return ""
        text = text.lower()
        # Supprimer les extensions courantes si présentes dans la chaîne
        text = re.sub(r'\.(mp3|wav|flac|aiff|m4a|aac)$', '', text)
        # Supprimer tout ce qui n'est pas alphanumérique
        text = re.sub(r'[^a-z0-9\s]', ' ', text)
        # Nettoyer les espaces multiples
        return " ".join(text.split())

    def scan_folders(self, folders):
        """Parcourt les dossiers et indexe les noms de fichiers."""
        new_index = set()
        supported_ext = ('.mp3', '.wav', '.flac', '.aiff', '.m4a', '.aac')
        
        for folder_path in folders:
            path = Path(folder_path)
            if not path.exists() or not path.is_dir():
                continue
                
            try:
                for file in path.rglob('*'):
                    if file.is_file() and file.suffix.lower() in supported_ext:
                        # On stocke le nom du fichier normalisé
                        normalized_name = self.normalize(file.stem)
                        if normalized_name:
                            new_index.add(normalized_name)
            except Exception as e:
                print(f"Erreur lors du scan de {folder_path}: {e}")
        
        self.local_index = new_index
        return len(self.local_index)

    def is_in_library(self, artist, title):
        """Vérifie si un morceau Shazam correspond à un fichier local."""
        if not self.local_index:
            return False
            
        # On tente un match direct sur "Artiste Titre" ou "Titre Artiste"
        target1 = self.normalize(f"{artist} {title}")
        target2 = self.normalize(f"{title} {artist}")
        
        if target1 in self.local_index or target2 in self.local_index:
            return True
            
        # Matching souple (Optionnel : pourrait être gourmand si index immense)
        # Pour l'instant on reste sur du direct normalisé pour la performance
        return False
