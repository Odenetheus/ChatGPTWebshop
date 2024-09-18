# app.py
from flask import Flask, request, jsonify, send_file
import sqlite3
import smtplib
from email.mime.text import MIMEText
from flask_cors import CORS
import json
import requests
import pandas as pd
from io import BytesIO
from apscheduler.schedulers.background import BackgroundScheduler

app = Flask(__name__)
CORS(app)

# Initialize the scheduler
scheduler = BackgroundScheduler()
scheduler.start()

# Database helper functions
def get_db_connection():
    conn = sqlite3.connect('webshop.db')
    conn.row_factory = sqlite3.Row
    return conn

# ========================
# Product Endpoints
# ========================

# Get all products (considering visibility and category filtering)
@app.route('/api/products', methods=['GET'])
def get_products():
    include_hidden = request.args.get('include_hidden', 'false').lower() == 'true'
    category = request.args.get('category')
    conn = get_db_connection()
    query = 'SELECT * FROM products WHERE is_visible = 1'
    params = []
    if include_hidden:
        query = 'SELECT * FROM products WHERE 1=1'
    if category:
        query += ' AND category = ?'
        params.append(category)
    products = conn.execute(query, params).fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in products])

# Search products
@app.route('/api/products/search', methods=['GET'])
def search_products():
    query_param = request.args.get('q', '')
    conn = get_db_connection()
    products = conn.execute('''
        SELECT * FROM products
        WHERE (name LIKE ? OR description LIKE ?) AND is_visible = 1
    ''', ('%'+query_param+'%', '%'+query_param+'%')).fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in products])

# Get a single product
@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    conn = get_db_connection()
    product = conn.execute('SELECT * FROM products WHERE id = ?', (product_id,)).fetchone()
    conn.close()
    if product is None or product['is_visible'] == 0:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify(dict(product))

# Add a new product
@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.get_json()
    conn = get_db_connection()
    conn.execute(
        'INSERT INTO products (name, description, price, image_url, is_visible, category, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
        (
            data['name'],
            data['description'],
            data['price'],
            data['image_url'],
            data.get('is_visible', 1),
            data.get('category', 'General'),
            data.get('stock', 0)
        )
    )
    conn.commit()
    conn.close()
    return jsonify({'message': 'Product added successfully'}), 201

# Update an existing product
@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.get_json()
    conn = get_db_connection()
    conn.execute('''
        UPDATE products
        SET name = ?, description = ?, price = ?, image_url = ?, is_visible = ?, category = ?, stock = ?
        WHERE id = ?
    ''', (
        data['name'],
        data['description'],
        data['price'],
        data['image_url'],
        data.get('is_visible', 1),
        data.get('category', 'General'),
        data.get('stock', 0),
        product_id
    ))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Product updated successfully'}), 200

# Delete a product
@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM products WHERE id = ?', (product_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Product deleted successfully'}), 200

# ========================
# Payment Methods Endpoints
# ========================

# Get all payment methods
@app.route('/api/payment_methods', methods=['GET'])
def get_payment_methods():
    conn = get_db_connection()
    methods = conn.execute('SELECT * FROM payment_methods').fetchall()
    conn.close()
    return jsonify([dict(method) for method in methods])

# Add a new payment method
@app.route('/api/payment_methods', methods=['POST'])
def add_payment_method():
    data = request.get_json()
    conn = get_db_connection()
    conn.execute(
        'INSERT INTO payment_methods (name, type, embed_code, http_chain) VALUES (?, ?, ?, ?)',
        (
            data['name'],
            data['type'],
            data.get('embed_code', ''),
            json.dumps(data.get('http_chain', []))
        )
    )
    conn.commit()
    conn.close()
    return jsonify({'message': 'Payment method added successfully'}), 201

# Update a payment method
@app.route('/api/payment_methods/<int:method_id>', methods=['PUT'])
def update_payment_method(method_id):
    data = request.get_json()
    conn = get_db_connection()
    conn.execute('''
        UPDATE payment_methods
        SET name = ?, type = ?, embed_code = ?, http_chain = ?
        WHERE id = ?
    ''', (
        data['name'],
        data['type'],
        data.get('embed_code', ''),
        json.dumps(data.get('http_chain', [])),
        method_id
    ))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Payment method updated successfully'}), 200

