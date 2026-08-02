import json
import os
import time
from datetime import datetime, timedelta
from pathlib import Path

# Initialize backend data storage
backend_data = {
    "tests": [],
    "hardware_devices": [],
    "sessions": [],
    "users": [],
    "selected_tests": [],
    "audit_logs": []
}

# Backend API endpoints for managing selected tests
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Track currently selected test across all sessions
selected_test_session = {
    "current_test_id": None,
    "test_name": None,
    "test_type": None,
    "selected_at": None,
    "session_id": None,
    "status": "ACTIVE"  # ACTIVE, COMPLETED, CANCELLED
}

# Test categories and their properties
test_categories = {
    "marshall": {
        "name": "Marshall Stability Test",
        "category": "الأسفلت",
        "standard": "ASTM D6927",
        "description": "اختبار ثبات عينات الأسفلت",
        "icon": "🧪",
        "color": "#fbbf24",
        "features": ["ثبات التحميل", "قيمة التدفق", "الكثافة الظاهرية"],
        "results_fields": ["الثبات (kN)", "التدفق (mm)", "الكثافة الظاهرية (kg/m³)"]
    },
    "density": {
        "name": "Asphalt Density Test",
        "category": "الأسفلت", 
        "standard": "ASTM D2049",
        "description": "اختبار كثافة العينات المدكوكة",
        "icon": "⚖️",
        "color": "#10b981",
        "features": ["الكثافة الجافة", "الكثافة الصلبة"],
        "results_fields": ["الكثافة (kg/m³)", "النطاق/التحقق"]
    },
"flow": {
    "name": "Asphalt Flow Test",
    "category": "الأسفلت",
    "standard": "ASTM D2782",
    "description": "اختبار قيمة التدفق للأسفلت المدكوك",
    "icon": "🫧",
    "color": "#3b82f6",
    "features": ["قيمة التدفق", "الثبات النسبي"],
        "results_fields": ["التدفق (mm)", "الثبات النسبي (%)"]
},
    "ignition": {
        "name": "Asphalt Ignition Test",
        "category": "الأسفلت",
        "standard": "ASTM D5146",
        "description": "اختبار مقاومة الاشتعال للأسفلت",
        "icon": "🔥",
        "color": "#ef4444", 
        "features": ["نقطة الاشتعال", "مقاومة اللهب"],
        "results_fields": ["درجة الحرارة (°C)", "مستوى الخطورة (%)"]
    },
    "extraction": {
        "name": "Asphalt Extraction Test",
        "category": "الأسفلت",
        "standard": "ASTM D2359",
        "description": "اختبار استخراج المواد البيتومينية",
        "icon": "🧪",
        "color": "#8b5cf6",
        "features": ["نسبة الاستخراج", "محتوى الرغوة"],
        "results_fields": ["نسبة الاستخراج (%)", "محتوى الرغوة (%)"]
    },
    "gradation": {
        "name": "Asphalt Gradation Test",
        "category": "الأسفلت",
        "standard": "ASTM D2976",
        "description": "تحليل منحنيات توزيع حبيبات الأسفلت",
        "icon": "🔍",
        "color": "#ec4899",
        "features": ["حجم الحبيبات", "تحليل المنحنيات"],
        "results_fields": ["أحجام الحبيبات (%, 0.075 مم)", "النطاق" ]
    }
}

# API Endpoints

@app.route('/api/test/selection', methods=['GET'])
def get_selected_test():
    """Get currently selected test information"""
    return jsonify({
        "selected_test": selected_test_session,
        "available_tests": {
            "marshall": test_categories["marshall"],
            "density": test_categories["density"],
            "flow": test_categories["flow"],
            "ignition": test_categories["ignition"],
            "extraction": test_categories["extraction"],
            "gradation": test_categories["gradation"]
        }
    })

