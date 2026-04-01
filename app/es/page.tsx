import type { Metadata } from "next";
import { getMostExpensiveCities, getCheapestCities, getAllCitiesWithRPP } from "@/lib/db";
import { formatIndex, formatPctDiffShort } from "@/lib/format";

export const metadata: Metadata = {
  title: "CostByCity - Costo de Vida por Ciudad en EE.UU.",
  description: "Compare el costo de vida en m&aacute;s de 380 ciudades de EE.UU. Vivienda, alquiler, ingresos y m&aacute;s. Datos de la Oficina de An&aacute;lisis Econ&oacute;mico.",
  alternates: {
    canonical: "/es/",
    languages: { en: "/", es: "/es/", "x-default": "/" },
  },
  openGraph: { url: "/es/" },
};

export default function HomeEs() {
  const expensive = getMostExpensiveCities(10);
  const cheapest = getCheapestCities(10);
  const allCities = getAllCitiesWithRPP();

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900 mb-4">
        Costo de Vida por Ciudad en EE.UU.
      </h1>
      <p className="text-slate-600 mb-2">
        Compare el costo de vida en m&aacute;s de {allCities.length} &aacute;reas metropolitanas.
        Vivienda, bienes, servicios p&uacute;blicos y m&aacute;s.
      </p>
      <p className="text-xs text-slate-400 mb-8">
        <a href="/" className="text-blue-500 hover:underline">English version</a>
      </p>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <section>
          <h2 className="text-xl font-bold mb-4 text-red-700">Ciudades M&aacute;s Caras</h2>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            {expensive.map((city, i) => (
              <a
                key={city.fips}
                href={`/es/cities/${city.slug}`}
                className="flex justify-between items-center p-3 hover:bg-slate-50 border-b border-slate-100"
              >
                <span className="text-sm">
                  <span className="text-slate-400 mr-2">{i + 1}.</span>
                  {city.short_name}
                </span>
                <span className="text-sm font-medium text-red-600">
                  {formatIndex(city.rpp_all)} ({formatPctDiffShort(city.rpp_all)})
                </span>
              </a>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-green-700">Ciudades M&aacute;s Econ&oacute;micas</h2>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            {cheapest.map((city, i) => (
              <a
                key={city.fips}
                href={`/es/cities/${city.slug}`}
                className="flex justify-between items-center p-3 hover:bg-slate-50 border-b border-slate-100"
              >
                <span className="text-sm">
                  <span className="text-slate-400 mr-2">{i + 1}.</span>
                  {city.short_name}
                </span>
                <span className="text-sm font-medium text-green-600">
                  {formatIndex(city.rpp_all)} ({formatPctDiffShort(city.rpp_all)})
                </span>
              </a>
            ))}
          </div>
        </section>
      </div>

      <section>
        <h2 className="text-xl font-bold mb-4">Todas las Ciudades</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {allCities.slice(0, 60).map((city) => (
            <a
              key={city.fips}
              href={`/es/cities/${city.slug}`}
              className="p-3 border border-slate-200 rounded-lg hover:border-emerald-300 hover:shadow-sm transition-all text-center"
            >
              <div className="font-medium text-sm">{city.short_name}</div>
              <div className="text-xs text-slate-500 mt-1">&Iacute;ndice: {formatIndex(city.rpp_all)}</div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
