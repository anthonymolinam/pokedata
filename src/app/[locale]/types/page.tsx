import type { Metadata } from "next";
import InteractiveTypeChart from "@/components/types/InteractiveTypeChart";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === "es";

  return {
    title: isEs ? "Tabla de Tipos | PokéData" : "Type Chart | PokéData",
    description: isEs
      ? "Matriz completa de enfrentamientos elementales, debilidades y resistencias en Pokémon."
      : "Complete matrix of elemental matchups, weaknesses, and resistances in Pokémon.",
  };
}

export default async function TypesPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="min-h-[calc(100dvh-110px)] flex flex-col justify-start max-w-7xl mx-auto px-4 py-3">
      <InteractiveTypeChart locale={locale} />
    </div>
  );
}