# Delete a payment method
@app.route('/api/payment_methods/<int:method_id>', methods=['DELETE'])
def delete_payment_method(method_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM payment_methods WHERE id = ?', (method_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Payment method deleted successfully'}), 200

# Process payment using HTTP request chain
@app.route('/api/process_payment', methods=['POST'])
def process_payment():
    data = request.get_json()
    method_id = data.get('method_id')
    payment_data = data.get('payment_data')

    conn = get_db_connection()
    method = conn.execute('SELECT * FROM payment_methods WHERE id = ?', (method_id,)).fetchone()
    conn.close()

    if not method:
        return jsonify({'error': 'Payment method not found'}), 404

    if method['type'] == 'http_chain':
        http_chain = json.loads(method['http_chain'])
        response_data = payment_data
        for step in http_chain:
            try:
                response = requests.request(
                    method=step['method'],
                    url=step['url'],
                    headers=step.get('headers', {}),
                    json=response_data
                )
                response.raise_for_status()
                response_data = response.json()
            except Exception as e:
                return jsonify({'error': str(e)}), 400
        return jsonify({'message': 'Payment processed successfully', 'response': response_data}), 200
    else:
        return jsonify({'error': 'Invalid payment method type'}), 400

# ========================
# Checkout and Invoice
# ========================

# Function to send invoice email
def send_invoice(to_email, order_details):
    msg = MIMEText(f"Thank you for your purchase!\n\nOrder Details:\n{order_details}")
    msg['Subject'] = 'Your Invoice'
    msg['From'] = 'yourshop@example.com'  # Replace with your email
    msg['To'] = to_email

    # Replace the SMTP details with your email provider's settings
    with smtplib.SMTP('smtp.example.com', 587) as server:
        server.starttls()
        server.login('your-email@example.com', 'your-email-password')
        server.send_message(msg)

# Checkout endpoint
@app.route('/api/checkout', methods=['POST'])
def checkout():
    data = request.get_json()
    email = data.get('email')
    cart = data.get('cart')  # Expecting cart data from the frontend
    if email and cart:
        conn = get_db_connection()
        for item in cart:
            # Decrement stock
            conn.execute('UPDATE products SET stock = stock - 1 WHERE id = ?', (item['id'],))
            # Record order
            conn.execute(
                '''
                INSERT INTO orders (product_id, product_name, quantity, price, total_price, email, order_status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ''',
                (
                    item['id'],
                    item['name'],
                    1,  # Quantity
                    item['price'],
                    item['price'],  # Total price
                    email,
                    'Pending'  # Initial order status
                )
            )
        conn.commit()
        conn.close()
        # Send invoice
        order_details = "\n".join([f"{item['name']} - ${item['price']:.2f}" for item in cart])
        send_invoice(email, order_details)
        return jsonify({'message': 'Checkout successful and invoice sent'}), 200
    else:
        return jsonify({'error': 'Invalid data'}), 400

# ========================
# Event Logging Endpoint
# ========================

# Log events
@app.route('/api/events', methods=['POST'])
def log_event():
    data = request.get_json()
    event_type = data.get('event')
    additional_data = data.get('data', {})
    conn = get_db_connection()
    conn.execute(
        'INSERT INTO events (event_type, additional_data) VALUES (?, ?)',
        (event_type, json.dumps(additional_data))
    )
    conn.commit()
    conn.close()
    return jsonify({'message': 'Event logged successfully'}), 201

# ========================
# Sales Reports and Scheduling
# ========================

scheduled_reports = []

