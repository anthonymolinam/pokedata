"use client";

import Link from "next/link";
import Image from "next/image";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 min-h-[calc(100dvh-140px)] flex flex-col items-center justify-center text-center px-4 py-8">
      <div className="relative flex flex-col items-center max-w-lg my-auto">
        <div className="absolute -top-12 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* 404 with Psyduck */}
        <div className="relative mb-6">
          <span className="text-8xl sm:text-9xl font-black tracking-tighter text-zinc-800/80 font-mono select-none block">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-36 h-36 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
              <Image
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png"
                alt="Confused Psyduck"
                fill
                priority
                sizes="144px"
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Headings & Descriptions */}
        <div className="space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            SIGNAL_LOST_ERROR
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Psyduck is confused!
          </h1>
          <p className="text-zinc-400 text-sm max-w-sm mx-auto leading-relaxed">
            The Pokémon or page you are looking for does not exist in the
            PokéData database or vanished into the tall grass.
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-rose-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Home className="w-4 h-4" />
            Back to Pokédex
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
