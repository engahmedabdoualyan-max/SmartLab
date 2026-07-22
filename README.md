# SmartLAP v1.0.0

**نظام أتمتة المختبرات الهندسية الذكي**

> Dynamic Lab Automation System — by Fimto Soft

## الميزات

- بوابة دخول ذكية متعددة الأقسام (الطرق والخرسانة والأسفلت)
- لوحة تحكم مرنة مع إمكانية إضافة أقسام جديدة مستقبلاً
- واجهة اختبار تفاعلية مع ربط مباشر بمنافذ COM Ports
- قراءة بيانات المستشعرات في الوقت الفعلي
- محرك معالجة حسابية للمعادلات الهندسية
- إصدار تقارير PDF مطبوعة جاهزة
- دعم Firebase للمزامنة السحابية

## التشغيل

```bash
pip install -r requirements.txt
python server/app.py
```

الموقع متاح على: `http://localhost:5000`

## البنية

```
smartLAP/
├── server/app.py           # Flask Backend
├── templates/
│   ├── login.html          # بوابة الدخول
│   ├── dashboard.html      # لوحة التحكم
│   ├── test_setup.html     # واجهة الاختبار
│   └── report_template.html # قالب التقرير
├── static/
│   ├── css/style.css       # التصميم
│   └── js/firebase-config.js # Firebase
├── reports/                # التقارير المُنشأة
├── database/               # قاعدة البيانات
└── requirements.txt
```

## الترخيص

© 2026 Fimto Soft — Integrated Tech Solutions
