import { NextResponse } from "next/server";
import { getAllPokemonIndex, searchPokemonGlobal } from "@/lib/pokeapi";

// Normalizes text: removes hyphens, periods, extra spaces, and accents
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, ""); // leave only continuous alphanumeric characters
}

// Optimized Levenshtein distance for typo tolerance
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Calculates match score (higher score = better match)
function calculateMatchScore(queryNorm: string, targetName: string): number {
  const targetNorm = normalizeString(targetName);

  // 1. Exact or identical match without symbols (e.g. "mrmime" === "mrmime")
  if (queryNorm === targetNorm) return 1000;

  // 2. Starts with search (e.g. "pika" -> "pikachu")
  if (targetNorm.startsWith(queryNorm))
    return 500 - (targetNorm.length - queryNorm.length);

  // 3. Contains the full substring (e.g. "mime" -> "mrmime", "mimejr")
  if (targetNorm.includes(queryNorm))
    return 300 - (targetNorm.length - queryNorm.length);

  // 4. Fuzzy matching for typos ("pikashu", "charizad")
  // Only apply fuzzy if the search has at least 3 characters
  if (queryNorm.length >= 3) {
    const dist = levenshteinDistance(queryNorm, targetNorm);

    // Allow 1 error in medium words, up to 2 errors in long words
    const maxAllowedErrors = queryNorm.length > 5 ? 2 : 1;

    if (dist <= maxAllowedErrors) {
      return 100 - dist * 20;
    }

    // Check if it fuzzy matches any subword (e.g. "jr" or "mime")
    const parts = targetName.split("-").map(normalizeString);
    for (const part of parts) {
      if (part.length >= 3) {
        const partDist = levenshteinDistance(queryNorm, part);
        if (partDist <= 1) {
          return 80 - partDist * 10;
        }
      }
    }
  }

  return -1; // No match
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const rawQuery = q.trim();

  if (!rawQuery) {
    return NextResponse.json({ results: [], totalMatches: 0 });
  }

  const allPokemon = await getAllPokemonIndex();
  const queryNorm = normalizeString(rawQuery);

  // Check if search is a number (Pokédex ID)
  const isNumeric = /^\d+$/.test(rawQuery.replace(/^#/, ""));
  const numericId = isNumeric ? parseInt(rawQuery.replace(/^#/, ""), 10) : null;

  let rankedMatches: { id: number; name: string; score: number }[] = [];

  if (numericId !== null) {
    // If searching for a numeric ID, find exact and partial ID matches
    rankedMatches = allPokemon
      .filter((p) => String(p.id).includes(String(numericId)))
      .map((p) => ({
        id: p.id,
        name: p.name,
        score: p.id === numericId ? 2000 : 1000 - Math.abs(p.id - numericId),
      }));
  } else {
    // Intelligent text search
    for (const p of allPokemon) {
      const score = calculateMatchScore(queryNorm, p.name);
      if (score > 0) {
        rankedMatches.push({ id: p.id, name: p.name, score });
      }
    }
  }

  // Sort by relevance (highest score first)
  rankedMatches.sort((a, b) => b.score - a.score);

  // Get visual details of the best results (max 24 for speed)
  const topMatches = rankedMatches.slice(0, 24);
  const results = await searchPokemonGlobal(topMatches);

  return NextResponse.json({
    results,
    totalMatches: rankedMatches.length,
  });
}
