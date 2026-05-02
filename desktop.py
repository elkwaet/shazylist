import webview
import threading
import os
import time
import sys
import json
import logging
from app import app, shazam

# Configuration du Logging (Chemin sécurisé sur macOS)
log_dir = os.path.expanduser('~/Library/Logs/Shazylist')
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

LOG_FILE = os.path.join(log_dir, 'debug.log')
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

logger.info("Démarrage de Shazylist...")

CONFIG_FILE = os.path.expanduser('~/Library/Application Support/Shazylist/config.json')
config_dir = os.path.dirname(CONFIG_FILE)
if not os.path.exists(config_dir):
    os.makedirs(config_dir)

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

class Api:
    def set_window(self, window):
        self.window = window

    def save_file(self, content, filename):
        if not hasattr(self, 'window') or not self.window:
            return False
        # create_file_dialog avec SAVE_DIALOG renvoie une chaîne (le chemin) ou None
        result = self.window.create_file_dialog(webview.SAVE_DIALOG, save_filename=filename)
        if result:
            file_path = result
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                logger.info(f"Fichier exporté avec succès : {file_path}")
                return True
            except Exception as e:
                logger.error(f"Erreur lors de l'export natif : {e}")
                return False
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

    api = Api()
    window = webview.create_window(
        window_title, 
        "http://127.0.0.1:5050",
        js_api=api,
        width=width,
        height=height,
        min_size=(800, 600),
        background_color='#000000'
    )
    api.set_window(window)

    logger.info("Fenêtre Webview créée, démarrage de l'interface...")
    # Sauvegarde à la fermeture
    webview.start(save_window_size, window)
    logger.info("Application fermée.")
