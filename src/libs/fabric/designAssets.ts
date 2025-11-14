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
  {
    id: "comic-pop",
    previewUrl: "/text-designs/previews/boom.png",
    defaultText: "BOOM!",
    style: {
      fontFamily: "Comic Sans MS, 'Chalkboard SE', sans-serif",
      fill: "#FACC15", // Bright Yellow
      stroke: "#000000",
      strokeWidth: 4,
      fontSize: 80,
      fontWeight: "900",
      // Hard shadow with no blur creates a distinct "print" look
      shadow: { color: "#000000", blur: 0, offsetX: 8, offsetY: 8 }
    }
  },

  // 2. CYBERPUNK / HACKER STYLE
  {
    id: "cyberpunk",
    previewUrl: "/text-designs/previews/glitch.png",
    defaultText: "SYSTEM_01",
    style: {
      fontFamily: "Courier New, monospace",
      fill: "#00ff41", // Matrix Green
      stroke: "#003b00",
      strokeWidth: 1,
      fontSize: 60,
      fontWeight: "bold",
      textBackgroundColor: "#000000",
      // Green glow effect
      shadow: { color: "#00ff41", blur: 15, offsetX: 0, offsetY: 0 }
    }
  },

  // 3. ELEGANT / LUXURY STYLE
  {
    id: "elegant-serif",
    previewUrl: "/text-designs/previews/luxury.png",
    defaultText: "Exclusive",
    style: {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fill: "#D4AF37", // Metallic Gold
      fontSize: 70,
      fontWeight: "normal",
      fontStyle: "italic",
      letterSpacing: 2, // Adds sophistication
      shadow: { color: "rgba(0,0,0,0.4)", blur: 4, offsetX: 2, offsetY: 2 }
    }
  },

  // 4. MODERN OUTLINE (HOLLOW)
  {
    id: "modern-hollow",
    previewUrl: "/text-designs/previews/outline.png",
    defaultText: "MINIMAL",
    style: {
      fontFamily: "Helvetica, Arial, sans-serif",
      fill: "transparent", // No fill
      stroke: "#ffffff", // White outline
      strokeWidth: 3,
      fontSize: 80,
      fontWeight: "900",
      shadow: { color: "rgba(0,0,0,0.2)", blur: 5, offsetX: 5, offsetY: 5 }
    }
  },

  // 5. VAPORWAVE / SYNTHWAVE
  {
    id: "vaporwave",
    previewUrl: "/text-designs/previews/vibes.png",
    defaultText: "V I B E S",
    style: {
      fontFamily: "Arial, sans-serif",
      fill: "#00ffff", // Cyan
      fontSize: 60,
      fontWeight: "bold",
      // Pink shadow creates the vibration effect
      shadow: { color: "#ff00ff", blur: 0, offsetX: 4, offsetY: 4 },
      letterSpacing: 10 // Wide spacing is key for this aesthetic
    }
  },

  // 6. CANDY / BUBBLE
  {
    id: "candy",
    previewUrl: "/text-designs/previews/sweet.png",
    defaultText: "Sweet",
    style: {
      fontFamily: "Verdana, sans-serif",
      fill: "#ff69b4", // Hot Pink
      stroke: "#ffffff",
      strokeWidth: 5,
      fontSize: 75,
      fontWeight: "bold",
      // Soft pink glow
      shadow: { color: "rgba(255, 105, 180, 0.6)", blur: 15, offsetX: 0, offsetY: 5 }
    }
  },

  // 7. HORROR / GRUNGE
  {
    id: "horror",
    previewUrl: "/text-designs/previews/scary.png",
    defaultText: "BEWARE",
    style: {
      fontFamily: "Impact, sans-serif",
      fill: "#880000", // Blood Red
      stroke: "#000000",
      strokeWidth: 1,
      fontSize: 85,
      fontWeight: "bold",
      shadow: { color: "#000000", blur: 25, offsetX: 0, offsetY: 0 },
      textBackgroundColor: "rgba(0,0,0,0.9)"
    }
  },
  
  // 8. SOCIAL MEDIA CAPTION (Subtitles)
  {
    id: "subtitle-highlight",
    previewUrl: "/text-designs/previews/caption.png",
    defaultText: "Watch This",
    style: {
      fontFamily: "Roboto, Arial, sans-serif",
      fill: "#ffffff",
      fontSize: 45,
      fontWeight: "800",
      textBackgroundColor: "#000000", // Classic TikTok/Reels style
      lineHeight: 1.2,
      padding: 10 // If your renderer supports padding
    }
  }
  // Add more designs here...
];

// Templates remain the same
export const templates = [
  { id: "frame1", url: "/templates/frame1.png", previewUrl: "/templates/frame1.png" },
  { id: "frame2", url: "/templates/frame2.png", previewUrl: "/templates/frame2.png" },
  { id: "frame3", url: "/templates/frame3.png", previewUrl: "/templates/frame3.png" },
];