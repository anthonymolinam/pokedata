export interface Generation {
  id: number;
  name: string;
  region: string;
  startId: number;
  endId: number;
}

export const GENERATIONS: Generation[] = [
  { id: 1, name: "Gen I", region: "Kanto", startId: 1, endId: 151 },
  { id: 2, name: "Gen II", region: "Johto", startId: 152, endId: 251 },
  { id: 3, name: "Gen III", region: "Hoenn", startId: 252, endId: 386 },
  { id: 4, name: "Gen IV", region: "Sinnoh", startId: 387, endId: 493 },
  { id: 5, name: "Gen V", region: "Teselia", startId: 494, endId: 649 },
  { id: 6, name: "Gen VI", region: "Kalos", startId: 650, endId: 721 },
  { id: 7, name: "Gen VII", region: "Alola", startId: 722, endId: 809 },
  { id: 8, name: "Gen VIII", region: "Galar", startId: 810, endId: 905 },
  { id: 9, name: "Gen IX", region: "Paldea", startId: 906, endId: 1025 },
];
