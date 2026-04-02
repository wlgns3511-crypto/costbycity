import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCityData, getAllMetros } from "@/lib/db";
import { formatDollar, formatPctDiff, formatIndex } from "@/lib/format";

export const dynamicParams = false;
export const revalidate = false;

export function generateStaticParams() {
  return getAllMetros().slice(0, 300).map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = getCityData(slug);
  if (!data) return {};
  const diff = formatPctDiff(data.rpp.all || 100);
  return {
    title: `Costo de Vida en ${data.metro.short_name} (${data.year})`,
    description: `El costo de vida en ${data.metro.short_name} es ${diff} el promedio nacional. Vivienda, ingresos, alquiler y m&aacute;s.`,
    alternates: {
      canonical: `/es/cities/${slug}`,
      languages: { en: `/cities/${slug}`, es: `/es/cities/${slug}`, "x-default": `/cities/${slug}` },
    },
    openGraph: { url: `/es/cities/${slug}` },
  };
}

export default async function CityPageEs({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getCityData(slug);
  if (!data) notFound();

  const { metro, rpp, acs, year } = data;
  const rppAll = rpp.all || 100;

  return (
    <>
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/es/" className="hover:text-emerald-600">Inicio</a>
        {" > "}
        <span>{metro.short_name}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Costo de Vida en {metro.short_name}</h1>
      <p className="text-slate-500 mb-2">Datos de {year} de la Oficina de An&aacute;lisis Econ&oacute;mico</p>
      <p className="text-xs text-slate-400 mb-6">
        <a href={`/cities/${slug}`} className="text-blue-500 hover:underline">English version</a>
      </p>

      {/* Resumen principal */}
      <div className="bg-emerald-50 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-sm text-slate-500">&Iacute;ndice de Costo</div>
            <div className={`text-2xl font-bold ${rppAll > 100 ? "text-red-600" : "text-green-600"}`}>
              {formatIndex(rppAll)}
            </div>
            <div className="text-xs text-slate-400">{formatPctDiff(rppAll)} prom.</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">&Iacute;ndice de Vivienda</div>
            <div className="text-2xl font-bold">{rpp.housing ? formatIndex(rpp.housing) : "N/D"}</div>
          </div>
          {acs?.median_income && (
            <div>
              <div className="text-sm text-slate-500">Ingresos Medianos</div>
              <div className="text-2xl font-bold">{formatDollar(acs.median_income)}</div>
            </div>
          )}
          {acs?.median_rent && (
            <div>
              <div className="text-sm text-slate-500">Alquiler Mediano</div>
              <div className="text-2xl font-bold">{formatDollar(acs.median_rent)}/mes</div>
            </div>
          )}
        </div>
      </div>

      {/* Ingresos y Vivienda */}
      {acs && (
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-3">Ingresos y Vivienda</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {acs.median_income && (
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="text-sm text-slate-500">Ingreso Familiar Mediano</div>
                <div className="text-xl font-bold">{formatDollar(acs.median_income)}/a&ntilde;o</div>
              </div>
            )}
            {acs.median_home_value && (
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="text-sm text-slate-500">Valor Mediano de Vivienda</div>
                <div className="text-xl font-bold">{formatDollar(acs.median_home_value)}</div>
              </div>
            )}
            {acs.median_rent && (
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="text-sm text-slate-500">Alquiler Mensual Mediano</div>
                <div className="text-xl font-bold">{formatDollar(acs.median_rent)}/mes</div>
              </div>
            )}
            {acs.per_capita_income && (
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="text-sm text-slate-500">Ingreso Per C&aacute;pita</div>
                <div className="text-xl font-bold">{formatDollar(acs.per_capita_income)}/a&ntilde;o</div>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="mt-8 p-4 bg-slate-50 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-500 mb-2">Recursos Relacionados</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <a href="https://salarybycity.com" className="text-emerald-600 hover:underline">Salarios por Ciudad</a>
          <a href="https://fairrentwize.com" className="text-emerald-600 hover:underline">Alquileres Justos</a>
        </div>
      </section>
    </>
  );
}
