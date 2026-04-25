import sqlite3
import csv
import os
import glob
from datetime import datetime, timedelta
import urllib.parse
from collections import Counter

class Shazylist:
    def __init__(self):
        # Chemins standards Shazam sur macOS
        self.potential_paths = [
            os.path.expanduser("~/Library/Group Containers/4GWDBCF5A4.group.com.shazam/com.shazam.mac.Shazam/ShazamDataModel.sqlite"),
            os.path.expanduser("~/Library/Group Containers/K39M9S6R4P.com.shazam.mac.Shazam/ShazamDataModel.sqlite"),
            os.path.expanduser("~/Library/Containers/com.shazam.mac.Shazam/Data/Documents/ShazamDataModel.sqlite")
        ]
        # Recherche via glob pour gérer les variations
        glob_path = os.path.expanduser("~/Library/Group Containers/*/com.shazam.mac.Shazam/ShazamDataModel.sqlite")
        self.potential_paths.extend(glob.glob(glob_path))
        
        self.db_path = self._find_db()
        self.tracks = []

    def _find_db(self):
        for path in self.potential_paths:
            if os.path.exists(path):
                return path
        return None

    def mac_to_datetime(self, timestamp):
        """Convertit le timestamp Core Data (Mac Absolute Time) en datetime Python."""
        if not timestamp:
            return None
        return datetime(2001, 1, 1) + timedelta(seconds=timestamp)

    def fetch_tracks(self):
        if not self.db_path:
            raise FileNotFoundError("Base de données Shazam introuvable.")

        try:
            conn = sqlite3.connect(f"file:{self.db_path}?mode=ro", uri=True)
            cursor = conn.cursor()
            
            # 1. Extraction brute
            query = """
                SELECT ZTRACKNAME, ZSUBTITLE, ZDATE, ZISAUTO, ZSTYLE
                FROM ZSHTAGRESULTMO 
                ORDER BY ZDATE DESC
            """
            cursor.execute(query)
            rows = cursor.fetchall()
            
            # 2. Calcul des fréquences (Hits) sur l'ensemble de la DB
            # On utilise (Artiste, Titre) comme clé unique
            counts = Counter([(r[1], r[0]) for r in rows if r[0] and r[1]])
            
            self.tracks = []
            for row in rows:
                title, artist, timestamp, is_auto, style = row
                if not title or not artist:
                    continue

                date_dt = self.mac_to_datetime(timestamp)
                hits = counts.get((artist, title), 1)
                
                self.tracks.append({
                    "date": date_dt.strftime("%Y-%m-%d %H:%M") if date_dt else "N/A",
                    "hits": hits,
                    "artist": artist,
                    "title": title,
                    "type": "🚀 Auto" if is_auto else "👤 Manual",
                    "style": style or "-",
                    "search_google": f"https://www.google.com/search?q={urllib.parse.quote(f'{artist} {title}')}",
                    "search_beatport": f"https://www.beatport.com/search?q={urllib.parse.quote(f'{artist} {title}')}"
                })
            
            conn.close()
        except sqlite3.Error as e:
            print(f"Erreur SQLite : {e}")
            raise

    def export_csv(self, filename="shazam_export.csv"):
        if not self.tracks:
            print("⚠️ Aucun morceau à exporter.")
            return
        
        keys = self.tracks[0].keys()
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            dict_writer = csv.DictWriter(f, fieldnames=keys)
            dict_writer.writeheader()
            dict_writer.writerows(self.tracks)
        print(f"✅ CSV exporté ({len(self.tracks)} tracks) : {filename}")

    def export_markdown(self, filename="shazam_dashboard.md"):
        if not self.tracks:
            return
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write("# 🎧 Shazylist - Dashboard DJ\n\n")
            f.write(f"*Généré le : {datetime.now().strftime('%Y-%m-%d %H:%M')}*\n\n")
            f.write("| Date | Hits | Source | Artiste | Titre | Recherche |\n")
            f.write("| :--- | :--- | :--- | :--- | :--- | :--- |\n")
            
            for track in self.tracks:
                # Formatage du nombre de hits pour visibilité
                hit_label = f"🔥 **{track['hits']}**" if track['hits'] > 1 else "1"
                links = f"[Google]({track['search_google']}) / [Beatport]({track['search_beatport']})"
                
                f.write(f"| {track['date']} | {hit_label} | {track['type']} | **{track['artist']}** | {track['title']} | {links} |\n")
        
        print(f"✅ Dashboard Markdown créé : {filename}")

if __name__ == "__main__":
    app = Shazylist()
    try:
        app.fetch_tracks()
        app.export_csv()
        app.export_markdown()
    except Exception as e:
        print(f"❌ Erreur : {e}")