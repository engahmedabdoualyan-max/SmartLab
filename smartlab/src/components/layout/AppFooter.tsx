import Link from 'next/link';
import { Building2, MapPin, Phone, Mail, Globe, ShieldCheck, Cpu, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppFooter() {
  return (
    <footer className="bg-slab-card/95 border-t border-slab-border-glass py-12 px-4 text-slab-text-secondary text-sm relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold text-slab-text-primary mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-slab-accent-blue" />
              smart<span className="text-slab-accent-gold">LAB</span>
            </h3>
            <p className="text-slab-text-secondary leading-relaxed mb-4">
              منصة متكاملة لإدارة المختبرات الهندسية واختبارات الخرسانة والأسفلت والتربة
              مع دعم الأجهزة المؤتمتة والامتثال لمعايير ISO 17025.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slab-text-secondary">
                <MapPin className="h-4 w-4 text-slab-accent-gold" />
                <span>القاهرة، مصر</span>
              </div>
              <div className="flex items-center gap-2 text-slab-text-secondary">
                <Phone className="h-4 w-4 text-slab-accent-gold" />
                <span>+20 1XX XXX XXXX</span>
              </div>
              <div className="flex items-center gap-2 text-slab-text-secondary">
                <Mail className="h-4 w-4 text-slab-accent-gold" />
                <span>info@smartlab.example.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-slab-text-primary mb-4">روابط سريعة</h3>
            <nav className="space-y-2">
              <Link href="/dashboard" className="block text-slab-text-secondary hover:text-slab-accent-blue transition-colors">لوحة التحكم</Link>
              <Link href="/dashboard/tests" className="block text-slab-text-secondary hover:text-slab-accent-blue transition-colors">الاختبارات</Link>
              <Link href="/dashboard/projects" className="block text-slab-text-secondary hover:text-slab-accent-blue transition-colors">المشاريع</Link>
              <Link href="/dashboard/devices" className="block text-slab-text-secondary hover:text-slab-accent-blue transition-colors">الأجهزة</Link>
              <Link href="/dashboard/certificates" className="block text-slab-text-secondary hover:text-slab-accent-blue transition-colors">الشهادات</Link>
              <Link href="/dashboard/reports" className="block text-slab-text-secondary hover:text-slab-accent-blue transition-colors">التقارير</Link>
            </nav>
          </div>

          {/* Test Categories */}
          <div>
            <h3 className="text-lg font-bold text-slab-text-primary mb-4">أقسام الاختبارات</h3>
            <nav className="space-y-2">
              <Link href="/dashboard/tests?category=concrete" className="block text-slab-text-secondary hover:text-slab-accent-red transition-colors flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slab-accent-red" />
                الخرسانة
              </Link>
              <Link href="/dashboard/tests?category=asphalt" className="block text-slab-text-secondary hover:text-slab-accent-gold transition-colors flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slab-accent-gold" />
                الأسفلت
              </Link>
              <Link href="/dashboard/tests?category=soil" className="block text-slab-text-secondary hover:text-slab-accent-orange transition-colors flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slab-accent-orange" />
                التربة
              </Link>
              <Link href="/dashboard/tests?category=general" className="block text-slab-text-secondary hover:text-slab-accent-blue transition-colors flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slab-accent-blue" />
                اختبارات عامة
              </Link>
            </nav>
          </div>

          {/* Standards & Compliance */}
          <div>
            <h3 className="text-lg font-bold text-slab-text-primary mb-4">المعايير والامتثال</h3>
            <nav className="space-y-2">
              <Link href="/dashboard/standards" className="block text-slab-text-secondary hover:text-slab-accent-blue transition-colors flex items-center gap-2">
                <Globe className="h-4 w-4 text-slab-accent-emerald" />
                مكتبة المعايير (ASTM, AASHTO, BS, ECP)
              </Link>
              <Link href="/dashboard/iso17025" className="block text-slab-text-secondary hover:text-slab-accent-blue transition-colors flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slab-accent-emerald" />
                الامتثال لـ ISO/IEC 17025
              </Link>
              <Link href="/dashboard/calibration" className="block text-slab-text-secondary hover:text-slab-accent-blue transition-colors flex items-center gap-2">
                <Cpu className="h-4 w-4 text-slab-accent-cyan" />
                معايرة الأجهزة
              </Link>
              <Link href="/dashboard/competency" className="block text-slab-text-secondary hover:text-slab-accent-blue transition-colors flex items-center gap-2">
                <User className="h-4 w-4 text-slab-accent-purple" />
                كفاءة الفنيين
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-slab-border-glass mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slab-text-muted text-sm text-center md:text-right">
            © {new Date().getFullYear()} smartLAB. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-6 text-slab-text-muted text-sm">
            <Link href="/privacy" className="hover:text-slab-accent-blue transition-colors">سياسة الخصوصية</Link>
            <Link href="/terms" className="hover:text-slab-accent-blue transition-colors">شروط الاستخدام</Link>
            <Link href="/cookies" className="hover:text-slab-accent-blue transition-colors">ملفات تعريف الارتباط</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}