def send_scheduled_report(email, report_type):
    # Generate the report
    conn = get_db_connection()
    if report_type == 'per_product':
        query = '''
            SELECT product_name, SUM(quantity) as total_quantity, SUM(total_price) as total_sales
            FROM orders
            GROUP BY product_id
        '''
        filename = 'per_product_sales_report.xlsx'
    else:
        query = '''
            SELECT id, product_name, quantity, price, total_price, order_date, email, order_status
            FROM orders
        '''
        filename = 'total_sales_report.xlsx'
    df = pd.read_sql_query(query, conn)
    conn.close()

    # Save the report to a file
    output = BytesIO()
    writer = pd.ExcelWriter(output, engine='openpyxl')
    df.to_excel(writer, index=False, sheet_name='Sales Report')
    writer.save()
    output.seek(0)

    # Send the report via email
    msg = MIMEMultipart()
    msg['Subject'] = 'Scheduled Sales Report'
    msg['From'] = 'yourshop@example.com'  # Replace with your email
    msg['To'] = email
    body = MIMEText('Please find the attached sales report.')
    msg.attach(body)
    attachment = MIMEApplication(output.read(), _subtype='xlsx')
    attachment.add_header('Content-Disposition', 'attachment', filename=filename)
    msg.attach(attachment)

    with smtplib.SMTP('smtp.example.com', 587) as server:
        server.starttls()
        server.login('your-email@example.com', 'your-email-password')
        server.send_message(msg)

def schedule_report(email, report_type, schedule):
    # Add job to scheduler
    if schedule['interval'] == 'daily':
        scheduler.add_job(send_scheduled_report, 'cron', hour=schedule['hour'], minute=schedule['minute'],
                          args=[email, report_type])
    elif schedule['interval'] == 'weekly':
        scheduler.add_job(send_scheduled_report, 'cron', day_of_week=schedule['day_of_week'],
                          hour=schedule['hour'], minute=schedule['minute'], args=[email, report_type])
    elif schedule['interval'] == 'monthly':
        scheduler.add_job(send_scheduled_report, 'cron', day=schedule['day'],
                          hour=schedule['hour'], minute=schedule['minute'], args=[email, report_type])

# Generate and download sales report
@app.route('/api/reports/sales', methods=['GET'])
def get_sales_report():
    report_type = request.args.get('type', 'total')  # 'total' or 'per_product'
    conn = get_db_connection()
    if report_type == 'per_product':
        query = '''
            SELECT product_name, SUM(quantity) as total_quantity, SUM(total_price) as total_sales
            FROM orders
            GROUP BY product_id
        '''
    else:
        query = '''
            SELECT id, product_name, quantity, price, total_price, order_date, email, order_status
            FROM orders
        '''
    df = pd.read_sql_query(query, conn)
    conn.close()

    # Create an in-memory output file for the workbook.
    output = BytesIO()
    writer = pd.ExcelWriter(output, engine='openpyxl')
    df.to_excel(writer, index=False, sheet_name='Sales Report')
    writer.save()
    output.seek(0)

    return send_file(
        output,
        attachment_filename='sales_report.xlsx',
        as_attachment=True,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

# Schedule sales report
@app.route('/api/reports/schedule', methods=['POST'])
def schedule_sales_report():
    data = request.get_json()
    email = data.get('email')
    report_type = data.get('report_type', 'total')
    schedule_data = data.get('schedule')

    if email and schedule_data:
        schedule_report(email, report_type, schedule_data)
        scheduled_reports.append({
            'email': email,
            'report_type': report_type,
            'schedule': schedule_data
        })
        return jsonify({'message': 'Report scheduled successfully'}), 201
    else:
        return jsonify({'error': 'Invalid data'}), 400

# Get scheduled reports
@app.route('/api/reports/schedule', methods=['GET'])
def get_scheduled_reports():
    return jsonify(scheduled_reports), 200

# ========================
# Orders Management Endpoints
# ========================

# Get all orders
@app.route('/api/orders', methods=['GET'])
def get_orders():
    conn = get_db_connection()
    orders = conn.execute('SELECT * FROM orders').fetchall()
    conn.close()
    return jsonify([dict(order) for order in orders])

# Update order status
@app.route('/api/orders/<int:order_id>', methods=['PUT'])
def update_order_status(order_id):
    data = request.get_json()
    new_status = data.get('order_status')
    if new_status:
        conn = get_db_connection()
        conn.execute('UPDATE orders SET order_status = ? WHERE id = ?', (new_status, order_id))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Order status updated successfully'}), 200
    else:
        return jsonify({'error': 'Invalid data'}), 400

if __name__ == '__main__':
    app.run(debug=True)
