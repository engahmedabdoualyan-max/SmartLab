#!/usr/bin/env python3
"""
SmartLab Backend - Python Flask Application

This provides the backend API for the SmartLab frontend application,
with proper security controls and database integration.
"""

import os
import json
import hashlib
import secrets
from datetime import datetime
from functools import wraps

from flask import Flask, request, jsonify, g, abort
from flask_cors import CORS

# In-memory database (for demo purposes)
# In production, this would be replaced with a real database like PostgreSQL
DATABASE = {
    'sessions': {},
    'users': {},
    'domains': {
        'compaction': {
            'id': 'compaction',
            'name': 'Compaction Test',
            'description': 'ASTM D698 / D1557 - Standard Proctor Test'
        },
        'cbr': {
            'id': 'cbr',
            'name': 'CBR Test',
            'description': 'ASTM D1883 - California Bearing Ratio'
        },
        'slump': {
            'id': 'slump',
            'name': 'Slump Test',
            'description': 'ASTM C143 - Concreteness Slump'
        },
        'maturity': {
            'id': 'maturity',
            'name': 'Maturity Test',
            'description': 'ASTM C1074 - Concrete Maturity'
        },
        'marshall': {
            'id': 'marshall',
            'name': 'Marshall Test',
            'description': 'ASTM D6927 - Asphalt Stability'
        },
        'bitumen': {
            'id': 'bitumen',
            'name': 'Bitumen Content',
            'description': 'ASTM D6307 - Bitumen Penetration'
        },
        'penetration': {
            'id': 'penetration',
            'name': 'Penetration Test',
            'description': 'ASTM D5 - Asphalt Penetration'
        },
        'sieve': {
            'id': 'sieve',
            'name': 'Sieve Analysis',
            'description': 'ASTM C136 - Soil Grading'
        },
        'compressive': {
            'id': 'compressive',
            'name': 'Compressive Strength',
            'description': 'ASTM C39 - Concrete Compressive'
        },
        'ductility': {
            'id': 'ductility',
            'name': 'Ductility Test',
            'description': 'ASTM D113 - Asphalt Ductility'
        },
        'air': {
            'id': 'air',
            'name': 'Air Content',
            'description': 'ASTM C231 - Air-Entrained Concrete'
        },
        'atterberg': {
            'id': 'atterberg',
            'name': 'Atterberg Limits',
            'description': 'ASTM D4027 - Soil Plasticity'
        }
    }
}

# CSRF protection
CSRF_TOKENS = {}

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(32))
app.config['DEBUG'] = os.environ.get('DEBUG', 'False').lower() == 'true'

# Enable CORS
CORS(app)

# Security headers middleware
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

# Utility functions
def generate_csrf_token(session_id=None):
    """Generate a CSRF token for the session"""
    if session_id is None:
        session_id = hashlib.sha256(os.urandom(32)).hexdigest()
    token = hashlib.sha256(os.urandom(32)).hexdigest()
    CSRF_TOKENS[session_id] = token
    return token

def validate_csrf_token(session_id, token):
    """Validate the CSRF token"""
    expected_token = CSRF_TOKENS.get(session_id)
    return expected_token is not None and secrets.compare_digest(expected_token, token)

def sanitize_input(input_str):
    """Sanitize input to prevent XSS attacks"""
    if input_str is None:
        return None
    
    # Convert to string
    input_str = str(input_str)
    
    # Escape HTML characters
    escapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    }
    
    return input_str.replace('&', escapes['&']).replace('<', escapes['<']).replace('>', escapes['>']).replace('"', escapes['"']).replace("'", escapes["'"]).replace('/', escapes['/'])

def generate_session_id():
    """Generate a unique session ID"""
    return hashlib.sha256(os.urandom(32)).hexdigest()

# Authentication decorator
def authenticate(f):
    """Decorator for protected routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check for authentication token
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication required'}), 401
        
        token = auth_header.split(' ')[1]
        
        # Validate token (in production, would check database)
        # For demo, we'll accept any non-empty token
        if not token or len(token) < 10:
            return jsonify({'error': 'Invalid authentication token'}), 401
        
        # Set current user in global context
        g.current_user_id = 'demo_user'
        g.session_id = generate_session_id()
        g.csrf_token = generate_csrf_token(g.session_id)
        
        return f(*args, **kwargs)
    
    return decorated_function

# Input validation decorator
def validate_request(required_fields):
    """Decorator for validating request body"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not request.is_json:
                return jsonify({'error': 'Request must be JSON'}), 400
            
            data = request.get_json()
            
            # Check required fields
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return jsonify({
                    'error': 'Missing required fields',
                    'missing_fields': missing_fields
                }), 400
            
            # Sanitize inputs
            for key, value in data.items():
                if isinstance(value, str):
                    data[key] = sanitize_input(value)
            
            # Pass sanitized data to the function
            return f(*args, data=data, **kwargs)
        
        return decorated_function
    
    return decorator

