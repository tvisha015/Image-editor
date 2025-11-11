// // src/libs/fabric/designAssets.ts

// // 1. Text Designs (SVGs)
// // You must export your designs from Figma as .svg files and save them in public/text-designs/
// // You should also save a .png version for the preview button in public/text-designs/previews/
// export const textDesigns = [
//   {
//     id: "thanks",
//     svgUrl: "/text-designs/thanks.svg",
//     previewUrl: "/text-designs/previews/thanks.png", 
//   },
//   {
//     id: "blackfriday",
//     svgUrl: "/text-designs/black-friday.svg",
//     previewUrl: "/text-designs/previews/black-friday.png",
//   },
//   {
//     id: "natural",  
//     svgUrl: "/text-designs/natural.svg",
//     previewUrl: "/text-designs/previews/natural.png",
//   },
//   {
//     id: "discount",
//     svgUrl: "/text-designs/discount.svg",
//     previewUrl: "/text-designs/previews/discount.png",
//   },
//   {
//     id: "write-something",
//     svgUrl: "/text-designs/write-something.svg",
//     previewUrl: "/text-designs/previews/sale.png",
//   },
//   {
//     id: "new-year",
//     svgUrl: "/text-designs/new-year.svg",
//     previewUrl: "/text-designs/previews/sale.png",
//   }
// ];

// // 2. Templates (Overlays)
// // Save these in public/templates/ and public/templates/previews/
// export const templates = [
//   { 
//     id: "frame1", 
//     url: "/templates/frame1.png", 
//     previewUrl: "/templates/frame1.png" 
//   },
//   { 
//     id: "frame2", 
//     url: "/templates/frame2.png", 
//     previewUrl: "/templates/previews/frame2.png" 
//   },
//   { 
//     id: "frame3", 
//     url: "/templates/frame3.png", 
//     previewUrl: "/templates/previews/frame3.png" 
//   },
// ];

// src/libs/fabric/designAssets.ts

export interface TextStyle {
  fontFamily: string;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  fontSize?: number;
  fontWeight?: string | number;
  fontStyle?: string;
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  textBackgroundColor?: string;
  textAlign?: string;
}

export const textDesigns = [
  {
    id: "simple-bold",
    previewUrl: "/text-designs/previews/thanks.png", // Keep using images for the buttons
    defaultText: "Thanks",
    style: {
      fontFamily: "Impact", // Ensure this font is loaded
      fill: "#ffffff",
      stroke: "#000000",
      strokeWidth: 2,
      fontSize: 80,
      fontWeight: "bold",
      shadow: { color: "rgba(0,0,0,0.5)", blur: 10, offsetX: 5, offsetY: 5 }
    }
  },
  {
    id: "neon",
    previewUrl: "/text-designs/previews/sale.png",
    defaultText: "SALE",
    style: {
      fontFamily: "Arial",
      fill: "#ff00ff",
      stroke: "#ffffff",
      strokeWidth: 1,
      fontSize: 80,
      fontWeight: 800,
      shadow: { color: "#ff00ff", blur: 20, offsetX: 0, offsetY: 0 },
      textBackgroundColor: "rgba(0,0,0,0.8)"
    }
  },
  {
    id: "retro",
    previewUrl: "/text-designs/previews/natural.png",
    defaultText: "Natural",
    style: {
      fontFamily: "Courier New",
      fill: "#333333",
      fontSize: 60,
      fontStyle: "italic",
      fontWeight: "bold",
      textBackgroundColor: "#f0f0f0"
    }
  },
  {
    id: "discount",
    previewUrl: "/text-designs/previews/discount.png",
    defaultText: "50% OFF",
    style: {
      fontFamily: "Verdana",
      fill: "white",
      fontSize: 50,
      fontWeight: "bold",
      textBackgroundColor: "#e11d48",
      textAlign: 'center'
    }
  },
  // Add more designs here...
];

// Templates remain the same
export const templates = [
  { id: "frame1", url: "/templates/frame1.png", previewUrl: "/templates/frame1.png" },
  { id: "frame2", url: "/templates/frame2.png", previewUrl: "/templates/frame2.png" },
  { id: "frame3", url: "/templates/frame3.png", previewUrl: "/templates/frame3.png" },
];