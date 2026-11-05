import { allTables, type PriceRow } from '@/data/pricingDataComplete';

export type PricingTranslate = (key: string, fallback: string) => string;

const pluralRules = new Map<string, Intl.PluralRules>();

function pricingTemplate(key: string, fallback: string, n: string, t: PricingTranslate, language: string): string {
  const base = t(`pricingPage.${key}`, fallback);
  let rules = pluralRules.get(language);
  if (!rules) {
    rules = new Intl.PluralRules(language);
    pluralRules.set(language, rules);
  }
  const category = rules.select(Number(n));
  const suffix = category[0].toUpperCase() + category.slice(1);
  return t(`pricingPage.${key}${suffix}`, base);
}

function fillPricingTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(n|km)\}/g, (placeholder, key: string) => values[key] ?? placeholder);
}

export function pricingTableTitle(tableId: string, t: PricingTranslate): string {
  const fallback = allTables.find((table) => table.id === tableId)?.title ?? tableId;
  return t(`pricingPage.${tableId}`, fallback);
}

/** Translate rental copy only; route names and every price field stay untouched. */
export function localizePricingRow(row: PriceRow, tableId: string, t: PricingTranslate, language: string): PriceRow {
  if (tableId !== 'hourly' && tableId !== 'period') return row;

  let distance = row.distance;
  let destination = row.destination;
  const duration = row.distance.match(/^(\d+) (Hrs|Day|Days)$/);
  if (duration) {
    const key = tableId === 'hourly' ? 'hourUnit' : 'dayUnit';
    distance = fillPricingTemplate(pricingTemplate(key, row.distance, duration[1], t, language), { n: duration[1] });
  }

  const hourly = tableId === 'hourly'
    ? row.destination.match(/^(\d+) Hours: Private Car Rental with Driver & Fuel \(Max (\d+) Km\.\)$/)
    : null;
  const daily = tableId === 'period'
    ? row.destination.match(/^(\d+) Day: Private Car Rental with Driver & Fuel \(Max (\d+) Km\.\/Day\)$/)
    : null;
  const rental = hourly ?? daily;
  if (rental) {
    const key = hourly ? 'rentalHourly' : 'rentalDaily';
    destination = fillPricingTemplate(pricingTemplate(key, row.destination, rental[1], t, language), {
      n: rental[1],
      km: rental[2],
    });
  }

  return { ...row, distance, destination };
}
