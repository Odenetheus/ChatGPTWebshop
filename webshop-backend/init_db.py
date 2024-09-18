# init_db.py
import sqlite3

def init_db():
    conn = sqlite3.connect('webshop.db')
    c = conn.cursor()
    # Create products table
    c.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            price REAL NOT NULL,
            image_url TEXT NOT NULL,
            is_visible INTEGER DEFAULT 1,
            category TEXT DEFAULT 'General',
            stock INTEGER DEFAULT 0
        )
    ''')
    # Create payment_methods table
    c.execute('''
        CREATE TABLE IF NOT EXISTS payment_methods (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            embed_code TEXT,
            http_chain TEXT
        )
    ''')
    # Create events table
    c.execute('''
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            additional_data TEXT
        )
    ''')
    # Create orders table
    c.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            total_price REAL NOT NULL,
            order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            email TEXT NOT NULL,
            order_status TEXT DEFAULT 'Pending',
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    ''')
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database initialized successfully.")
