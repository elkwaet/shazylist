import os
import sys
import json
import subprocess
from flask import Flask, render_template, jsonify, request, Response
from start import Shazylist
from scanner import LocalScanner

# Configuration des chemins pour PyInstaller (mode frozen)
if getattr(sys, 'frozen', False):
    template_folder = os.path.join(sys._MEIPASS, 'templates')
    static_folder = os.path.join(sys._MEIPASS, 'static')
    app = Flask(__name__, template_folder=template_folder, static_folder=static_folder)
else:
    app = Flask(__name__)

shazam = Shazylist()
scanner = LocalScanner()

CONFIG_FILE = "config.json"

def load_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "r") as f:
            return json.load(f)
    return {"music_folders": []}

def save_config(config):
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f, indent=4)

# Initial scan au démarrage
config = load_config()
scanner.scan_folders(config.get("music_folders", []))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/tracks')
def get_tracks():
    start_date = request.args.get('start')
    end_date = request.args.get('end')
    
    try:
        tracks = shazam.get_filtered_tracks(start_date, end_date)
        for track in tracks:
            track['in_library'] = scanner.is_in_library(track['artist'], track['title'])
        return jsonify(tracks)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/access-status')
def access_status():
    db_path = shazam.db_path
    if not db_path or not os.path.exists(db_path):
        return jsonify({"status": "missing", "path": db_path})
    
    try:
        with open(db_path, 'rb') as f:
            f.read(10)
        return jsonify({"status": "granted"})
    except PermissionError:
        return jsonify({"status": "denied", "path": db_path})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/api/pick-folder')
def pick_folder():
    """Ouvre le sélecteur de dossier via AppleScript (ultra-stable sur macOS)."""
    script = 'osascript -e "POSIX path of (choose folder with prompt \\"Sélectionnez votre dossier de musique\\")"'
    try:
        result = subprocess.check_output(script, shell=True).decode('utf-8').strip()
        return jsonify({"path": result})
    except subprocess.CalledProcessError:
        # L'utilisateur a probablement annulé
        return jsonify({"path": None})

@app.route('/api/open-tcc')
def open_tcc():
    """Ouvre directement la section Accès complet au disque sur macOS."""
    script = 'osascript -e "tell application \\"System Settings\\" to reveal anchor \\"FullDiskAccess\\" of pane id \\"com.apple.Security-Settings.extension\\""'
    try:
        subprocess.run(script, shell=True)
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/settings', methods=['GET', 'POST'])
def settings():
    config = load_config()
    if request.method == 'POST':
        new_folders = request.json.get('music_folders', [])
        config['music_folders'] = new_folders
        save_config(config)
        count = scanner.scan_folders(new_folders)
        return jsonify({"status": "success", "files_indexed": count})
    return jsonify(config)

@app.route('/export/csv')
def export_csv():
    start_date = request.args.get('start')
    end_date = request.args.get('end')
    csv_data = shazam.export_csv(start_date, end_date)
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=shazylist_export.csv"}
    )

@app.route('/export/txt')
def export_txt():
    start_date = request.args.get('start')
    end_date = request.args.get('end')
    txt_data = shazam.export_txt(start_date, end_date)
    return Response(
        txt_data,
        mimetype="text/plain",
        headers={"Content-disposition": "attachment; filename=shazylist_export.txt"}
    )

if __name__ == '__main__':
    app.run(debug=True, port=5050)
