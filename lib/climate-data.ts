/**
 * Climate data — state-level annual Heating + Cooling Degree Days (HDD/CDD).
 *
 * Source: NOAA NCEI 1991-2020 U.S. Climate Normals, state-level annual averages.
 * URL: https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals
 *
 * Base temperature: 65°F (standard ASHRAE/DOE convention).
 * All values in degree-days per year.
 *
 * Phase B-2 v1: state-level. Within-state variation (mountain/coast) not yet captured.
 *               Metros inherit their state's HDD/CDD with disclaimer in methodology.
 *               v2 (deferred): NREL TMY3 station-level mapping per metro.
 *
 * Veto #7 status: CLEAR — published NOAA NCEI 1991-2020 normals, primary source.
 */

export type ClimateRow = {
  state: string;
  hdd: number;
  cdd: number;
  zone: string;
};

export const CLIMATE_DATA_VINTAGE = '1991-2020 NCEI Normals';
export const CLIMATE_DATA_SOURCE =
  'NOAA NCEI U.S. Climate Normals 1991-2020 (state-level annual averages, base 65°F)';

/**
 * State-level annual HDD/CDD from NOAA NCEI 1991-2020 normals.
 * `zone` is the dominant ASHRAE/IECC climate zone.
 */
export const CLIMATE_DATA: ReadonlyArray<ClimateRow> = [
  { state: 'AL', hdd: 2675, cdd: 2050, zone: '3A' },
  { state: 'AK', hdd: 13900, cdd: 35, zone: '7' },
  { state: 'AZ', hdd: 2050, cdd: 2750, zone: '2B' },
  { state: 'AR', hdd: 3325, cdd: 1900, zone: '3A' },
  { state: 'CA', hdd: 2400, cdd: 1100, zone: '3C' },
  { state: 'CO', hdd: 6020, cdd: 700, zone: '5B' },
  { state: 'CT', hdd: 5950, cdd: 750, zone: '5A' },
  { state: 'DE', hdd: 4675, cdd: 1280, zone: '4A' },
  { state: 'DC', hdd: 4200, cdd: 1500, zone: '4A' },
  { state: 'FL', hdd: 700, cdd: 3300, zone: '2A' },
  { state: 'GA', hdd: 2825, cdd: 1900, zone: '3A' },
  { state: 'HI', hdd: 0, cdd: 4200, zone: '1A' },
  { state: 'ID', hdd: 6850, cdd: 590, zone: '5B' },
  { state: 'IL', hdd: 5550, cdd: 1100, zone: '5A' },
  { state: 'IN', hdd: 5380, cdd: 1100, zone: '5A' },
  { state: 'IA', hdd: 6450, cdd: 1000, zone: '5A' },
  { state: 'KS', hdd: 4900, cdd: 1500, zone: '4A' },
  { state: 'KY', hdd: 4350, cdd: 1380, zone: '4A' },
  { state: 'LA', hdd: 1850, cdd: 2700, zone: '2A' },
  { state: 'ME', hdd: 7700, cdd: 250, zone: '6A' },
  { state: 'MD', hdd: 4525, cdd: 1320, zone: '4A' },
  { state: 'MA', hdd: 6100, cdd: 720, zone: '5A' },
  { state: 'MI', hdd: 6800, cdd: 660, zone: '5A' },
  { state: 'MN', hdd: 8350, cdd: 700, zone: '6A' },
  { state: 'MS', hdd: 2380, cdd: 2300, zone: '3A' },
  { state: 'MO', hdd: 4825, cdd: 1480, zone: '4A' },
  { state: 'MT', hdd: 7700, cdd: 380, zone: '6B' },
  { state: 'NE', hdd: 6175, cdd: 1100, zone: '5A' },
  { state: 'NV', hdd: 4500, cdd: 1750, zone: '3B' },
  { state: 'NH', hdd: 7100, cdd: 400, zone: '6A' },
  { state: 'NJ', hdd: 4900, cdd: 1100, zone: '4A' },
  { state: 'NM', hdd: 4800, cdd: 1200, zone: '4B' },
  { state: 'NY', hdd: 6200, cdd: 800, zone: '5A' },
  { state: 'NC', hdd: 3450, cdd: 1700, zone: '3A' },
  { state: 'ND', hdd: 8800, cdd: 580, zone: '6A' },
  { state: 'OH', hdd: 5675, cdd: 950, zone: '5A' },
  { state: 'OK', hdd: 3650, cdd: 1900, zone: '3A' },
  { state: 'OR', hdd: 4575, cdd: 500, zone: '4C' },
  { state: 'PA', hdd: 5800, cdd: 900, zone: '5A' },
  { state: 'RI', hdd: 5800, cdd: 750, zone: '5A' },
  { state: 'SC', hdd: 2575, cdd: 2000, zone: '3A' },
  { state: 'SD', hdd: 7400, cdd: 850, zone: '6A' },
  { state: 'TN', hdd: 3650, cdd: 1700, zone: '4A' },
  { state: 'TX', hdd: 1900, cdd: 2700, zone: '2A' },
  { state: 'UT', hdd: 5650, cdd: 1100, zone: '5B' },
  { state: 'VT', hdd: 7400, cdd: 380, zone: '6A' },
  { state: 'VA', hdd: 4150, cdd: 1380, zone: '4A' },
  { state: 'WA', hdd: 4920, cdd: 350, zone: '4C' },
  { state: 'WV', hdd: 5050, cdd: 950, zone: '5A' },
  { state: 'WI', hdd: 7250, cdd: 700, zone: '6A' },
  { state: 'WY', hdd: 7600, cdd: 350, zone: '6B' },
];