# Database helper functions
def get_session(session_id):
    """Get a session by ID"""
    return DATABASE['sessions'].get(session_id)


def create_session(session_data):
    """Create a new session"""
    session_id = generate_session_id()
    session_data['id'] = session_id
    session_data['created_at'] = datetime.utcnow().isoformat()
    
    DATABASE['sessions'][session_id] = session_data
    return session_id


def update_session(session_id, updates):
    """Update a session"""
    if session_id not in DATABASE['sessions']:
        return None
    
    DATABASE['sessions'][session_id].update(updates)
    return DATABASE['sessions'][session_id]


def get_all_sessions():
    """Get all sessions"""
    return list(DATABASE['sessions'].values())


def get_domain(domain_id):
    """Get a domain by ID"""
    return DATABASE['domains'].get(domain_id)


def get_all_domains():
    """Get all domains"""
    return list(DATABASE['domains'].values())

# API Routes

# Authentication endpoints
@app.route('/api/auth/login', methods=['POST'])
@validate_request(['email', 'password'])
def login(data):
    """User login endpoint"""
    email = data['email']
    password = data['password']
    
    # In production, would validate against database
    # For demo, we'll accept any email and return a token
    
    # Generate authentication token
    auth_token = hashlib.sha256(os.urandom(32)).hexdigest()
    
    return jsonify({
        'token': auth_token,
        'expires_in': 3600,
        'user': {
            'id': 'demo_user',
            'email': email,
            'role': 'engineer'
        }
    })

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """User logout endpoint"""
    return jsonify({'message': 'Logged out successfully'})

# Domain endpoints
@app.route('/api/domains', methods=['GET'])
def get_domains():
    """Get all available test domains"""
    return jsonify({
        'success': True,
        'domains': get_all_domains()
    })

@app.route('/api/domains/<domain_id>', methods=['GET'])
def get_domain_details(domain_id):
    """Get details for a specific domain"""
    domain = get_domain(domain_id)
    if not domain:
        return jsonify({'error': 'Domain not found'}), 404
    
    return jsonify({
        'success': True,
        'domain': domain
    })

# Session endpoints
@app.route('/api/sessions', methods=['POST'])
@authenticate
@validate_request(['test_id', 'domain_id'])
def create_test_session(data):
    """Create a new test session"""
    session_data = {
        'test_id': data['test_id'],
        'domain_id': data['domain_id'],
        'user_id': g.current_user_id,
        'status': 'in_progress',
        'strikes': [],
        'results': None
    }
    
    session_id = create_session(session_data)
    
    return jsonify({
        'success': True,
        'session_id': session_id,
        'csrf_token': g.csrf_token
    })

@app.route('/api/sessions/<session_id>', methods=['GET'])
def get_session_details(session_id):
    """Get details for a specific session"""
    session = get_session(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    # Check if user is authorized (in production, would validate user)
    # For demo, we'll allow access to any valid session
    
    return jsonify({
        'success': True,
        'session': session
    })

@app.route('/api/sessions/<session_id>', methods=['PUT'])
def update_session_data(session_id):
    """Update session data (requires authentication)"""
    # Check authentication
    if 'current_user_id' not in g:
        return jsonify({'error': 'Authentication required'}), 401
    
    session = get_session(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    # Validate CSRF token if provided
    csrf_token = request.headers.get('X-CSRF-Token')
    if csrf_token and not validate_csrf_token(session_id, csrf_token):
        return jsonify({'error': 'Invalid CSRF token'}), 403
    
    # Get update data
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400
    
    update_data = request.get_json()
    
    # Sanitize inputs
    for key, value in update_data.items():
        if isinstance(value, str):
            update_data[key] = sanitize_input(value)
        elif isinstance(value, dict):
            for sub_key, sub_value in value.items():
                if isinstance(sub_value, str):
                    update_data[key][sub_key] = sanitize_input(sub_value)
    
    # Update session
    updated_session = update_session(session_id, update_data)
    
    return jsonify({
        'success': True,
        'session': updated_session
    })

@app.route('/api/sessions/<session_id>/complete', methods=['POST'])
@authenticate
@validate_request([])
def complete_session(data):
    """Complete a test session"""
    session_id = request.args.get('session_id', data.get('session_id'))
    if not session_id:
        return jsonify({'error': 'Session ID is required'}), 400
    
    session = get_session(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    # Validate CSRF token if provided
    csrf_token = request.headers.get('X-CSRF-Token')
    if csrf_token and not validate_csrf_token(session_id, csrf_token):
        return jsonify({'error': 'Invalid CSRF token'}), 403
    
    # Update session status
    session['status'] = 'completed'
    session['completed_at'] = datetime.utcnow().isoformat()
    
    DATABASE['sessions'][session_id] = session
    
    return jsonify({
        'success': True,
        'message': 'Session completed successfully',
        'session': session
    })

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("Starting SmartLab Backend Server...")
    print("Running on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=app.config['DEBUG'])
