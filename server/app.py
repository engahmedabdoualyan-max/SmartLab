from flask import Flask, render_template, jsonify, request, send_file, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import serial
import serial.tools.list_ports
import json
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'database', 'lab_automation.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['REPORTS_FOLDER'] = os.path.join(BASE_DIR, 'reports')

db = SQLAlchemy(app)
CORS(app)


class Domain(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.String(200))
    tests = db.relationship('Test', backref='domain', lazy=True)


class Test(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    domain_id = db.Column(db.Integer, db.ForeignKey('domain.id'), nullable=False)
    config_schema = db.Column(db.Text)
    formulas = db.Column(db.Text)


class TestSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    test_id = db.Column(db.Integer, db.ForeignKey('test.id'), nullable=False)
    domain_id = db.Column(db.Integer, db.ForeignKey('domain.id'), nullable=False)
    engineer_inputs = db.Column(db.Text)
    sensor_data = db.Column(db.Text)
    results = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


def seed_data():
    if Domain.query.count() == 0:
        d1 = Domain(name='قسم الطرق والتربة', description='اختبارات الطرق والتربة')
        d2 = Domain(name='قسم الخرسانة', description='اختبارات الخرسانة')
        d3 = Domain(name='قسم الأسفلت', description='اختبارات الأسفلت')
        db.session.add_all([d1, d2, d3])
        db.session.flush()

        t1 = Test(name='اختبار الدمك', domain_id=d1.id,
                  config_schema=json.dumps({
                      'inputs': [
                          {'name': 'عدد_الضربات', 'label': 'عدد الضربات المستهدفة', 'type': 'number'},
                          {'name': 'حجم_القالب', 'label': 'حجم القالب (م³)', 'type': 'number'},
                          {'name': 'وزن_مرجعي', 'label': 'الوزن المرجعي (كغ)', 'type': 'number'}
                      ]
                  }, ensure_ascii=False),
                  formulas=json.dumps({
                      'dry_density': '(weight - moisture_weight) / volume'
                  }, ensure_ascii=False))

        t2 = Test(name='اختبار تحديد الرطوبة', domain_id=d1.id,
                  config_schema=json.dumps({
                      'inputs': [
                          {'name': 'وزن_الأرض', 'label': 'وزن العينة الرطبة (كغ)', 'type': 'number'},
                          {'name': 'وزن_الجافة', 'label': 'وزن العينة الجافة (كغ)', 'type': 'number'}
                      ]
                  }, ensure_ascii=False),
                  formulas=json.dumps({
                      'moisture_content': '((wet - dry) / dry) * 100'
                  }, ensure_ascii=False))

        t3 = Test(name='اختبار الانضباط', domain_id=d2.id,
                  config_schema=json.dumps({
                      'inputs': [
                          {'name': 'مقاس_الكبسولة', 'label': 'مقاس الكبسولة (مم)', 'type': 'number'},
                          {'name': 'عمر_الخرسانة', 'label': 'عمر الخرسانة (يوم)', 'type': 'number'}
                      ]
                  }, ensure_ascii=False),
                  formulas=json.dumps({}))

        t4 = Test(name='اختبار الانساب', domain_id=d3.id,
                  config_schema=json.dumps({
                      'inputs': [
                          {'name': 'درجة_الانساب', 'label': 'درجة الانساب المطلوبة', 'type': 'number'}
                      ]
                  }, ensure_ascii=False),
                  formulas=json.dumps({}))

        db.session.add_all([t1, t2, t3, t4])
        db.session.commit()


with app.app_context():
    db.create_all()
    seed_data()


@app.route('/')
def login():
    domains = Domain.query.all()
    return render_template('login.html', domains=domains)


@app.route('/dashboard/<int:domain_id>')
def dashboard(domain_id):
    domain = Domain.query.get_or_404(domain_id)
    tests = Test.query.filter_by(domain_id=domain_id).all()
    all_domains = Domain.query.all()
    return render_template('dashboard.html', domain=domain, tests=tests, all_domains=all_domains)


@app.route('/test/<int:test_id>')
def test_page(test_id):
    test = Test.query.get_or_404(test_id)
    return render_template('test_setup.html', test=test)


@app.route('/api/com-ports', methods=['GET'])
def get_com_ports():
    ports = serial.tools.list_ports.comports()
    return jsonify([{'device': p.device, 'description': p.description} for p in ports])


@app.route('/api/test/start', methods=['POST'])
def start_test():
    data = request.json
    if not data:
        return jsonify({'error': 'لا توجد بيانات'}), 400

    test_id = data.get('test_id')
    engineer_inputs = data.get('engineer_inputs')
    com_port = data.get('com_port')

    test = Test.query.get(test_id)
    if not test:
        return jsonify({'error': 'اختبار غير موجود'}), 404

    session = TestSession(
        test_id=test_id,
        domain_id=test.domain_id,
        engineer_inputs=json.dumps(engineer_inputs or {}, ensure_ascii=False)
    )
    db.session.add(session)
    db.session.commit()

    ser = None
    sensor_data = {}
    try:
        if com_port:
            ser = serial.Serial(com_port, 9600, timeout=5)
            ser.write(b'READ\n')
            line = ser.readline().decode().strip()
            if line:
                sensor_values = line.split(',')
                sensor_data = {
                    'moisture_percentage': float(sensor_values[0]) if len(sensor_values) > 0 else 0,
                    'impact_force': float(sensor_values[1]) if len(sensor_values) > 1 else 0
                }
    except Exception as e:
        sensor_data = {'moisture_percentage': 0, 'impact_force': 0, '_serial_error': str(e)}
    finally:
        if ser and ser.is_open:
            ser.close()

    session.sensor_data = json.dumps(sensor_data, ensure_ascii=False)
    results = calculate_results(test, engineer_inputs or {}, sensor_data)
    session.results = json.dumps(results, ensure_ascii=False)
    db.session.commit()

    return jsonify({'sensor_data': sensor_data, 'results': results, 'session_id': session.id})


@app.route('/api/sessions/<int:test_id>', methods=['GET'])
def get_sessions(test_id):
    sessions = TestSession.query.filter_by(test_id=test_id).order_by(TestSession.created_at.desc()).all()
    result = []
    for s in sessions:
        result.append({
            'id': s.id,
            'created_at': s.created_at.strftime('%Y-%m-%d %H:%M'),
            'results': json.loads(s.results) if s.results else {},
            'sensor_data': json.loads(s.sensor_data) if s.sensor_data else {}
        })
    return jsonify(result)


def calculate_results(test, engineer_inputs, sensor_data):
    if 'error' in sensor_data and sensor_data.get('moisture_percentage', 0) == 0:
        return {'error': 'تعذّر الاتصال بالمستشعر: ' + sensor_data.get('_serial_error', 'غير معروف')}

    if test.name == 'اختبار الدمك':
        try:
            mold_volume = float(engineer_inputs.get('حجم_القالب', 1) or 1)
            reference_weight = float(engineer_inputs.get('وزن_مرجعي', 0) or 0)

            moisture_pct = float(sensor_data.get('moisture_percentage', 0) or 0)
            impact_force = float(sensor_data.get('impact_force', 0) or 0)

            moisture_weight = (moisture_pct / 100) * reference_weight
            dry_weight = reference_weight - moisture_weight
            dry_density = dry_weight / mold_volume if mold_volume > 0 else 0

            return {
                'moisture_percentage': round(moisture_pct, 2),
                'moisture_weight': round(moisture_weight, 4),
                'dry_density': round(dry_density, 4),
                'impact_force': round(impact_force, 2),
                'max_dry_density': round(dry_density, 4),
                'optimum_moisture': round(moisture_pct, 2),
                'status': 'ناجح' if dry_density > 0 else 'فاشل'
            }
        except Exception as e:
            return {'error': str(e)}

    if test.name == 'اختبار تحديد الرطوبة':
        try:
            wet = float(engineer_inputs.get('وزن_الأرض', 0) or 0)
            dry = float(engineer_inputs.get('وزن_الجافة', 0) or 1)
            moisture_sensor = float(sensor_data.get('moisture_percentage', 0) or 0)
            calculated = ((wet - dry) / dry) * 100 if dry > 0 else 0
            return {
                'calculated_moisture': round(calculated, 2),
                'sensor_moisture': round(moisture_sensor, 2),
                'difference': round(abs(calculated - moisture_sensor), 2),
                'status': 'ناجح' if abs(calculated - moisture_sensor) < 2 else 'يتطلب مراجعة'
            }
        except Exception as e:
            return {'error': str(e)}

    return {'raw_data': sensor_data}


@app.route('/api/report/<int:session_id>')
def generate_report(session_id):
    try:
        from weasyprint import HTML
    except ImportError:
        return make_response('weasyprint not installed', 500)

    test_session = TestSession.query.get_or_404(session_id)
    test = Test.query.get(test_session.test_id)
    domain = Domain.query.get(test_session.domain_id)

    config_schema = json.loads(test.config_schema) if test and test.config_schema else {}
    engineer_inputs = json.loads(test_session.engineer_inputs) if test_session.engineer_inputs else {}
    sensor_data = json.loads(test_session.sensor_data) if test_session.sensor_data else {}
    results = json.loads(test_session.results) if test_session.results else {}

    result_labels = {
        'moisture_percentage': 'نسبة الرطوبة %',
        'moisture_weight': 'وزن الرطوبة (كغ)',
        'dry_density': 'الكثافة الجافة (كغ/م³)',
        'impact_force': 'قوة الاصطدام (N)',
        'max_dry_density': 'أقصى كثافة جافة (كغ/م³)',
        'optimum_moisture': 'نسبة الرطوبة المثلى %',
        'calculated_moisture': 'الرطوبة المحسوبة %',
        'sensor_moisture': 'رطوبة المستشعر %',
        'difference': 'الفرق'
    }

    html_content = render_template('report_template.html',
                                   test=test,
                                   domain=domain,
                                   config_schema=config_schema,
                                   engineer_inputs=engineer_inputs,
                                   sensor_data=sensor_data,
                                   results=results,
                                   result_labels=result_labels,
                                   created_at=test_session.created_at.strftime('%Y-%m-%d %H:%M:%S'))

    report_path = os.path.join(app.config['REPORTS_FOLDER'], f'report_{session_id}.pdf')
    os.makedirs(app.config['REPORTS_FOLDER'], exist_ok=True)
    HTML(string=html_content).write_pdf(report_path)

    return send_file(report_path, as_attachment=True,
                     download_name=f'report_{session_id}.pdf',
                     mimetype='application/pdf')


@app.route('/api/domain/add', methods=['POST'])
def add_domain():
    data = request.json
    if not data or not data.get('name', '').strip():
        return jsonify({'error': 'اسم القسم مطلوب'}), 400

    name = data['name'].strip()
    if Domain.query.filter_by(name=name).first():
        return jsonify({'error': 'القسم موجود بالفعل'}), 409

    new_domain = Domain(name=name, description=data.get('description', ''))
    db.session.add(new_domain)
    db.session.commit()
    return jsonify({'id': new_domain.id, 'name': new_domain.name})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
