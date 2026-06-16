# BigQuery Release Notes Viewer

A sleek, responsive, single-page web application built with Python Flask and vanilla HTML, CSS, and JavaScript. The app retrieves live Google Cloud BigQuery release updates, formats them into a clean developer dashboard, and supports one-click sharing/tweeting.

## Features
- **Live Feed Parsing**: Fetches the official Google Cloud BigQuery XML/Atom feed directly.
- **Dynamic Content Formatting**: Renders release code-blocks, lists, and formatted hyperlinks inline.
- **Interactive Share-to-Twitter**: Formats selected updates to draft structured, character-limit-safe posts via Twitter Web Intent.
- **Aesthetic UI**: Dark theme dashboard using modern typography (`Outfit` & `Plus Jakarta Sans`) and loading skeleton animations.
- **Copy to Clipboard**: Quick-copy release title and details.
- **CSV Export**: Download release notes as a tabular file.
- **Light/Dark Toggle**: Instantly swap theme modes.

## Technical Stack
- **Backend**: Python, Flask, requests, feedparser, BeautifulSoup4
- **Frontend**: HTML5, Vanilla CSS3 (Custom Properties / Flexbox / CSS Grid), JavaScript ES6+

## Installation

1. **Clone & Setup**:
   ```bash
   git clone https://github.com/garvita2003/kaggle-day2-demo-bigquery-project.git
   cd kaggle-day2-demo-bigquery-project
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run Application**:
   ```bash
   python app.py
   ```
   *Navigate to `http://127.0.0.1:5000` in your web browser.*
