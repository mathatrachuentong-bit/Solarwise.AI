import {
  LocationPreset,
  BuildingConfig,
  SolarConfig,
  FinancialConfig,
  SolarCalculationResult,
} from '../types/solar';
import { Language } from '../i18n/translations';

interface ConsultantSummaryParams {
  location: LocationPreset;
  building: BuildingConfig;
  solar: SolarConfig;
  financial: FinancialConfig;
  metrics: SolarCalculationResult;
  language: Language;
}

/**
 * Generates a customer-friendly, conversational solar consultant briefing.
 * Formatted as clean, natural text suitable for:
 * 1. A sales consultant reading aloud during a customer walkthrough.
 * 2. Future text-to-speech integration (e.g., ElevenLabs) as a clean string value.
 */
export function generateConsultantSummaryText({
  location,
  building,
  solar,
  financial,
  metrics,
  language,
}: ConsultantSummaryParams): string {
  const cap = solar.systemCapacityKwp.toFixed(1);
  const panelCount = solar.panelCount;
  const panelWatt = solar.panelWattage;
  const prodKwh = Math.round(metrics.annualProductionKwh).toLocaleString();
  const savingsThb = Math.round(metrics.annualSavingsThb).toLocaleString();
  const monthlySavings = Math.round(metrics.annualSavingsThb / 12).toLocaleString();
  const installCostThb = Math.round(financial.installationCostThb).toLocaleString();
  const payback = metrics.simplePaybackYears;
  const selfConsPct = financial.selfConsumptionPercent;
  const tariff = financial.electricityTariffThb.toFixed(2);
  const lifetimeSavingsThb = Math.round(metrics.lifetimeSavingsThb).toLocaleString();
  const roofDesc = building.roofType === 'gable' ? 'หลังคาทรงจั่ว' : 'ดาดฟ้าเรียบ';
  const roofDescEn = building.roofType === 'gable' ? 'pitched gable roof' : 'flat rooftop deck';

  if (language === 'th') {
    // Conversational, professional Thai spoken by an expert solar consultant
    const introParagraph = `สวัสดีครับ จากการวิเคราะห์พื้นที่เบื้องต้นสำหรับอาคารในเขต ${location.name} ซึ่งมีสภาพแสงแดดเฉลี่ยที่ ${location.avgDailyIrradiation} กิโลวัตต์-ชั่วโมงต่อตารางเมตรต่อวัน ตัวอาคารมีลักษณะเป็น${roofDesc} ขนาดประมาณ ${building.width} คูณ ${building.length} เมตร เราขอแนะนำการติดตั้งระบบโซลาร์เซลล์ขนาดกำลังผลิต ${cap} กิโลวัตต์ (kWp) ซึ่งประกอบด้วยแผงโซลาร์ประสิทธิภาพสูงขนาด ${panelWatt} วัตต์ จำนวน ${panelCount} แผง วางรับแสงอาทิตย์อย่างเหมาะสม`;

    const yieldParagraph = `ระบบขนาด ${cap} kWp ชุดนี้ จะสามารถผลิตกระแสไฟฟ้าสะอาดได้ประมาณ ${prodKwh} หน่วย (kWh) ต่อปี โดยคำนวณจากพฤติกรรมการใช้ไฟฟ้าในเวลากลางวันของท่านที่ประมาณ ${selfConsPct}% ภายใต้อัตราค่าไฟฟ้าปัจจุบันที่ ${tariff} บาทต่อหน่วย ระบบนี้จะช่วยลดภาระค่าไฟฟ้าในบ้านของท่านได้ประมาณ ${savingsThb} บาทต่อปี หรือเฉลี่ยประหยัดได้ราวเดือนละ ${monthlySavings} บาทครับ`;

    let paybackParagraph = '';
    if (metrics.annualSavingsThb > 0 && payback > 0) {
      paybackParagraph = `สำหรับงบประมาณการลงทุนติดตั้งครบวงจรอยู่ที่ประมาณ ${installCostThb} บาท เมื่อเทียบกับเงินค่าไฟที่ท่านประหยัดได้ในแต่ละเดือน จะมีระยะเวลาคืนทุนโดยประมาณอยู่ที่ ${payback} ปี และหลังจากจุดคุ้มทุนแล้ว ระบบจะยังคงผลิตกระแสไฟฟ้าสร้างผลตอบแทนสะสมตลอดอายุการใช้งาน 25 ปี คิดเป็นมูลค่ารวมกว่า ${lifetimeSavingsThb} บาท`;
    } else {
      paybackParagraph = `สำหรับงบประมาณการลงทุนติดตั้งอยู่ที่ประมาณ ${installCostThb} บาท ทั้งนี้เนื่องจากสัดส่วนการใช้ไฟเวลากลางวันถูกตั้งไว้ในระดับต่ำ ระยะเวลาคืนทุนจึงขึ้นอยู่กับการปรับพฤติกรรมการเปิดใช้เครื่องใช้ไฟฟ้าในช่วงที่มีแสงแดดเป็นสำคัญ`;
    }

    const surveyAndDisclaimerParagraph = `อย่างไรก็ดี ข้อมูลทั้งหมดในรายงานฉบับนี้เป็นการคำนวณและจำลองผลเบื้องต้นจากข้อมูลสาธิตและมิติอาคารโดยประมาณ ยังมิใช่การการันตีตัวเลขแน่นอน เพื่อความปลอดภัยสูงสุดและประสิทธิภาพที่แท้จริง เราขอแนะนำให้นัดหมายทีมวิศวกรเข้าสำรวจสภาพหน้างานจริง เพื่อตรวจสอบความแข็งแรงของโครงสร้างหลังคา ทิศทางเงาตกกระทบ และระบบตู้เมนไฟฟ้าก่อนการตัดสินใจติดตั้งจริงครับ`;

    return `${introParagraph}\n\n${yieldParagraph}\n\n${paybackParagraph}\n\n${surveyAndDisclaimerParagraph}`;
  } else {
    // Fluent, conversational English spoken by an expert solar consultant
    const introParagraph = `Hello, and welcome to your solar assessment. Based on our preliminary site analysis for your property in ${location.name}, which benefits from an average solar window of ${location.avgDailyIrradiation} kWh per square meter per day, we have modeled your ${building.width} by ${building.length} meter building with its ${roofDescEn}. We propose a high-efficiency rooftop system with a capacity of ${cap} kWp, utilizing ${panelCount} Tier-1 panels rated at ${panelWatt} watts each, positioned to maximize direct tropical solar exposure.`;

    const yieldParagraph = `This ${cap} kWp array is estimated to generate approximately ${prodKwh} kWh of clean solar electricity each year. Assuming a daytime self-consumption rate of ${selfConsPct}% at your current electricity tariff of ฿${tariff} per kWh, the system will save you approximately ฿${savingsThb} per year on your electric bills—which translates into a predictable monthly bill reduction of around ฿${monthlySavings}.`;

    let paybackParagraph = '';
    if (metrics.annualSavingsThb > 0 && payback > 0) {
      paybackParagraph = `With an estimated turnkey installation investment of ฿${installCostThb}, your direct electricity bill savings are projected to fully recover this initial cost in approximately ${payback} years. Beyond that simple payback horizon, the system will continue generating clean electricity over its 25-year operational lifespan, producing an estimated cumulative benefit exceeding ฿${lifetimeSavingsThb}.`;
    } else {
      paybackParagraph = `With an estimated turnkey installation cost of ฿${installCostThb}, achieving an optimal financial payback will depend on shifting daytime electrical loads—such as air conditioning and pool pumps—to peak solar production hours.`;
    }

    const surveyAndDisclaimerParagraph = `Please note that this document provides a preliminary techno-economic estimate based on demonstration regional irradiance figures and assumed building dimensions. It does not constitute a certified structural guarantee or guaranteed financial return. Prior to finalizing contracts, we strongly recommend scheduling an on-site physical survey so our engineering team can inspect the roof structure, verify electrical service panels, and confirm millimeter measurements.`;

    return `${introParagraph}\n\n${yieldParagraph}\n\n${paybackParagraph}\n\n${surveyAndDisclaimerParagraph}`;
  }
}
