import webview
import threading
import os
import time
import sys
from app import app, shazam

def start_flask():
    """Démarre le serveur Flask sur un port aléatoire ou fixe."""
    app.run(port=5050, debug=False, threaded=True)

def check_permissions():
    """Vérifie si la base Shazam est accessible."""
    db_path = shazam.db_path
    if not db_path or not os.path.exists(db_path):
        return False
    
    try:
        # Tenter une petite lecture pour vérifier le TCC
        with open(db_path, 'rb') as f:
            f.read(10)
        return True
    except PermissionError:
        return False
    except Exception:
        return False

if __name__ == '__main__':
    # 1. Vérification des permissions
    has_access = check_permissions()
    
    # 2. Lancer Flask en arrière-plan
    t = threading.Thread(target=start_flask)
    t.daemon = True
    t.start()

    # 3. Attendre que le serveur soit prêt
    time.sleep(1)

    # 4. Créer la fenêtre native
    window_title = "Shazylist - Dashboard DJ"
    if not has_access:
        window_title += " (Accès restreint)"

    # On charge l'URL locale
    window = webview.create_window(
        window_title, 
        "http://127.0.0.1:5050",
        width=1200,
        height=800,
        min_size=(800, 600),
        background_color='#000000'
    )

    # Lancement de l'interface
    webview.start()
