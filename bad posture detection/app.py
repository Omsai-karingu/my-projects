from flask import Flask, render_template, jsonify
from flask_cors import CORS

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

@app.route('/')
def index():
    """Serve the main application page."""
    return render_template('index.html')

@app.route('/settings')
def settings():
    """Serve the settings page."""
    return render_template('settings.html')

@app.route('/stats')
def stats():
    """Serve the statistics page."""
    return render_template('stats.html')

@app.route('/api/health')
def health_check():
    """API endpoint for health check."""
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 