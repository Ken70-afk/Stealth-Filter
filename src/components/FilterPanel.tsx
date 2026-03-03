"use client";

import { X, SlidersHorizontal, Search } from "lucide-react";
import { useState } from "react";

export interface FilterState {
    minPrice: number | "";
    maxPrice: number | "";
    mustIncludeWord: string;
    excludeWord: string;
}

interface FilterPanelProps {
    filters: FilterState;
    setFilters: (f: FilterState) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    totalResults: number;
}

export function FilterPanel({ filters, setFilters, isOpen, setIsOpen, totalResults }: FilterPanelProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters({
            ...filters,
            [name]: name.includes("Price") ? (value === "" ? "" : Number(value)) : value,
        });
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Panel */}
            <div className={`
        fixed lg:sticky top-0 lg:top-6 right-0 h-full lg:h-fit min-h-[calc(100vh-3rem)] w-[85vw] max-w-sm lg:w-80 
        glass-card border-l lg:border border-white/10 z-50 lg:z-10 transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isOpen ? "translate-x-0" : "translate-x-full"}
        flex flex-col lg:rounded-3xl overflow-hidden
      `}>
                <div className="flex items-center justify-between p-5 border-b border-white/5 bg-black/20">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5 text-primary" />
                        <h2 className="font-semibold text-lg">Hard Filters</h2>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 lg:hidden rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto flex-1 space-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground/80 flex justify-between">
                            Price Range
                        </label>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                <input
                                    type="number"
                                    name="minPrice"
                                    value={filters.minPrice}
                                    onChange={handleChange}
                                    placeholder="Min"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                                />
                            </div>
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                <input
                                    type="number"
                                    name="maxPrice"
                                    value={filters.maxPrice}
                                    onChange={handleChange}
                                    placeholder="Max"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground/80">Must Include Keyword</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                name="mustIncludeWord"
                                value={filters.mustIncludeWord}
                                onChange={handleChange}
                                placeholder="e.g. 'Honda', 'MacBook'"
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground/80">Exclude Keyword (Trash)</label>
                        <div className="relative">
                            <X className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500/70" />
                            <input
                                type="text"
                                name="excludeWord"
                                value={filters.excludeWord}
                                onChange={handleChange}
                                placeholder="e.g. 'wanted', 'broken'"
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-medium"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Listings with these words will be permanently hidden.</p>
                    </div>
                </div>

                <div className="p-5 border-t border-white/5 bg-black/20">
                    <button
                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                        onClick={() => setIsOpen(false)}
                    >
                        Show {totalResults} Results
                    </button>
                </div>
            </div>
        </>
    );
}
