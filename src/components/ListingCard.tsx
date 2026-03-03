import { MapPin, Clock } from "lucide-react";

export interface Listing {
    id: string;
    title: string;
    price: number;
    image: string;
    location: string;
    distance: string;
    condition: string;
    timeListed: string;
}

interface ListingCardProps {
    listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
    return (
        <a
            href={`https://www.facebook.com/marketplace/item/${listing.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-primary/20 hover:border-primary/50 cursor-pointer group flex flex-col h-full animate-in fade-in zoom-in-95 duration-500 block"
        >
            <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={listing.image}
                    alt={listing.title}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full border border-white/20 shadow-sm">
                        {listing.condition}
                    </span>
                </div>
            </div>
            <div className="p-4 sm:p-5 flex flex-col flex-grow">
                <h3 className="font-semibold text-base sm:text-lg text-foreground line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">
                    {listing.title}
                </h3>
                <p className="text-xl sm:text-2xl font-bold text-foreground mb-4">${listing.price.toLocaleString()}</p>

                <div className="mt-auto space-y-2 text-xs sm:text-sm text-muted-foreground font-medium">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary/70 shrink-0" />
                        <span className="truncate">{listing.location} ({listing.distance})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary/70 shrink-0" />
                        <span>{listing.timeListed}</span>
                    </div>
                </div>
            </div>
        </a>
    );
}