@app.route('/api/test/select', methods=['POST'])
def select_test():
    """Select a test and track it in the session"""
    data = request.get_json() or {}
    
    test_id = data.get('test_id')
    test_name = data.get('test_name')
    test_type = data.get('test_type')
    session_id = data.get('session_id', f"SL-{int(time.time() * 1000)}")
    
    selected_test_session.update({
        "current_test_id": test_id,
        "test_name": test_name,
        "test_type": test_type,
        "selected_at": datetime.now().isoformat(),
        "session_id": session_id,
        "status": "ACTIVE"
    })
    
    test_selection_data = {
        "test_id": test_id,
        "test_name": test_name,
        "test_type": test_type,
        "session_id": session_id,
        "status": "ACTIVE",
        "selected_at": selected_test_session["selected_at"],
        "ip_address": request.headers.get('X-Forwarded-For', request.remote_addr),
        "user_agent": request.headers.get('User-Agent')
    }
    backend_data["selected_tests"].append(test_selection_data)

    audit_log = {
        "userId": "system",
        "action": "TEST_SELECTED",
        "entity": "TestSelection",
        "entityId": session_id,
        "newData": {
            "testId": test_id,
            "testName": test_name,
            "testType": test_type,
            "session": session_id
        },
        "ipAddress": request.headers.get('X-Forwarded-For', request.remote_addr),
        "userAgent": request.headers.get('User-Agent'),
        "timestamp": datetime.now().isoformat()
    }
    backend_data["audit_logs"].append(audit_log)
    
    return jsonify({
        "success": True,
        "message": f"Test '{test_name}' selected successfully",
        "test_info": selected_test_session
    })

@app.route('/api/test/analytics')
def get_test_analytics():
    """Get analytics for selected tests across sessions"""
    total_sessions = len(backend_data["sessions"])
    test_counts = {}
    
    for session in backend_data["sessions"]:
        test_type = session.get("current_test_id")
        if test_type:
            test_counts[test_type] = test_counts.get(test_type, 0) + 1
    
    analytics_data = {
        "total_sessions": total_sessions,
        "active_selections": len([s for s in backend_data["selected_tests"] if s.get("status") == "ACTIVE"]),
        "test_distribution": test_counts,
        "recent_activity": {
            "last_hour": sum(
                1 for s in backend_data["selected_tests"]
                if s.get("selected_at") and datetime.fromisoformat(s["selected_at"].replace('Z', '+00:00')) > datetime.now() - timedelta(hours=1)
            )
        },
        "most_selected_tests": sorted(test_counts.items(), key=lambda x: x[1], reverse=True)[:3]
    }
    
    return jsonify({
        "analytics": analytics_data,
        "test_categories": {k: v["name"] for k, v in test_categories.items()}
    })

@app.route('/api/test/summary')
def get_test_summary():
    """Get summary of all test selections"""
    
    # Mock data for demonstration
    summary_data = {
        "selected_test_name": selected_test_session.get("test_name") or "No test selected",
        "selected_test_type": selected_test_session.get("test_type") or "N/A",
        "current_session_id": selected_test_session.get("session_id") or "N/A",
        "selection_time": selected_test_session.get("selected_at") or None,
        "total_selections": len(backend_data["selected_tests"]),
        "active_sessions": len([s for s in backend_data["selected_tests"] if s.get("status") == "ACTIVE"])
    }
    
    return jsonify({
        "test_summary": summary_data,
        "category_info": test_categories.get(selected_test_session.get("test_type")) or None
    })

# Static root for original site
STATIC_ROOT = Path(__file__).resolve().parent.parent

# Health check endpoint (before catch-all for clarity)
@app.route('/api/health')
def health_check():
    """Backend health check"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "smartlab-test-tracker",
        "version": "2.0.0",
        "selected_tests_count": len(backend_data["selected_tests"]),
        "active_sessions": len([s for s in backend_data["selected_tests"] if s.get("status") == "ACTIVE"])
    })

# Original HTML page generator
@app.route('/')
def serve_original_page():
    """Serve the original SmartLAB static site"""
    return send_from_directory(STATIC_ROOT, 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve any static file from the original project root"""
    file_path = STATIC_ROOT / filename
    if file_path.exists() and file_path.is_file():
        return send_from_directory(STATIC_ROOT, filename)
    return "Page not found", 404

if __name__ == '__main__':
    print("=" * 80)
    print("🚀 SmartLAB Test Tracker API Starting...")
    print("=" * 80)
    print(f"📊 Selected Tests Storage: {len(backend_data['selected_tests'])} tests tracked")
    print(f"🏥 Backend APIs running on port 5001")
    print(f"🌐 Original static site (via Flask): http://localhost:5001/")
    print(f"🔧 Test Tracker API: http://localhost:5001/api/")
    print("=" * 80)
    
    app.run(host='0.0.0.0', port=5001, debug=False)
