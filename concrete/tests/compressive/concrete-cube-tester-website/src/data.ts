import loadCellImg from "./assets/images/load-cell.jpg";
import hx711Img from "./assets/images/hx711.jpg";
import arduinoImg from "./assets/images/arduino-uno.jpg";
import lcdImg from "./assets/images/lcd-i2c.jpg";
import buttonImg from "./assets/images/push-button.jpg";
import buzzerImg from "./assets/images/buzzer.jpg";
import psuImg from "./assets/images/power-supply.jpg";
import pressImg from "./assets/images/hydraulic-press.jpg";
import crushImg from "./assets/images/crush-hero.jpg";

export { crushImg };

/** أسماء المنتجات الإنجليزية ثابتة في كل اللغات */
export const COMP_META = [
  { num: "01", name: "Industrial Compression Load Cell", img: loadCellImg },
  { num: "02", name: "HX711 Load Cell Amplifier", img: hx711Img },
  { num: "03", name: "Arduino Uno R3", img: arduinoImg },
  { num: "04", name: "LCD 16x2 I2C", img: lcdImg },
  { num: "05", name: "Push Button", img: buttonImg },
  { num: "06", name: "Active Buzzer 5V", img: buzzerImg },
  { num: "07", name: "Power Supply 5V", img: psuImg },
  { num: "08", name: "Hydraulic Press", img: pressImg },
];

/** عناوين لاتينية ثابتة أسفل عناوين الأقسام */
export const SEC_EN = {
  idea: "How it works",
  components: "Bill of materials",
  wiring: "Wiring guide",
  mechanical: "Mechanical assembly",
  math: "Engineering calculations",
  models: "Two firmware models",
  calibration: "Calibration procedure",
  safety: "Safety",
};

/** ألوان أسلاك خلية الحمل في الجدول الأول */
export const CELL_CHIPS = ["#e03131", "#212529", "#2f9e44", "#9aa3ab"];

/** ألوان مفتاح الأسلاك في المخطط */
export const WIRE_KEY_COLORS = [
  "#e03131",
  "#343a40",
  "#2f9e44",
  "#8b959e",
  "#d9a406",
  "#7048e8",
  "#1c7ed6",
  "#0ca678",
  "#f08c00",
  "#e8590c",
];

/** قيم الأرقام في شريط الإحصاءات */
export const HERO_STATS = [
  { v: "22,500", u: "mm²" },
  { v: "24", u: "bit" },
  { v: "50", u: "Ton" },
  { v: "0.044", u: "MPa/kN" },
];

/** ملخص الأطراف في صفحة الفيرم وير */
export const PIN_VALUES = ["D3", "D2", "D4 ← GND", "D5", "A4", "A5", "5V + GND"];
