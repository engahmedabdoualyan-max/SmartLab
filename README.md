**SmartLab v1.0.0**  
**نظام أتمتة المختبرات الهندسية الذكي**  
*Dynamic Lab Automation System — by Fimto Soft*  
**الميزات**  
- بوابة دخول ذكية متعددة الأقسام (الطرق والخرسانة والأسفلت)  
- لوحة تحكم مرنة مع إمكانية إضافة أقسام جديدة مستقبلاً  
- واجهة اختبار تفاعلية مع ربط مباشر بمنافذ COM Ports  
- قراءة بيانات المستشعرات في الوقت الفعلي  
- محرك معالجة حسابية للمعادلات الهندسية  
- إصدار تقارير PDF مطبوعة جاهزة  
- دعم Firebase للمزامنة السحابية  
**التشغيل**  
pip install -r requirements.txt  
 python server/app.py  
   
الموقع متاح على: http://localhost:5000  
**البنية**  
smartLAP/  
 ├── server/app.py           # Flask Backend  
 ├── templates/  
 │   ├── login.html          # بوابة الدخول  
 │   ├── dashboard.html      # لوحة التحكم  
 │   ├── test_setup.html     # واجهة الاختبار  
 │   └── report_template.html # قالب التقرير  
 ├── static/  
 │   ├── css/style.css       # التصميم  
 │   └── js/firebase-config.js # Firebase  
 ├── reports/                # التقارير المُنشأة  
 ├── database/               # قاعدة البيانات  
 └── requirements.txt  
   
**الترخيص**  
© 2026 Fimto Soft — Integrated Tech Solutions  
🔬 smartLAP - Laboratory Information Management System (LIMS)  
تطبيق متكامل لإدارة الجودة، حماية البيانات، ومعايرة المعدات في المختبرات البرمجية والهندسية.  
🛠️ المتطلبات الأساسية (Prerequisites)  
·Node.js (v16 أو أحدث)  
·npm (مدير الحزم)  
📦 التثبيت والتشغيل المحلي (Installation & Deployment)  
1.قم بتحميل المستودع ومجلد المشروع.  
2.افتح مبنى الأوامر (Terminal) وثبّت الحزم اللازمة:  
3.npm install express jsonwebtoken nodemailer  
4.لتشغيل خادم التطبيق محلياً:  
5.node run.js  
🔒 الميزات البرمجية المدمجة (Core Modules)  
1.نظام الصلاحيات (Security & RBAC): يدعم أدوار (Manager, Engineer, Viewer) مع تتبع العمليات الحساسة عبر الـ Audit Trail وحماية الـ CSRF والـ Session Timeout.  
2.أنظمة المعايرة والربط: محاكاة لنظام الـ LIMS API، وإرسال تنبيهات البريد الإلكتروني للمعدات منتهية الصلاحية.  
3.اختبارات الجودة (Quality Tests): يتضمن معادلات حسابية لـ 7 اختبارات جودة معتمدة:  
oPermeability (النفاذية)  
oFlexural Strength (مقاومة الانحناء)  
oSplit Tensile (الشد الانشطاري)  
oSoftening Point (نقطة الليونة)  
oViscosity (اللزوجة)  
oSpecific Gravity (الوزن النوعي)  
oWater Absorption (امتصاص الماء)  
   
