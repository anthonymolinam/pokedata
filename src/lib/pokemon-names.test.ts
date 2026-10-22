import { test } from "node:test";
import assert from "node:assert/strict";
import { FORM_LABELS } from "@/constants/formNames";
import {
  formatFormName,
  formatPokemonSlugName,
  formatVariantLabel,
  formatVarietyLabel,
} from "@/lib/pokemon-names";

const spanish = (name: string, species: string) =>
  formatVariantLabel(formatVarietyLabel(name, species), true);

test("las formas de Rotom llevan su nombre oficial en español", () => {
  const forms = ["heat", "wash", "frost", "fan", "mow"].map((f) => spanish(`rotom-${f}`, "rotom"));
  assert.deepEqual(forms, ["Calor", "Lavado", "Frío", "Ventilador", "Corte"]);
  assert.equal(formatVarietyLabel("rotom-wash", "rotom"), "Wash");
});

test("el slug entero gana al sufijo compartido (Crepuscular, Hielo)", () => {
  assert.equal(spanish("lycanroc-dusk", "lycanroc"), "Forma Crepuscular");
  assert.equal(spanish("necrozma-dusk", "necrozma"), "Melena Crepuscular");
  assert.equal(spanish("eiscue-ice", "eiscue"), "Cara de Hielo");
  assert.equal(spanish("calyrex-ice", "calyrex"), "Jinete Glacial");
});

test("cada etiqueta en inglés tiene un solo nombre en español", () => {
  const seen = new Map<string, string>();
  for (const [en, es] of Object.values(FORM_LABELS)) {
    const key = en.toLowerCase();
    assert.equal(seen.get(key) ?? es, es, `"${en}" se traduce de dos maneras`);
    seen.set(key, es);
  }
});

test("la forma base y las regionales conservan sus nombres", () => {
  assert.equal(spanish("rotom", "rotom"), "Forma base");
  assert.deepEqual(formatFormName("Alola", true), { short: "Alola", full: "Forma de Alola" });
  assert.deepEqual(formatFormName("Wash", true), { short: "Lavado", full: "Lavado" });
  assert.deepEqual(formatFormName("Wash", false), { short: "Wash", full: "Wash" });
});

test("el título de una forma lleva su nombre en el idioma de la página", () => {
  assert.equal(formatPokemonSlugName("rotom-wash", "es"), "Rotom (Lavado)");
  assert.equal(formatPokemonSlugName("rotom-wash", "en"), "Rotom (Wash)");
  assert.equal(formatPokemonSlugName("necrozma-dusk", "es"), "Necrozma (Melena Crepuscular)");
  assert.equal(formatPokemonSlugName("mr-mime-galar", "en"), "Mr. Mime (Galar)");
  assert.equal(formatPokemonSlugName("great-tusk", "es"), "Colmilargo");
});
