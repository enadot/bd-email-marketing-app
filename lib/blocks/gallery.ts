import { emailDocumentSchema, type EmailDocument } from "./schema";

// ─────────────────────────────────────────────────────────────
// Template gallery — professionally designed starting points,
// in the spirit of the react.email demo templates but RTL-first.
// Block ids only need to be unique within a document; the editor
// re-ids blocks on duplicate.
// ─────────────────────────────────────────────────────────────

export type GalleryTemplate = {
  slug: string;
  name: string;
  description: string;
  category: "פתיחה" | "שיווק" | "עדכונים" | "עסקאות";
  doc: EmailDocument;
};

function doc(input: unknown): EmailDocument {
  return emailDocumentSchema.parse(input);
}

export const GALLERY: GalleryTemplate[] = [
  {
    slug: "welcome",
    name: "ברוכים הבאים",
    description: "מייל אקטיבציה חם עם צעדים ראשונים וכפתור ברור",
    category: "פתיחה",
    doc: doc({
      settings: { brandColor: "#3b82f6", preheader: "איזה כיף שהצטרפת! הנה איך מתחילים" },
      blocks: [
        { id: "w1", type: "heading", text: "ברוך הבא, {{firstName}} 👋", level: 1, align: "right" },
        {
          id: "w2",
          type: "text",
          text: "איזה כיף שהצטרפת אלינו! החשבון שלך מוכן, ואפשר להתחיל תוך דקות.",
          align: "right",
        },
        {
          id: "w3",
          type: "list",
          items: ["השלם את הפרופיל שלך", "הגדר את ההעדפות", "צור את הפרויקט הראשון"],
          align: "right",
        },
        { id: "w4", type: "button", text: "הפעל את החשבון", url: "https://", align: "center" },
        { id: "w5", type: "divider" },
        {
          id: "w6",
          type: "text",
          text: "יש שאלות? פשוט השב למייל הזה — אנחנו כאן.",
          align: "right",
          fontSize: 14,
          color: "#71717a",
        },
      ],
    }),
  },
  {
    slug: "newsletter",
    name: "ניוזלטר",
    description: "עדכון תקופתי עם כותרות, תמונה וקישורים",
    category: "עדכונים",
    doc: doc({
      settings: { brandColor: "#0d9488", preheader: "מה חדש החודש — הסיפורים המרכזיים" },
      blocks: [
        { id: "n1", type: "heading", text: "העדכון החודשי 🗞️", level: 1, align: "right" },
        {
          id: "n2",
          type: "text",
          text: "שלום {{firstName}}, ריכזנו בשבילך את כל מה שקרה החודש.",
          align: "right",
        },
        {
          id: "n3",
          type: "image",
          src: "https://placehold.co/600x240/ccfbf1/0f766e?text=Story",
          alt: "הסיפור המרכזי",
          align: "center",
          borderRadius: 8,
        },
        { id: "n4", type: "heading", text: "הסיפור המרכזי", level: 2, align: "right" },
        {
          id: "n5",
          type: "text",
          text: "כמה מילים על העדכון הכי חשוב של החודש — מה השתנה ולמה זה מעניין אותך.",
          align: "right",
        },
        { id: "n6", type: "button", text: "לקריאה המלאה", url: "https://", align: "right" },
        { id: "n7", type: "divider" },
        { id: "n8", type: "heading", text: "בקצרה", level: 3, align: "right" },
        {
          id: "n9",
          type: "list",
          items: ["עדכון ראשון בשורה אחת", "עדכון שני בשורה אחת", "עדכון שלישי בשורה אחת"],
          align: "right",
        },
        {
          id: "n10",
          type: "social",
          links: [
            { network: "instagram", url: "https://instagram.com/" },
            { network: "linkedin", url: "https://linkedin.com/" },
            { network: "website", url: "https://" },
          ],
          align: "center",
        },
      ],
    }),
  },
  {
    slug: "promo",
    name: "מבצע",
    description: "קידום מכירות ממוקד עם קופון והדגשה",
    category: "שיווק",
    doc: doc({
      settings: {
        brandColor: "#e11d48",
        backgroundColor: "#fff1f2",
        preheader: "רק היום: הטבה מיוחדת בשבילך",
      },
      blocks: [
        { id: "p1", type: "heading", text: "מבצע מיוחד ל-48 שעות ⏰", level: 1, align: "center" },
        {
          id: "p2",
          type: "text",
          text: "{{firstName}}, ההטבה הזו נשמרה במיוחד בשבילך — אל תפספס.",
          align: "center",
        },
        {
          id: "p3",
          type: "callout",
          text: "20% הנחה על הכל עם קוד SAVE20",
          emoji: "🎁",
          backgroundColor: "#ffe4e6",
          textColor: "#be123c",
          align: "center",
        },
        { id: "p4", type: "button", text: "למימוש ההטבה", url: "https://", align: "center", fullWidth: true },
        {
          id: "p5",
          type: "text",
          text: "בתוקף עד סוף השבוע. לא ניתן לשלב עם הטבות נוספות.",
          align: "center",
          fontSize: 12,
          color: "#9f1239",
        },
      ],
    }),
  },
  {
    slug: "product-launch",
    name: "השקת מוצר",
    description: "הכרזה על פיצ׳ר או מוצר חדש עם תמונה גדולה",
    category: "שיווק",
    doc: doc({
      settings: { brandColor: "#7c3aed", preheader: "זה כאן: המוצר החדש שלנו יצא לדרך" },
      blocks: [
        {
          id: "l1",
          type: "image",
          src: "https://placehold.co/600x280/ede9fe/6d28d9?text=New",
          alt: "המוצר החדש",
          align: "center",
          borderRadius: 10,
        },
        { id: "l2", type: "heading", text: "משהו חדש יצא לדרך 🚀", level: 1, align: "center" },
        {
          id: "l3",
          type: "text",
          text: "אחרי חודשים של עבודה, אנחנו גאים להציג את הגרסה החדשה. הנה מה שמחכה לך:",
          align: "center",
        },
        {
          id: "l4",
          type: "list",
          items: ["יכולת חדשה ראשונה", "שיפור ביצועים משמעותי", "חוויית שימוש מחודשת"],
          align: "right",
        },
        { id: "l5", type: "button", text: "גלו את החידושים", url: "https://", align: "center" },
      ],
    }),
  },
  {
    slug: "event",
    name: "הזמנה לאירוע",
    description: "הזמנה אלגנטית עם פרטי אירוע ואישור הגעה",
    category: "שיווק",
    doc: doc({
      settings: {
        brandColor: "#ca8a04",
        backgroundColor: "#fefce8",
        preheader: "שריין את התאריך — אתה מוזמן",
      },
      blocks: [
        { id: "e1", type: "heading", text: "אתה מוזמן 🥂", level: 1, align: "center" },
        {
          id: "e2",
          type: "text",
          text: "{{firstName}}, נשמח לראות אותך באירוע הקרוב שלנו.",
          align: "center",
        },
        { id: "e3", type: "divider", color: "#fde047" },
        { id: "e4", type: "heading", text: "יום חמישי · 20:00 · תל אביב", level: 3, align: "center" },
        {
          id: "e5",
          type: "text",
          text: "ערב של תוכן, נטוורקינג והפתעות. מספר המקומות מוגבל.",
          align: "center",
        },
        { id: "e6", type: "divider", color: "#fde047" },
        { id: "e7", type: "button", text: "אישור הגעה", url: "https://", align: "center" },
        {
          id: "e8",
          type: "text",
          text: "לא רלוונטי? אפשר להעביר את ההזמנה לחבר.",
          align: "center",
          fontSize: 13,
          color: "#a16207",
        },
      ],
    }),
  },
  {
    slug: "receipt",
    name: "אישור הזמנה",
    description: "מייל עסקה נקי עם פירוט וסטטוס",
    category: "עסקאות",
    doc: doc({
      settings: { brandColor: "#16a34a", preheader: "ההזמנה שלך התקבלה ובדרך אליך" },
      blocks: [
        { id: "r1", type: "heading", text: "ההזמנה התקבלה ✅", level: 1, align: "right" },
        {
          id: "r2",
          type: "text",
          text: "תודה {{firstName}}! ההזמנה שלך בטיפול ותצא לדרך בקרוב.",
          align: "right",
        },
        {
          id: "r3",
          type: "callout",
          text: "מספר הזמנה: #12345 · צפי אספקה: 3-5 ימי עסקים",
          emoji: "📦",
          backgroundColor: "#f0fdf4",
          textColor: "#15803d",
          align: "right",
        },
        { id: "r4", type: "list", items: ["פריט ראשון — ₪120", "פריט שני — ₪80", 'סה"כ — ₪200'], align: "right" },
        { id: "r5", type: "button", text: "מעקב אחר ההזמנה", url: "https://", align: "center" },
        { id: "r6", type: "divider" },
        {
          id: "r7",
          type: "text",
          text: "שאלות על ההזמנה? השב למייל הזה ונחזור אליך במהירות.",
          align: "right",
          fontSize: 13,
          color: "#71717a",
        },
      ],
    }),
  },
  {
    slug: "winback",
    name: "החזרת לקוחות",
    description: "מייל Win-back אישי עם תמריץ לחזרה",
    category: "שיווק",
    doc: doc({
      settings: { brandColor: "#0284c7", preheader: "התגעגענו — יש לנו משהו בשבילך" },
      blocks: [
        { id: "b1", type: "heading", text: "התגעגענו אליך, {{firstName}} 💙", level: 1, align: "right" },
        {
          id: "b2",
          type: "text",
          text: "עבר קצת זמן מאז הביקור האחרון שלך. בינתיים הוספנו לא מעט דברים חדשים שנראה לנו שתאהב.",
          align: "right",
        },
        {
          id: "b3",
          type: "callout",
          text: "מתנת חזרה: חודש מתנה עם קוד COMEBACK",
          emoji: "🎉",
          backgroundColor: "#f0f9ff",
          textColor: "#0369a1",
          align: "right",
        },
        { id: "b4", type: "button", text: "חזרו לחשבון שלכם", url: "https://", align: "center" },
        {
          id: "b5",
          type: "text",
          text: "ההטבה בתוקף ל-7 ימים בלבד.",
          align: "center",
          fontSize: 13,
          color: "#71717a",
        },
      ],
    }),
  },
  {
    slug: "plain-letter",
    name: "מכתב אישי",
    description: "טקסט נקי בגובה העיניים — כאילו נכתב אישית",
    category: "פתיחה",
    doc: doc({
      settings: {
        brandColor: "#18181b",
        backgroundColor: "#ffffff",
        preheader: "כמה מילים אישיות ממני אליך",
      },
      blocks: [
        { id: "s1", type: "text", text: "היי {{firstName}},", align: "right" },
        {
          id: "s2",
          type: "text",
          text: "רציתי לכתוב לך אישית ולומר תודה שהצטרפת. אנחנו צוות קטן שמאמין בעבודה קרובה עם כל לקוח, ולכן כל פנייה מגיעה ישירות אלינו.",
          align: "right",
        },
        {
          id: "s3",
          type: "text",
          text: "אם יש משהו שאפשר לעזור בו — גדול או קטן — פשוט השב למייל הזה. אני עונה לכל אחד.",
          align: "right",
        },
        { id: "s4", type: "text", text: "שלך,\nהמייסד", align: "right" },
      ],
    }),
  },
];

export function getGalleryTemplate(slug: string): GalleryTemplate | undefined {
  return GALLERY.find((t) => t.slug === slug);
}