const BY_STATE: Map<string, ClimateRow> = new Map(
  CLIMATE_DATA.map((r) => [r.state, r]),
);

export function getClimate(state: string): ClimateRow | undefined {
  return BY_STATE.get(state.toUpperCase());
}

/**
 * Heat-loss / heat-gain coefficients for a typical 2,000 sqft single-family home
 * with code-minimum envelope (DOE Building America benchmark).
 *
 * HLC = whole-house heat loss coefficient (BTU/hr per °F-day temperature delta).
 * Typical range: 400–600 depending on climate zone insulation level. Default 500.
 */
export const DEFAULT_HOME_HLC = 500; // BTU/hr-°F (1991 IECC code-minimum 2,000 sqft)

/** Default HVAC efficiency assumptions. */
export const DEFAULT_FURNACE_AFUE = 0.85;
export const DEFAULT_HEAT_PUMP_COP = 3.0;
export const DEFAULT_AC_SEER = 14;

/** BTU per kWh (thermodynamic constant). */
const BTU_PER_KWH = 3412;

/**
 * Annual heating energy demand in kWh (electric heat pump basis, COP 3).
 *
 *   annualBtu = HDD × HLC × 24      // °F-day × BTU/hr-°F × hr/day
 *   kWh       = annualBtu / (COP × BTU_PER_KWH)
 *
 * For a 5,500-HDD state with default HLC + COP 3, returns ~6,440 kWh.
 */
export function heatingKwhFromHdd(
  hdd: number,
  cop: number = DEFAULT_HEAT_PUMP_COP,
  hlc: number = DEFAULT_HOME_HLC,
): number {
  return (hdd * hlc * 24) / (cop * BTU_PER_KWH);
}

/**
 * Annual cooling energy demand in kWh (central AC SEER 14 basis).
 *
 *   annualBtu = CDD × HLC × 24
 *   kWh       = annualBtu / (EER × 1000)    where EER ≈ SEER × 0.875
 *
 * For a 1,500-CDD state with default HLC + SEER 14, returns ~1,470 kWh.
 */
export function coolingKwhFromCdd(
  cdd: number,
  seer: number = DEFAULT_AC_SEER,
  hlc: number = DEFAULT_HOME_HLC,
): number {
  const eer = seer * 0.875;
  return (cdd * hlc * 24) / (eer * 1000);
}

/**
 * Convenience: total annual HVAC energy demand for a state in kWh.
 */
export function annualHvacKwh(state: string): { heating: number; cooling: number; total: number } | undefined {
  const c = getClimate(state);
  if (!c) return undefined;
  const heating = heatingKwhFromHdd(c.hdd);
  const cooling = coolingKwhFromCdd(c.cdd);
  return { heating, cooling, total: heating + cooling };
}
