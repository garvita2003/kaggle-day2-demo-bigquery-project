import os
import requests
import feedparser
from flask import Flask, jsonify, render_template, request
from bs4 import BeautifulSoup

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

def clean_html_content(html_string):
    """
    Cleans feed HTML content to extract plain text descriptions.
    """
    if not html_string:
        return ""
    soup = BeautifulSoup(html_string, "html.parser")
    # Return pretty formatted text or clean HTML
    return soup.get_text(separator="\n").strip()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/notes")
def get_release_notes():
    try:
        # Fetch the feed
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(FEED_URL, headers=headers, timeout=15)
        response.raise_for_status()
        
        # Parse XML feed using feedparser
        feed = feedparser.parse(response.content)
        
        notes = []
        for entry in feed.entries:
            # Clean content/summary
            raw_content = entry.get("summary", entry.get("description", ""))
            clean_content = clean_html_content(raw_content)
            
            note = {
                "id": entry.get("id", entry.get("link", "")),
                "title": entry.get("title", "No Title"),
                "link": entry.get("link", "#"),
                "published": entry.get("published", entry.get("updated", "")),
                "content_html": raw_content,
                "content_text": clean_content
            }
            notes.append(note)
            
        return jsonify({"success": True, "notes": notes})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
