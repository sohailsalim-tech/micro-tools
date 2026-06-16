export type Section = {
  heading?: string;
  body: string;
};

export type Post = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readTime: number;
  category: string;
  sections: Section[];
};

export const posts: Post[] = [
  {
    slug: "how-to-compress-pdf-without-losing-quality",
    title: "How to Compress a PDF Without Losing Quality",
    description:
      "Learn how to reduce your PDF file size by up to 90% without degrading text, images, or formatting — completely free and online.",
    publishedAt: "2026-06-16",
    readTime: 5,
    category: "PDF Tips",
    sections: [
      {
        body: "Large PDF files are a headache. Email attachments get rejected, upload portals throw errors, and cloud storage fills up fast. The good news is that most PDFs can be compressed dramatically — often by 60–90% — without any visible loss in quality. Here's everything you need to know.",
      },
      {
        heading: "Why are PDFs so large?",
        body: "PDFs often become bloated for a few reasons. High-resolution images embedded in the file are the biggest culprit — a single scanned page can add several megabytes. Embedded fonts, metadata, revision history, and colour profiles also add unnecessary weight. Compression works by intelligently reducing these without touching the actual readable content.",
      },
      {
        heading: "The four compression levels explained",
        body: "Most PDF compressors — including ours — offer multiple levels:\n\n• Screen — Maximum compression. Ideal for sharing via email or uploading to web portals. Images are downsampled to 72 dpi. Best for documents that will only be read on screen.\n\n• eBook — A balanced middle ground. Images are kept at 150 dpi. Good for most everyday documents — reports, invoices, forms.\n\n• Printer — Light compression. Images stay at 300 dpi. Use this if the PDF will be printed and quality matters.\n\n• Prepress — Minimal compression. Best for professional publishing or design files where every pixel counts.",
      },
      {
        heading: "How to compress a PDF for free — step by step",
        body: "1. Go to tecpdf.com/compress\n2. Drag and drop your PDF or click to select it\n3. Choose your compression level (eBook is a great default)\n4. Click Compress PDF\n5. Download your smaller file\n\nNo signup required. Your file is processed on a secure server and permanently deleted immediately after you download. The whole process takes under 30 seconds for most files.",
      },
      {
        heading: "How much smaller will my PDF get?",
        body: "Results vary depending on the original file. A 10 MB PDF full of high-resolution photos on Screen mode might compress to under 1 MB — a 90% reduction. A text-heavy PDF like a Word document converted to PDF might only reduce by 10–20%, because there's little visual data to optimise. If your PDF is already optimised, the compressor will return the original unchanged rather than making it larger.",
      },
      {
        heading: "Tips for the smallest possible file size",
        body: "• Choose Screen compression for anything going via email or web upload\n• Remove unnecessary pages before compressing — use our Split PDF tool to extract only the pages you need\n• Avoid scanning documents at 600 dpi when 150–200 dpi is perfectly readable\n• If you're converting from Word, avoid embedding high-res images unless necessary",
      },
      {
        heading: "Is compressed PDF quality really preserved?",
        body: "For text-based content — yes, completely. Text in PDFs is stored as vector data, not pixels, so it's never affected by compression. What changes is the resolution of embedded images. On Screen mode, images are downsampled to 72 dpi — fine for reading on any screen, but you'd notice the difference if you zoomed in to 400%. For print use, choose Printer or Prepress mode instead.",
      },
      {
        body: "Ready to compress your PDF? Try our free tool at tecpdf.com/compress — no signup, no watermark, instant results.",
      },
    ],
  },
  {
    slug: "best-free-pdf-tools-online-2025",
    title: "5 Best Free PDF Tools Online in 2025 (No Signup Required)",
    description:
      "A roundup of the best free online PDF tools in 2025 — compress, merge, split, convert, and chat with your PDFs. No signup, no watermark.",
    publishedAt: "2026-06-16",
    readTime: 6,
    category: "PDF Tools",
    sections: [
      {
        body: "There's no shortage of online PDF tools — but most of them hit you with a paywall after one use, slap a watermark on your file, or demand an email address just to get started. In 2025, you shouldn't have to deal with that. Here are the best genuinely free PDF tools available right now, all of which work without any signup.",
      },
      {
        heading: "1. Compress PDF — shrink files by up to 90%",
        body: "The most commonly needed PDF tool. A good compressor should offer multiple quality levels and actually tell you how much smaller your file got. Our Compress PDF tool uses Ghostscript — the industry-standard engine — to intelligently reduce file size without degrading text. You pick the compression level (Screen, eBook, Printer, or Prepress) and get a result in seconds.\n\nBest for: sending PDFs by email, uploading to portals with file size limits, reducing cloud storage.\n\nTry it: tecpdf.com/compress",
      },
      {
        heading: "2. Merge PDF — combine multiple files into one",
        body: "Got five separate PDFs that belong together? Merge PDF lets you drag in as many files as you want, reorder them by dragging, and combine them into a single clean document. No file count limits on the free plan.\n\nBest for: combining scanned pages, assembling reports from multiple sources, creating a single portfolio document.\n\nTry it: tecpdf.com/merge",
      },
      {
        heading: "3. Split PDF — extract exactly the pages you need",
        body: "The opposite of merge. Split PDF lets you extract specific pages, define custom ranges, or split every page into its own file. You can also get a page count before splitting so you know exactly what you're working with.\n\nBest for: extracting a single chapter from a long report, removing confidential pages before sharing, splitting a multi-section document.\n\nTry it: tecpdf.com/split",
      },
      {
        heading: "4. AI PDF Summarizer — get the key points instantly",
        body: "This is where things get genuinely useful. Upload any text-based PDF — a research paper, a contract, a financial report — and the AI reads the entire document and delivers a clear, structured summary. It identifies the main topics, key findings, and conclusions so you don't have to read every page.\n\nBest for: students, researchers, professionals who deal with long documents daily.\n\nTry it: tecpdf.com/summarize",
      },
      {
        heading: "5. Chat with PDF — ask your document questions",
        body: "The most powerful tool in the set. Chat with PDF lets you have a real conversation with any document. Upload a PDF and ask it anything — 'What are the payment terms?', 'Summarise section 3', 'What risks does this contract mention?' The AI reads the full document and answers accurately based on the actual content.\n\nBest for: legal documents, contracts, research papers, technical manuals — anywhere you need a specific answer fast.\n\nTry it: tecpdf.com/chat",
      },
      {
        heading: "Honourable mentions",
        body: "Beyond the five above, tecpdf.com also offers:\n• Protect PDF — add a password to prevent unauthorised access\n• JPG to PDF — combine multiple images into one PDF\n• PDF to JPG — convert every page into a high-quality image\n• Word to PDF and Excel to PDF — instant, accurate conversion\n• AI PDF Translator — translate any PDF into 10 languages",
      },
      {
        heading: "What makes a good free PDF tool?",
        body: "Three things: it works reliably, it doesn't store your files, and it doesn't demand payment after one use. All the tools above process files on secure servers and delete them immediately after download. No signup. No watermark. No catch.",
      },
      {
        body: "All 11 tools are available free at tecpdf.com — no account required.",
      },
    ],
  },
  {
    slug: "how-to-translate-pdf-to-spanish-free",
    title: "How to Translate a PDF to Spanish for Free (Full Document, Instantly)",
    description:
      "Translate any PDF to Spanish online for free — no signup, no software. AI-powered PDF translation that preserves your document structure.",
    publishedAt: "2026-06-16",
    readTime: 4,
    category: "PDF Tips",
    sections: [
      {
        body: "Need to translate a PDF into Spanish but don't want to copy-paste every page into Google Translate? There's a better way. AI-powered PDF translation tools can handle your entire document at once — extracting the text, translating it accurately, and delivering clean output you can copy and use immediately. Here's how to do it for free.",
      },
      {
        heading: "Why regular translation tools struggle with PDFs",
        body: "Google Translate handles plain text well, but PDFs aren't plain text. The content is locked inside a formatted document. You'd have to manually copy each section, lose all formatting in the process, and paste it back — tedious for a 10-page document, nearly impossible for 50 pages. A proper PDF translator handles the extraction automatically.",
      },
      {
        heading: "How to translate a PDF to Spanish — step by step",
        body: "1. Go to tecpdf.com/translate\n2. Drag and drop your PDF or click to select it (up to 3 MB, 10 pages)\n3. Select Spanish from the language grid\n4. Click Translate to Spanish\n5. Wait 10–30 seconds while the AI processes your document\n6. Copy the full translation or read it directly on screen\n\nNo account needed. Your PDF is deleted from our servers immediately after translation.",
      },
      {
        heading: "What languages are supported?",
        body: "Our PDF Translator supports 10 languages:\n• Spanish\n• French\n• German\n• Portuguese\n• Chinese (Simplified)\n• Japanese\n• Korean\n• Arabic\n• Hindi\n• Italian\n\nMore languages are on the roadmap.",
      },
      {
        heading: "How accurate is AI PDF translation?",
        body: "Much better than word-for-word translation tools. Our translator uses Claude AI, which understands context — so idiomatic expressions, technical terms, and sentence structure are handled naturally rather than literally. For professional documents like contracts or legal filings, we always recommend having a human translator review the output. For everyday use — articles, reports, manuals — the accuracy is excellent.",
      },
      {
        heading: "Does it work on scanned PDFs?",
        body: "Our current translator works on text-based PDFs — documents that were created digitally (Word exports, generated reports, ebooks). Scanned PDFs are essentially images of text and require OCR (optical character recognition) before translation. OCR support is on our roadmap. If you have a scanned document, try selecting the text in your PDF reader first — if you can highlight it, the translator will work.",
      },
      {
        heading: "Tips for best results",
        body: "• Use text-based PDFs, not scanned images\n• Keep files under 3 MB for faster processing\n• Documents with complex tables or multi-column layouts may lose some formatting in the output text — the translation content will be accurate but layout won't be preserved\n• For very long documents, split them first using our Split PDF tool and translate section by section",
      },
      {
        body: "Translate your PDF to Spanish free at tecpdf.com/translate — no signup, no watermark, powered by AI.",
      },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return posts.map((p) => p.slug);
}
