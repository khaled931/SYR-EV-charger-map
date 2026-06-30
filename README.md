# خريطة شواحن السيارات الكهربائية في سورية

تطبيق ويب ثابت وخفيف لعرض شواحن السيارات الكهربائية في سورية ضمن خريطة تفاعلية، مع فلاتر حسب المحافظة، نوع المقبس، الحالة، والبحث النصي.

## المزايا الحالية

- واجهة عربية RTL ومتوافقة مع الهاتف.
- خريطة تفاعلية باستخدام Leaflet وOpenStreetMap.
- ملف بيانات مستقل: `data/chargers.json`.
- فلاتر: بحث، محافظة، نوع المقبس، الحالة.
- إحصاءات مباشرة: عدد المحطات، العاملة، القدرة الموثقة، وعدد المحافظات.
- بطاقات تفصيلية لكل شاحن مع المصدر، تاريخ التحقق، وجودة البيانات.
- حالة فارغة آمنة عند عدم وجود بيانات، دون استخدام بيانات وهمية.

## بنية الملفات

```text
.
├── index.html
├── assets/
│   ├── app.js
│   └── styles.css
├── data/
│   ├── chargers.json
│   └── chargers.schema.json
└── vercel.json
```

## صيغة البيانات

يجب أن يكون ملف `data/chargers.json` عبارة عن مصفوفة JSON. مثال سجل واحد:

```json
[
  {
    "id": "damascus-001",
    "name_ar": "اسم محطة الشحن",
    "name_en": "Charging Station Name",
    "operator": "اسم المشغل",
    "governorate": "دمشق",
    "city": "دمشق",
    "address": "وصف الموقع",
    "latitude": 33.5138,
    "longitude": 36.2765,
    "connectors": ["CCS2"],
    "power_kw": 120,
    "guns": 2,
    "status": "operational",
    "access": "عام / خاص / غير محدد",
    "price_note": "غير متوفر",
    "source_name": "اسم المصدر",
    "source_url": "https://example.com/source",
    "source_date": "2026-06-30",
    "last_verified": "2026-06-30",
    "data_quality": "High Confidence",
    "notes": "أي ملاحظات مهمة"
  }
]
```

> ملاحظة: المثال أعلاه لغرض توضيح البنية فقط، وليس بيانات منشورة أو موثقة.

## قيم الحالة المعتمدة

| القيمة التقنية | العرض العربي |
|---|---|
| `operational` | عاملة |
| `partially_operational` | عاملة جزئياً |
| `planned` | مخططة |
| `under_construction` | قيد الإنشاء |
| `unavailable` | غير متاحة |
| `unknown` | غير معروف |

## قيم جودة البيانات

| القيمة | الاستخدام |
|---|---|
| `Verified` | مصدر رسمي أو تحقق مباشر |
| `High Confidence` | مصدر موثوق وأدلة متوافقة |
| `Medium Confidence` | مرجح ويحتاج تحقق إضافي |
| `Low Confidence` | مصدر واحد أو معلومات ناقصة |
| `Estimated` | تقديري وفق منهجية معلنة |
| `Unverified` | متداول وغير مؤكد |

## النشر على Vercel

1. Import Git Repository من Vercel.
2. اختر المستودع: `khaled931/SYR-EV-charger-map`.
3. Framework Preset: `Other`.
4. Build Command: اتركه فارغاً.
5. Output Directory: اتركه فارغاً.
6. اضغط Deploy.

## تحديث البيانات لاحقاً

عدّل فقط ملف:

```text
data/chargers.json
```

بعد كل تعديل ودمج على فرع `main` سيقوم Vercel بإعادة النشر تلقائياً إذا كان المستودع مربوطاً بالمشروع.
