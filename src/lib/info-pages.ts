export type InfoSection = { heading: string; body: string };

export type InfoPage = {
  slug: string;
  eyebrow: string;
  title: string;
  intro: string;
  sections: InfoSection[];
  footer?: string;
};

export const infoPages: Record<string, InfoPage> = {
  contact: {
    slug: "contact",
    eyebrow: "We're here to help",
    title: "Contact us",
    intro:
      "Whether you're planning a full room refresh or looking for the perfect finishing piece, our client team is happy to help. Send us a message and we'll get back to you shortly.",
    sections: [
      {
        heading: "Customer support",
        body: "Email hello@heronandreed.com — we aim to reply within one business day. For faster help with an existing order, please include your order number in the subject line.",
      },
      {
        heading: "Business hours",
        body: "Our client team responds to messages Monday through Saturday. Requests received outside these hours are answered on the next business day.",
      },
      {
        heading: "Design help",
        body: "Not sure where to start? Share a few photos, dimensions or a mood board along with your message and our team will suggest pieces that fit your space.",
      },
    ],
    footer:
      "This is a demo project — no real messages are sent, but every touchpoint reflects how our client team would respond.",
  },
  "shipping-returns": {
    slug: "shipping-returns",
    eyebrow: "Fulfilment",
    title: "Shipping & returns",
    intro:
      "Every piece is packed by hand and shipped with a carrier chosen for the item — from small parcel for décor to specialist delivery for larger furniture.",
    sections: [
      {
        heading: "Shipping timelines",
        body: "Small items typically ship within 2–4 business days. Upholstered and made-to-order furniture is crafted after purchase and generally ships within 3–5 weeks. You'll receive a tracking link the moment your order leaves the warehouse.",
      },
      {
        heading: "Shipping availability & rates",
        body: "Shipping availability, estimated delivery dates and shipping charges are calculated during checkout based on the delivery address you enter. Any applicable duties, taxes or specialist delivery fees for larger furniture are shown transparently before you pay.",
      },
      {
        heading: "30-day easy returns",
        body: "Not quite right? Return most items within 30 days of delivery for a full refund. Made-to-order and final-sale pieces are clearly noted on the product page and are not eligible for return.",
      },
      {
        heading: "How to return",
        body: "Start a return from your account or reply to your order confirmation email. We'll send return instructions and, where available, arrange pick-up for larger items.",
      },
    ],
  },
  "order-tracking": {
    slug: "order-tracking",
    eyebrow: "Order status",
    title: "Order tracking",
    intro:
      "Track any recent order from your account. You can also use the tracking link included in your shipping confirmation email.",
    sections: [
      {
        heading: "Where's my order?",
        body: "Sign in to your account and open the Orders tab — every order shows its current status, carrier and estimated delivery date.",
      },
      {
        heading: "Shipping updates",
        body: "We email you at three key moments: order confirmed, item shipped and out for delivery. If tracking hasn't updated within 48 hours, please get in touch.",
      },
      {
        heading: "Delivery day",
        body: "For larger furniture, our delivery partners will contact you ahead of time to arrange a convenient window and handle unpacking where the service is available.",
      },
    ],
    footer:
      "Need help with a specific order? Email hello@heronandreed.com with your order number and we'll respond within one business day.",
  },
  faq: {
    slug: "faq",
    eyebrow: "Answers",
    title: "Frequently asked questions",
    intro:
      "A quick guide to the questions we hear most often. Can't find what you're looking for? Our client team is one email away.",
    sections: [
      {
        heading: "Are your pieces made to last?",
        body: "Yes. We work with a small group of studios that use responsibly sourced timber, natural fibres and joinery designed to age gracefully. Every category carries its own warranty, listed on the product page.",
      },
      {
        heading: "Do you offer swatches?",
        body: "Complimentary fabric and finish swatches are available for upholstered pieces. You can request them from any product page.",
      },
      {
        heading: "Can I change or cancel my order?",
        body: "In-stock orders can typically be changed within 12 hours of placing. Made-to-order pieces enter production quickly, so please reach out as soon as possible if plans change.",
      },
      {
        heading: "Where do you ship?",
        body: "Shipping availability, estimated delivery dates and shipping charges are calculated during checkout based on the delivery address you enter. If you don't see delivery available at checkout, please contact us for an availability check.",
      },
      {
        heading: "How do I care for my furniture?",
        body: "Care instructions ship with every piece and are also listed on each product page. Our team is happy to advise on recommended cleaning products and seasonal care.",
      },
      {
        heading: "Do you offer a warranty?",
        body: "Yes — every piece is covered by a category-specific warranty against manufacturing defects. The exact terms are listed on each product page.",
      },
    ],
  },
  "our-story": {
    slug: "our-story",
    eyebrow: "About Heron & Reed",
    title: "Our story",
    intro:
      "Heron & Reed exists to make the everyday feel considered. We believe the objects you live with should be quietly beautiful, honestly made and built to be kept.",
    sections: [
      {
        heading: "Our vision",
        body: "That good design is patient. That the things you touch every day deserve care. That a home is built slowly, one thoughtful piece at a time.",
      },
      {
        heading: "Craftsmanship",
        body: "We design in-house and partner with independent makers who share our standards. Every piece is prototyped, tested and lived with before it enters the collection.",
      },
      {
        heading: "Quality that lasts",
        body: "We choose materials and joinery meant to age gracefully rather than fade with trends. Our aim is furniture you'll want to keep, repair and pass on.",
      },
      {
        heading: "The customer experience",
        body: "From browsing to delivery, we obsess over the small details — clear product information, considered packaging and a client team that treats every message like it matters.",
      },
    ],
  },
  sustainability: {
    slug: "sustainability",
    eyebrow: "Made with care",
    title: "Sustainability",
    intro:
      "We build furniture to be lived with for decades, not seasons. Sustainability, for us, starts with materials — and doesn't end at the sale.",
    sections: [
      {
        heading: "Responsibly sourced materials",
        body: "Responsibly sourced hardwoods, certified natural textiles, undyed wools and recycled metals. Every material is documented on the product page so you can make an informed choice.",
      },
      {
        heading: "Low-waste production",
        body: "Our partner studios cut to order, reuse offcuts and ship in recycled, plastic-free packaging wherever possible.",
      },
      {
        heading: "Built to last, built to repair",
        body: "Joinery is designed to be re-tightened, cushions to be re-stuffed and upholstery to be re-covered. Contact our care team for repair and refresh guidance.",
      },
      {
        heading: "A longer product life",
        body: "The most sustainable piece of furniture is the one you keep. Every design decision — from material to construction — is made with longevity in mind.",
      },
    ],
  },
  "trade-program": {
    slug: "trade-program",
    eyebrow: "For designers",
    title: "Trade program",
    intro:
      "A dedicated program for interior designers, architects, stylists and hospitality clients — with preferred pricing, priority production and a dedicated point of contact.",
    sections: [
      {
        heading: "Program benefits",
        body: "Preferred trade pricing, priority production slots, complimentary swatches and access to a dedicated account manager.",
      },
      {
        heading: "Who qualifies",
        body: "Working interior designers, architects, stylists and hospitality operators. Applications are reviewed within three business days.",
      },
      {
        heading: "How to apply",
        body: "Email trade@heronandreed.com with your business details, a short portfolio and a brief introduction. Once approved, you'll receive access to the trade portal.",
      },
    ],
  },
  press: {
    slug: "press",
    eyebrow: "In the press",
    title: "Press",
    intro:
      "For interviews, product loans, tearsheets and high-resolution imagery, please get in touch with our press team.",
    sections: [
      {
        heading: "Press contact",
        body: "Email press@heronandreed.com — we typically respond within one business day.",
      },
      {
        heading: "Assets",
        body: "High-resolution product photography and lifestyle imagery are available on request. Please credit Heron & Reed alongside the original photographer.",
      },
    ],
  },
};

export const infoPageOrder: string[] = [
  "contact",
  "shipping-returns",
  "order-tracking",
  "faq",
  "our-story",
  "sustainability",
  "trade-program",
  "press",
];
