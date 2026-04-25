import sqlite3
import os
import glob

potential_paths = [
    os.path.expanduser("~/Library/Group Containers/K39M9S6R4P.com.shazam.mac.Shazam/ShazamDataModel.sqlite"),
    os.path.expanduser("~/Library/Containers/com.shazam.mac.Shazam/Data/Documents/ShazamDataModel.sqlite"),
]
glob_path = os.path.expanduser("~/Library/Group Containers/*/com.shazam.mac.Shazam/ShazamDataModel.sqlite")
potential_paths.extend(glob.glob(glob_path))

db_path = None
for path in potential_paths:
    if os.path.exists(path):
        db_path = path
        break

if not db_path:
    print("Base de données introuvable.")
else:
    print(f"Base trouvée à : {db_path}")
    try:
        conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
        cursor = conn.cursor()
        
        # Liste des tables pour vérifier si on est sur la bonne structure
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        print(f"Tables trouvées : {tables}")
        
        if 'ZSHTAGRESULTMO' in tables:
            print("\nColonnes de ZSHTAGRESULTMO :")
            cursor.execute("PRAGMA table_info(ZSHTAGRESULTMO);")
            for col in cursor.fetchall():
                print(f" - {col[1]} ({col[2]})")
            
            print("\n5 premières lignes (valeurs brutes) :")
            cursor.execute("SELECT * FROM ZSHTAGRESULTMO LIMIT 5;")
            rows = cursor.fetchall()
            for row in rows:
                print(row)
        else:
            print("\nERREUR : Table ZSHTAGRESULTMO absente.")
            
        conn.close()
    except Exception as e:
        print(f"Erreur : {e}")
