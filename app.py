from flask import Flask, render_template, jsonify, send_file, Response, request
from start import Shazylist
import os
import io
import csv

app = Flask(__name__)

def filter_tracks_by_date(tracks, start_date, end_date):
    if start_date:
        tracks = [t for t in tracks if t['date'][:10] >= start_date]
    if end_date:
        tracks = [t for t in tracks if t['date'][:10] <= end_date]
    return tracks

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/tracks')
def get_tracks():
    shazy = Shazylist()
    try:
        tracks = shazy.fetch_tracks()
        start_date = request.args.get('start')
        end_date = request.args.get('end')
        tracks = filter_tracks_by_date(tracks, start_date, end_date)
        return jsonify(tracks)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/export/csv')
def export_csv():
    shazy = Shazylist()
    tracks = shazy.fetch_tracks()
    start_date = request.args.get('start')
    end_date = request.args.get('end')
    tracks = filter_tracks_by_date(tracks, start_date, end_date)

    if not tracks:
        return "Aucune donnée pour cette période", 404
        
    output = io.StringIO()
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
    
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=shazam_export.csv"}
    )

@app.route('/export/txt')
def export_txt():
    shazy = Shazylist()
    tracks = shazy.fetch_tracks()
    start_date = request.args.get('start')
    end_date = request.args.get('end')
    tracks = filter_tracks_by_date(tracks, start_date, end_date)
    
    if not tracks:
        return "Aucune donnée pour cette période", 404
        
    output = io.StringIO()
    for i, t in enumerate(tracks, 1):
        output.write(f"{i} - {t['title']} - {t['artist']}\n")
    
    return Response(
        output.getvalue(),
        mimetype="text/plain",
        headers={"Content-disposition": "attachment; filename=shazam_list.txt"}
    )

if __name__ == '__main__':
    app.run(debug=True, port=5050)
