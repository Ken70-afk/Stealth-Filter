"use client";

import { useState, useMemo } from "react";
import { Listing, ListingCard } from "@/components/ListingCard";
import { FilterPanel, FilterState } from "@/components/FilterPanel";
import { SlidersHorizontal, Search, Loader2 } from "lucide-react";

export default function Home() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("Toronto");
  const [isSearching, setIsSearching] = useState(false);
  const [rawScrapedData, setRawScrapedData] = useState<Listing[]>([]);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState<FilterState>({
    minPrice: "",
    maxPrice: "",
    mustIncludeWord: "",
    excludeWord: "",
  });

  const performScrape = async (overrideLocation?: string) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError("");
    setRawScrapedData([]); // Clear old results immediately so filters don't mistakenly operate on stale data during the new scrape.

    const loc = overrideLocation !== undefined ? overrideLocation : searchLocation;

    try {
      const res = await fetch(
        `/api/scrape?q=${encodeURIComponent(searchQuery)}&loc=${encodeURIComponent(loc)}`,
        { cache: 'no-store' } // Ensure the browser never caches this
      );
      if (!res.ok) {
        let errorMessage = "Failed to fetch listings";
        try {
          const errData = await res.json();
          if (errData.error) errorMessage = errData.error;
        } catch (e) { }
        throw new Error(errorMessage);
      }
      const data = await res.json();
      setRawScrapedData(data.listings || []);
    } catch (err) {
      console.error(err);
      setError("An error occurred while scraping Facebook Marketplace. Check server logs.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await performScrape();
  };

  const filteredListings = useMemo(() => {
    return rawScrapedData.filter((item) => {
      // 1. Price Hard Filters
      if (filters.minPrice !== "" && item.price < Number(filters.minPrice)) return false;
      if (filters.maxPrice !== "" && item.price > Number(filters.maxPrice)) return false;

      // 2. Keyword Hard Filters (Must Include)
      if (filters.mustIncludeWord.trim() !== "") {
        const mustInclude = filters.mustIncludeWord.toLowerCase();
        if (!item.title.toLowerCase().includes(mustInclude)) return false;
      }

      // 3. Exclude Keyword (Trash Filter)
      if (filters.excludeWord.trim() !== "") {
        const exclude = filters.excludeWord.toLowerCase();
        if (item.title.toLowerCase().includes(exclude)) return false;
      }

      return true;
    });
  }, [filters, rawScrapedData]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-800 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="font-bold text-white tracking-tighter">SF</span>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Stealth Filter
            </h1>
          </div>
          <button
            className="lg:hidden flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-colors"
            onClick={() => setIsFilterOpen(true)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Feed Area */}
          <div className="flex-1 w-full order-2 lg:order-1 flex flex-col gap-6">

            {/* Search Bar & Location Controls */}
            <form onSubmit={handleSearch} className="flex flex-col gap-3">
              <div className="relative flex w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search Marketplace (e.g. MacBook, Honda Civic)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-32 text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium shadow-lg shadow-black/20"
                />
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Scrape"}
                </button>
              </div>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Near</span>
                  <input
                    type="text"
                    placeholder="e.g. Toronto, Agincourt"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onBlur={(e) => performScrape(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        performScrape(e.currentTarget.value);
                      }
                    }}
                    className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-16 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
              </div>
            </form>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500/90 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <h2 className="text-2xl font-bold tracking-tight">Marketplace Matches</h2>
              <span className="text-sm font-medium text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/5">
                {filteredListings.length} {filteredListings.length === 1 ? 'Result' : 'Results'}
              </span>
            </div>

            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-24 px-4 text-center glass-card rounded-3xl border-dashed border-2 border-white/10 animate-pulse">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <h3 className="text-xl font-semibold mb-2">Deploying Stealth Scraper...</h3>
                <p className="text-muted-foreground max-w-md">
                  Puppeteer is currently navigating Facebook Marketplace and bypassing bot protection. This takes about 5-10 seconds.
                </p>
              </div>
            ) : filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 px-4 text-center glass-card rounded-3xl border-dashed border-2 border-white/10">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-5">
                  <SlidersHorizontal className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {rawScrapedData.length === 0 ? "No data scraped yet" : "No perfect matches found"}
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {rawScrapedData.length === 0
                    ? "Enter a query above to dispatch the stealth puppeteer scraper to Facebook Marketplace."
                    : "Your hard filters are too restrictive. Try adjusting the price range or removing some keywords to see more results."}
                </p>
              </div>
            )}
          </div>

          {/* Desktop Filter Panel & Mobile Drawer */}
          <div className="w-full lg:w-80 order-1 lg:order-2 shrink-0">
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              isOpen={isFilterOpen}
              setIsOpen={setIsFilterOpen}
              totalResults={filteredListings.length}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
