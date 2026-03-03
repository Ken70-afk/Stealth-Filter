import { NextResponse } from "next/server";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import * as cheerio from "cheerio";
import { Listing } from "@/components/ListingCard";

export const dynamic = "force-dynamic";

// Add stealth plugin to puppeteeer
puppeteer.use(StealthPlugin());

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const locRaw = searchParams.get("loc") || "Toronto";

    if (!query) {
        return NextResponse.json(
            { error: "Query parameter 'q' is required" },
            { status: 400 }
        );
    }

    let citySlug = locRaw.toLowerCase().replace(/[^a-z0-9\-]/g, "");
    if (!citySlug) citySlug = "toronto"; // fallback

    // We send EXACTLY what the user types to the scraper query logic
    // exact=true forces Facebook's backend to strictly respect the keyword, otherwise it injects "Results from outside your search"
    const targetUrl = `https://www.facebook.com/marketplace/${citySlug}/search/?query=${encodeURIComponent(query)}&exact=true`;

    let browser;
    try {
        console.log(`[Scraper] Launching stealth browser to search: ${query}`);

        // Launch browser in headless mode
        browser = await puppeteer.launch({
            headless: true, // Use headless component
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-blink-features=AutomationControlled",
            ],
        });

        const page = await browser.newPage();

        // Set a realistic viewport and User-Agent just in case
        await page.setViewport({ width: 1366, height: 768 });
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        );

        console.log(`[Scraper] Navigating to ${targetUrl}`);
        // Go to facebook marketplace and wait for network to be idle
        await page.goto(targetUrl, {
            waitUntil: "networkidle2",
            timeout: 30000,
        });

        // We wait for the marketplace grid to load. FB usually loads listings into role="article" or specific divs.
        // However, since FB DOM changes frequently, the best initial approach is to grab the full HTML once JS renders
        // and parse it carefully with Cheerio. We'll add a short hard-wait to let dynamic images load.
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Scroll down to potentially trigger lazy loads
        await page.evaluate(() => {
            window.scrollBy(0, 1000); // Scroll down one full height
        });
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Scroll again to ensure we load enough items for our 60-cap limit
        await page.evaluate(() => {
            window.scrollBy(0, 1000);
        });
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const content = await page.content();

        // Strict Radius Enforcement: Facebook routinely ignores the radius targeting and injects 
        // nationwide results at the bottom of the page. We physically severe the HTML DOM string 
        // right at their injection divider to guarantee strict local radius filtering!
        const strictContent = content.split("Results from outside your search")[0];

        const $ = cheerio.load(strictContent);

        // Parsing Strategy: Facebook obfucsates class names heavily (e.g. "x1hl2dhg x1lku1pv"). 
        // They often use ARIA roles or specific structural elements to render listings.
        // Generally, an item card is an anchor tag containing an image. We will look for <a> tags with hrefs pointing to /marketplace/item/

        const listings: Listing[] = [];

        const items = $("a[href*='/marketplace/item/']");
        console.log(`[Scraper] Found ${items.length} potential listing links in DOM.`);

        // Keep track of IDs to avoid duplicates (desktop FB sometimes renders duplicate nodes for wrappers)
        const seenIds = new Set<string>();

        items.each((_, el) => {
            // Limit to 60 results to provide a large enough pool for frontend hard-filtering
            if (listings.length >= 60) return;

            const $el = $(el);
            const url = $el.attr("href") || "";

            // Extract the Item ID from the URL (e.g. /marketplace/item/123456789/)
            const idMatch = url.match(/item\/(\d+)\/?/);
            const id = idMatch ? idMatch[1] : `temp-${Math.random()}`;

            if (seenIds.has(id)) return;
            seenIds.add(id);

            // To extract data from obfuscated DOM, we'll try to find text content within the anchor.
            // Usually, FB puts the price as the first strong/bold text, and the title as the span right after.
            // Easiest heuristic when classes are hidden:
            // - Images are <img> tags
            // - Price usually contains a '$'

            const imgTag = $el.find("img").first();
            const imageSrc = imgTag.attr("src") || "";

            // If we don't have an image, it's probably not the main card layout
            if (!imageSrc || imageSrc.includes("data:image")) return;

            // Extract raw text
            const rawText = $el.text();

            // Split text by lines/blocks realistically or use regex to grab price
            const priceMatch = rawText.match(/\$([\d,]+)/);
            const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ""), 10) : 0;

            // The title is harder to reliably isolate purely via text without seeing the exact DOM at request time.
            // Often, the title is the text inside a span just below the price, or the alt text of the image.
            // We'll prioritize the image alt text if available, as FB often sets it to the listing title.
            let title = imgTag.attr("alt") || "";

            if (!title) {
                // Fallback: Just grab the longest string segment that isn't the price or location
                title = "Unknown Item (See Link)";
            }

            // Parse out the real location from the FB title string (e.g. "Macbook Air in Toronto, ON")
            let location = locRaw; // Fallback to searched city
            const inMatch = title.match(/ in (.+?)$/i);
            if (inMatch && inMatch[1]) {
                location = inMatch[1].trim();
                // Clean the title to remove the redundant " in Location" suffix
                title = title.replace(/ in .+?$/i, "").trim();
            }

            if (price > 0 && title !== "Unknown Item (See Link)") {
                listings.push({
                    id,
                    title,
                    price,
                    image: imageSrc,
                    location,
                    distance: "Local",
                    condition: "Used",
                    timeListed: "Recently", // We could infer from URL or text data if available
                });
            }
        });

        console.log(`[Scraper] Successfully parsed ${listings.length} valid listings.`);

        return NextResponse.json({ listings });

    } catch (error) {
        console.error("[Scraper] Error during scraping:", error);
        return NextResponse.json(
            { error: "Failed to scrape marketplace data. Ensure Puppeteer can run." },
            { status: 500 }
        );
    } finally {
        if (browser) {
            await browser.close();
            console.log("[Scraper] Browser closed.");
        }
    }
}
