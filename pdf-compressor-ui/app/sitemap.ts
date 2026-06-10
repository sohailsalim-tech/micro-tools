import type { MetadataRoute } from "next";

const BASE = "https://tecpdf.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,                    lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/compress`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/merge`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/split`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/jpg-to-pdf`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/pdf-to-jpg`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/protect`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];
}
