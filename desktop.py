import webview
import threading
import os
import time
import sys
import json
import logging
from app import app, shazam

# Configuration du Logging
LOG_FILE = 'debug.log'
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

logger.info("Démarrage de Shazylist...")

CONFIG_FILE = 'config.json'

def load_window_size():
    """Charge la taille de la fenêtre depuis la config."""
    try:
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, 'r') as f:
                config = json.load(f)
                size = config.get('window_size', [1200, 800])
                return size[0], size[1]
    except Exception:
        pass
    return 1200, 800

def save_window_size(window):
    """Sauvegarde la taille actuelle de la fenêtre."""
    try:
        size = [window.width, window.height]
        config = {}
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, 'r') as f:
                config = json.load(f)
        
        config['window_size'] = size
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config, f, indent=4)
    except Exception:
        pass

def start_flask():
    """Démarre le serveur Flask sur un port fixe."""
    try:
        logger.info("Serveur Flask en cours de démarrage sur le port 5050...")
        app.run(port=5050, debug=False, threaded=True)
    except Exception as e:
        logger.error(f"Erreur fatale du serveur Flask : {e}", exc_info=True)

def check_permissions():
    """Vérifie si la base Shazam est accessible."""
    db_path = shazam.db_path
    logger.info(f"Vérification des permissions pour la base : {db_path}")
    if not db_path or not os.path.exists(db_path):
        logger.warning("Base de données introuvable ou chemin vide.")
        return False
    try:
        with open(db_path, 'rb') as f:
            f.read(10)
        logger.info("Accès à la base de données accordé.")
        return True
    except Exception as e:
        logger.error(f"Accès à la base refusé ou erreur : {e}")
        return False

if __name__ == '__main__':
    has_access = check_permissions()
    
    t = threading.Thread(target=start_flask)
    t.daemon = True
    t.start()

    time.sleep(1)

    width, height = load_window_size()
    window_title = "Shazylist - Dashboard DJ"
    if not has_access:
        window_title += " (Accès requis)"

    window = webview.create_window(
        window_title, 
        "http://127.0.0.1:5050",
        width=width,
        height=height,
        min_size=(800, 600),
        background_color='#000000'
    )

    logger.info("Fenêtre Webview créée, démarrage de l'interface...")
    # Sauvegarde à la fermeture
    webview.start(save_window_size, window)
    logger.info("Application fermée.")
