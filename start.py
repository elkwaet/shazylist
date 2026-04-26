import sqlite3
import csv
import io
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

    def fetch_all(self):
        """Récupère tous les morceaux sans filtre (pour calcul de hits global)."""
        if not self.db_path:
            raise FileNotFoundError("Base de données Shazam introuvable.")

        try:
            conn = sqlite3.connect(f"file:{self.db_path}?mode=ro", uri=True)
            cursor = conn.cursor()
            query = "SELECT ZTRACKNAME, ZSUBTITLE, ZDATE, ZISAUTO, ZSTYLE, ZALBUMARTURLSTRING FROM ZSHTAGRESULTMO ORDER BY ZDATE DESC"
            cursor.execute(query)
            rows = cursor.fetchall()
            conn.close()
            return rows
        except Exception as e:
            print(f"Erreur extraction : {e}")
            return []

    def get_filtered_tracks(self, start_date=None, end_date=None):
        """Récupère et filtre les morceaux selon la plage de dates."""
        rows = self.fetch_all()
        counts = Counter([(r[1], r[0]) for r in rows if r[0] and r[1]])
        
        filtered = []
        for row in rows:
            title, artist, timestamp, is_auto, style, cover_url = row
            if not title or not artist:
                continue

            date_dt = self.mac_to_datetime(timestamp)
            date_str = date_dt.strftime("%Y-%m-%d") if date_dt else None

            # Filtrage par date
            if start_date and date_str and date_str < start_date:
                continue
            if end_date and date_str and date_str > end_date:
                continue

            hits = counts.get((artist, title), 1)
            query_str = urllib.parse.quote(f"{artist} {title}")
            
            filtered.append({
                "date": date_dt.strftime("%Y-%m-%d %H:%M") if date_dt else "N/A",
                "hits": hits,
                "artist": artist,
                "title": title,
                "type": "Auto-shazam" if is_auto else "Solo-shazam",
                "style": style or "-",
                "cover": cover_url or "https://www.shazam.com/resources/9672688b56d3c01570776b7e5436c646b9a89667/vendor/shazam/shazam-web-ui-core-assets/dist/assets/images/no-cover-art.png",
                "links": {
                    "google": f"https://www.google.com/search?q={query_str}",
                    "beatport": f"https://www.beatport.com/search?q={query_str}",
                    "traxsource": f"https://www.traxsource.com/search?term={query_str}",
                    "junodownload": f"https://www.junodownload.com/search/?q={query_str}",
                    "youtube": f"https://www.youtube.com/results?search_query={query_str}",
                    "spotify": f"https://open.spotify.com/search/{query_str}",
                    "apple": f"https://music.apple.com/search?term={query_str}",
                    "soundcloud": f"https://soundcloud.com/search?q={query_str}"
                }
            })
        
        self.tracks = filtered # Mémorise pour les exports
        return filtered

    def export_csv(self, start_date=None, end_date=None):
        tracks = self.get_filtered_tracks(start_date, end_date)
        if not tracks:
            return ""
        
        output = io.StringIO()
        # Aplatir les liens
        flattened = []
        for t in tracks:
            item = t.copy()
            links = item.pop("links")
            for k, v in links.items():
                item[f"link_{k}"] = v
            flattened.append(item)

        keys = flattened[0].keys()
        dict_writer = csv.DictWriter(output, fieldnames=keys)
        dict_writer.writeheader()
        dict_writer.writerows(flattened)
        return output.getvalue()

    def export_txt(self, start_date=None, end_date=None):
        tracks = self.get_filtered_tracks(start_date, end_date)
        if not tracks:
            return ""
        
        output = []
        for i, t in enumerate(tracks, 1):
            output.append(f"{i:03d} - {t['title']} - {t['artist']}")
        return "\n".join(output)

if __name__ == "__main__":
    app = Shazylist()
    print(f"Extraction locale : {len(app.get_filtered_tracks())} tracks.")