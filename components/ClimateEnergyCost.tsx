import { coolingKwhFromCdd, getClimate, heatingKwhFromHdd } from '@/lib/climate-data';
import { getElectricityRate } from '@/lib/electricity-rates';

export function ClimateEnergyCost({ state, cityName }: { state: string; cityName: string }) {
  const climate = getClimate(state);
  const rate = getElectricityRate(state);
  if (!climate || !rate) {
    return (
      <p className="my-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        Energy cost estimate unavailable for state {state}.
      </p>
    );
  }
  const heatingKwh = Math.round(heatingKwhFromHdd(climate.hdd));
  const coolingKwh = Math.round(coolingKwhFromCdd(climate.cdd));
  const heatingCost = (heatingKwh * rate.residential) / 100;
  const coolingCost = (coolingKwh * rate.residential) / 100;
  const total = Math.round(heatingCost + coolingCost);

  const max = Math.max(heatingCost, coolingCost) || 1;

  return (
    <figure className="my-6 rounded-lg border border-slate-200 bg-white p-4" data-upgrade="climate-energy">
      <figcaption className="mb-3 text-sm font-semibold text-slate-700">
        HVAC energy cost estimate — {cityName}, {state}
      </figcaption>
      <div className="space-y-2.5 text-sm">
        <Row
          label="Heating"
          subLabel={`${climate.hdd.toLocaleString('en-US')} HDD × heat-pump COP 3.0`}
          kwh={heatingKwh}
          cost={heatingCost}
          color="#3b82f6"
          pct={(heatingCost / max) * 100}
        />
        <Row
          label="Cooling"
          subLabel={`${climate.cdd.toLocaleString('en-US')} CDD × SEER 14`}
          kwh={coolingKwh}
          cost={coolingCost}
          color="#f97316"
          pct={(coolingCost / max) * 100}
        />
      </div>
      <div className="mt-4 flex items-baseline justify-between border-t border-slate-200 pt-3">
        <span className="text-sm font-semibold text-slate-700">Annual HVAC total</span>
        <span className="font-mono text-lg font-bold text-slate-900">
          ${total.toLocaleString('en-US')}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Climate zone {climate.zone}. Residential rate {rate.residential.toFixed(2)}¢/kWh (EIA EIA-861M, Feb 2026). 2,000 sqft code-minimum envelope (HLC 500 BTU/hr-°F).
      </p>
    </figure>
  );
}

function Row({
  label,
  subLabel,
  kwh,
  cost,
  color,
  pct,
}: {
  label: string;
  subLabel: string;
  kwh: number;
  cost: number;
  color: string;
  pct: number;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
        <div>
          <span className="font-semibold text-slate-700">{label}</span>
          <span className="ml-2 text-slate-500">{subLabel}</span>
        </div>
        <div className="font-mono text-slate-700">
          {kwh.toLocaleString('en-US')} kWh · ${cost.toFixed(0)}
        </div>
      </div>
      <div className="h-3 rounded bg-slate-100">
        <div className="h-full rounded" style={{ width: `${Math.max(2, pct)}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
