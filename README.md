# Stealth Filter: Facebook Marketplace Scraper

A premium, privacy-focused, stealth scraper and hard-filtering interface for Facebook Marketplace.

Built to bypass Facebook's aggressive algorithm and unreliable internal search controls, Stealth Filter provides a sleek, glassmorphic UI to dispatch a headless anonymous browser directly to Facebook Marketplace. It strips out injected "Results from outside your search" and spam, allowing you to run strict, mathematical keyword and price filters client-side.

## Features

- **Anonymous Stealth Scraping**: Uses `puppeteer-extra-plugin-stealth` to bypass basic bot detections and rate limits.
- **True Hard Filtering**: Applies exact minimum/maximum price boundaries and keyword strictness (must-include/exclude) on the frontend.
- **Deep Loading**: Automatically scrolls deeply into Facebook's infinite-scroll DOM to extract up to 60 listings per search.
- **Wide Compatibility**: Confirmed to work perfectly in popular major cities across North America (Toronto, New York, San Francisco, Chicago, London, ON, etc.).
- **Click-to-View**: Scraped listings act as direct anchor links that open the original Marketplace item page in a new tab.
- **Modern UI**: A responsive, mobile-first, glassmorphic design built with Tailwind CSS v4 and Framer Motion.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS v4, Lucide React
- **Backend API**: Next.js API Routes (Node.js edge)
- **Scraping Engine**: Puppeteer (Headless Chromium), Cheerio (DOM Parser)

## Installation & Usage

1. **Clone & Install Dependencies**
   ```bash
   npm install
   ```

2. **Run the Development Server**
   ```bash
   npm run dev
   ```

3. **Usage**
   - Navigate to `http://localhost:3000`.
   - Enter your target query (e.g., "Honda Civic") and a valid City/Neighborhood (e.g., "Toronto").
   - Click "Scrape" to dispatch the stealth bot. Wait 5-10 seconds for it to return the raw listings.
   - Use the **Hard Filters** panel to instantly mathematically filter the scraped payload down to exact matches without relying on Facebook's backend logic.
