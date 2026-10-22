// Nombres de las formas (DESIGN.md §3): la etiqueta en inglés y su nombre
// oficial en español, por el sufijo del slug de PokéAPI («rotom-wash» →
// «wash») o, cuando el sufijo solo no basta, por el slug entero («necrozma-
// dusk» no es la «Forma Crepuscular» de Lycanroc). Los nombres en español
// salen de los form_names de PokéAPI; los que faltan allí, de los juegos.
// Lo que no está aquí se formatea a partir del slug y queda en inglés.

type FormLabel = readonly [en: string, es: string];

export const FORM_LABELS: Record<string, FormLabel> = {
  // Regionales: el nombre completo («Forma de Alola») va en pokemon-names.ts
  alola: ["Alola", "Alola"],
  galar: ["Galar", "Galar"],
  hisui: ["Hisui", "Hisui"],
  paldea: ["Paldea", "Paldea"],
  "galar-standard": ["Galar", "Galar"],
  "galar-zen": ["Galar (Zen Mode)", "Galar (Modo Daruma)"],
  "paldea-combat-breed": ["Paldea (Combat Breed)", "Paldea (Raza Combatiente)"],
  "paldea-blaze-breed": ["Paldea (Blaze Breed)", "Paldea (Raza Ardiente)"],
  "paldea-aqua-breed": ["Paldea (Aqua Breed)", "Paldea (Raza Acuática)"],

  // Megaevoluciones, Gigamax y regresión primigenia
  mega: ["Mega", "Mega"],
  "mega-x": ["Mega X", "Mega X"],
  "mega-y": ["Mega Y", "Mega Y"],
  "mega-z": ["Mega Z", "Mega Z"],
  "male-mega": ["Mega (Male)", "Mega (Macho)"],
  "female-mega": ["Mega (Female)", "Mega (Hembra)"],
  "original-mega": ["Mega (Original Color)", "Mega (Color Vetusto)"],
  "curly-mega": ["Mega (Curly)", "Mega (Curvada)"],
  "droopy-mega": ["Mega (Droopy)", "Mega (Lánguida)"],
  "stretchy-mega": ["Mega (Stretchy)", "Mega (Estirada)"],
  gmax: ["Gigantamax", "Gigamax"],
  "amped-gmax": ["Gigantamax", "Gigamax"],
  "low-key-gmax": ["Low Key Gigantamax", "Grave Gigamax"],
  "single-strike-gmax": ["Gigantamax", "Gigamax"],
  "rapid-strike-gmax": ["Rapid Strike Gigantamax", "Fluido Gigamax"],
  primal: ["Primal", "Primigenio"],
  eternamax: ["Eternamax", "Dinamax Infinito"],

  // Pokémon dominantes (Sol y Luna)
  totem: ["Totem", "Dominante"],
  "totem-alola": ["Totem (Alola)", "Dominante (Alola)"],
  "totem-disguised": ["Totem (Disguised)", "Dominante (Encubierta)"],
  "totem-busted": ["Totem (Busted)", "Dominante (Descubierta)"],

  // Pikachu y Eevee
  "rock-star": ["Rock Star", "Roquera"],
  belle: ["Belle", "Aristócrata"],
  "pop-star": ["Pop Star", "Superstar"],
  phd: ["PhD", "Erudita"],
  libre: ["Libre", "Enmascarada"],
  cosplay: ["Cosplay", "Coqueta"],
  "original-cap": ["Original Cap", "Gorra Original"],
  "hoenn-cap": ["Hoenn Cap", "Gorra Hoenn"],
  "sinnoh-cap": ["Sinnoh Cap", "Gorra Sinnoh"],
  "unova-cap": ["Unova Cap", "Gorra Teselia"],
  "kalos-cap": ["Kalos Cap", "Gorra Kalos"],
  "alola-cap": ["Alola Cap", "Gorra Alola"],
  "partner-cap": ["Partner Cap", "Gorra Compañero"],
  "world-cap": ["World Cap", "Gorra Trotamundos"],
  starter: ["Partner", "Compañero"],

  // Castform
  sunny: ["Sunny Form", "Forma Sol"],
  rainy: ["Rainy Form", "Forma Lluvia"],
  snowy: ["Snowy Form", "Forma Nieve"],

  // Deoxys
  normal: ["Normal Forme", "Forma Normal"],
  attack: ["Attack Forme", "Forma Ataque"],
  defense: ["Defense Forme", "Forma Defensa"],
  speed: ["Speed Forme", "Forma Velocidad"],

  // Wormadam
  plant: ["Plant Cloak", "Tronco Planta"],
  sandy: ["Sandy Cloak", "Tronco Arena"],
  trash: ["Trash Cloak", "Tronco Basura"],

  // Rotom
  heat: ["Heat", "Calor"],
  wash: ["Wash", "Lavado"],
  frost: ["Frost", "Frío"],
  fan: ["Fan", "Ventilador"],
  mow: ["Mow", "Corte"],

  // Dialga, Palkia, Giratina y los genios
  origin: ["Origin Forme", "Forma Origen"],
  altered: ["Altered Forme", "Forma Modificada"],
  incarnate: ["Incarnate Forme", "Forma Avatar"],
  therian: ["Therian Forme", "Forma Tótem"],

  // Shaymin
  land: ["Land Forme", "Forma Tierra"],
  sky: ["Sky Forme", "Forma Cielo"],

  // Basculin
  "red-striped": ["Red-Striped Form", "Forma Raya Roja"],
  "blue-striped": ["Blue-Striped Form", "Forma Raya Azul"],
  "white-striped": ["White-Striped Form", "Forma Raya Blanca"],

  // Darmanitan
  standard: ["Standard Mode", "Modo Normal"],
  zen: ["Zen Mode", "Modo Daruma"],

  // Kyurem, Keldeo y Meloetta
  black: ["Black", "Negro"],
  white: ["White", "Blanco"],
  ordinary: ["Ordinary Form", "Forma Habitual"],
  resolute: ["Resolute Form", "Forma Brío"],
  aria: ["Aria Forme", "Forma Lírica"],
  pirouette: ["Pirouette Forme", "Forma Danza"],

  // Greninja, Floette y Hoopa
  "battle-bond": ["Battle Bond", "Fuerte Afecto"],
  ash: ["Ash-Greninja", "Ash-Greninja"],
  eternal: ["Eternal Flower", "Flor Eterna"],
  unbound: ["Unbound", "Desatado"],

  // Sexo (Meowstic, Indeedee, Basculegion, Oinkologne, Pyroar)
  male: ["Male", "Macho"],
  female: ["Female", "Hembra"],

  // Aegislash
  shield: ["Shield Forme", "Forma Escudo"],
  blade: ["Blade Forme", "Forma Filo"],

  // Pumpkaboo y Gourgeist
  average: ["Average Size", "Tamaño Normal"],
  small: ["Small Size", "Tamaño Pequeño"],
  large: ["Large Size", "Tamaño Grande"],
  super: ["Super Size", "Tamaño Extragrande"],

  // Zygarde
  "50": ["50% Forme", "Forma 50%"],
  "10": ["10% Forme", "Forma 10%"],
  "50-power-construct": ["50% (Power Construct)", "50% (Agrupamiento)"],
  "10-power-construct": ["10% (Power Construct)", "10% (Agrupamiento)"],
  complete: ["Complete Forme", "Forma Completa"],

  // Oricorio
  baile: ["Baile Style", "Estilo Apasionado"],
  "pom-pom": ["Pom-Pom Style", "Estilo Animado"],
  pau: ["Pa'u Style", "Estilo Plácido"],
  sensu: ["Sensu Style", "Estilo Refinado"],

  // Rockruff y Lycanroc
  "own-tempo": ["Own Tempo", "Ritmo Propio"],
  midday: ["Midday Form", "Forma Diurna"],
  midnight: ["Midnight Form", "Forma Nocturna"],
  "lycanroc-dusk": ["Dusk Form", "Forma Crepuscular"],

  // Wishiwashi y Mimikyu
  solo: ["Solo Form", "Forma Individual"],
  school: ["School Form", "Forma Banco"],
  disguised: ["Disguised Form", "Forma Encubierta"],
  busted: ["Busted Form", "Forma Descubierta"],

  // Minior: la forma meteorito (una por color) y el núcleo
  "red-meteor": ["Meteor Form", "Forma Meteorito"],
  "orange-meteor": ["Orange Meteor", "Meteorito Naranja"],
  "yellow-meteor": ["Yellow Meteor", "Meteorito Amarillo"],
  "green-meteor": ["Green Meteor", "Meteorito Verde"],
  "blue-meteor": ["Blue Meteor", "Meteorito Azul"],
  "indigo-meteor": ["Indigo Meteor", "Meteorito Añil"],
  "violet-meteor": ["Violet Meteor", "Meteorito Violeta"],
  "minior-red": ["Red Core", "Núcleo Rojo"],
  "minior-orange": ["Orange Core", "Núcleo Naranja"],
  "minior-yellow": ["Yellow Core", "Núcleo Amarillo"],
  "minior-green": ["Green Core", "Núcleo Verde"],
  "minior-blue": ["Blue Core", "Núcleo Azul"],
  "minior-indigo": ["Indigo Core", "Núcleo Añil"],
  "minior-violet": ["Violet Core", "Núcleo Violeta"],

  // Necrozma
  "necrozma-dusk": ["Dusk Mane", "Melena Crepuscular"],
  "necrozma-dawn": ["Dawn Wings", "Alas del Alba"],
  ultra: ["Ultra", "Ultra"],

  // Magearna
  original: ["Original Color", "Color Vetusto"],

  // Galar
  gulping: ["Gulping Form", "Forma Tragatodo"],
  gorging: ["Gorging Form", "Forma Engulletodo"],
  amped: ["Amped Form", "Forma Aguda"],
  "low-key": ["Low Key Form", "Forma Grave"],
  "eiscue-ice": ["Ice Face", "Cara de Hielo"],
  noice: ["Noice Face", "Cara Deshielo"],
  "full-belly": ["Full Belly Mode", "Forma Saciada"],
  hangry: ["Hangry Mode", "Forma Voraz"],
  "zacian-crowned": ["Crowned Sword", "Espada Suprema"],
  "zamazenta-crowned": ["Crowned Shield", "Escudo Supremo"],
  "single-strike": ["Single Strike Style", "Estilo Brusco"],
  "rapid-strike": ["Rapid Strike Style", "Estilo Fluido"],
  dada: ["Dada", "Papá"],
  "calyrex-ice": ["Ice Rider", "Jinete Glacial"],
  "calyrex-shadow": ["Shadow Rider", "Jinete Espectral"],
  bloodmoon: ["Bloodmoon", "Luna Carmesí"],

  // Paldea
  "family-of-four": ["Family of Four", "Familia de Cuatro"],
  "family-of-three": ["Family of Three", "Familia de Tres"],
  "green-plumage": ["Green Plumage", "Plumaje Verde"],
  "blue-plumage": ["Blue Plumage", "Plumaje Azul"],
  "yellow-plumage": ["Yellow Plumage", "Plumaje Amarillo"],
  "white-plumage": ["White Plumage", "Plumaje Blanco"],
  zero: ["Zero Form", "Forma Ingenua"],
  hero: ["Hero Form", "Forma Heroica"],
  curly: ["Curly Form", "Forma Curvada"],
  droopy: ["Droopy Form", "Forma Lánguida"],
  stretchy: ["Stretchy Form", "Forma Estirada"],
  "two-segment": ["Two-Segment Form", "Forma Binodular"],
  "three-segment": ["Three-Segment Form", "Forma Trinodular"],
  roaming: ["Roaming Form", "Forma Andante"],
  "limited-build": ["Limited Build", "Forma Limitada"],
  "sprinting-build": ["Sprinting Build", "Forma Carrera"],
  "swimming-build": ["Swimming Build", "Forma Nado"],
  "gliding-build": ["Gliding Build", "Forma Planeo"],
  "low-power-mode": ["Low-Power Mode", "Modo Limitado"],
  "drive-mode": ["Drive Mode", "Modo Conducción"],
  "aquatic-mode": ["Aquatic Mode", "Modo Flotación"],
  "glide-mode": ["Glide Mode", "Modo Planeo"],
  "wellspring-mask": ["Wellspring Mask", "Máscara Fuente"],
  "hearthflame-mask": ["Hearthflame Mask", "Máscara Horno"],
  "cornerstone-mask": ["Cornerstone Mask", "Máscara Cimiento"],
  terastal: ["Terastal Form", "Forma Teracristal"],
  stellar: ["Stellar Form", "Forma Astral"],
};
