#! /opt/misc/webshop/webshop-backend/venv/bin/python3.11
import os
from app import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 4015))
    app.run(host="0.0.0.0", port=port)
    debug=True
