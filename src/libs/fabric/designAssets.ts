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
export interface TemplateLayer {
  type: 'text' | 'rect' | 'circle' | 'image'; // Simple types for now
  text?: string;
  fill?: string;
  url?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  left: number; // Percentage (0 to 1) relative to canvas width
  top: number;  // Percentage (0 to 1) relative to canvas height
  width?: number;
  height?: number;
  originX?: string;
  originY?: string;
  angle?: number;
  selectable?: boolean;
  textAlign?: string;
}

export interface EditableTemplate {
  id: string;
  name: string;
  previewUrl: string; // Thumbnail for the sidebar
  backgroundColor: string;
  width: number; 
  height: number;
  layers: TemplateLayer[];
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

export const editableTemplates: EditableTemplate[] = [
  {
    id: "fashion-abstract",
    name: "Fashion Abstract",
    previewUrl: "templates/fashion/fashion1.png",
    backgroundColor: "#ffffff", // White background
    width: 1080,
    height: 1080,
    layers: [
      {
        type: 'image',
        url: 'templates/fashion/assets/flower-top.png',
        left: 0.34, // 85% across (Top Right)
        top: 0.4,  // 5% down
        width: 0.7, // 15% of canvas width
        originX: 'center',
        originY: 'center',
        selectable: true
      },
      {
        type: 'image',
        url: 'templates/fashion/assets/flower-bottom.png',
        left: 0.69, // 0 - very top, 1 - very bottom
        top: 0.74,  // 5% down
        width: 0.65, // 15% of canvas width
        originX: 'center',
        originY: 'center',
        selectable: true
      },
      
      // 3. Headline Text
      {
        type: 'text',
        // Using manual line breaks (\n) to match the design layout
        text: "Vestibulum\nnon felis\nquis magna\neuismod\ndictum.",
        fontFamily: "Orange Avenue DEMO",
        fontSize: 90, // Large size for 1080p base
        fill: "#000000",
        left: 0.05, top: 0.08, // Top-left padding
        textAlign: 'left',
        selectable: true
      },
      // 4. Body Text
      {
        type: 'text',
        text: "Mauris nunc lectus, laoreet ut ex\nfinibus, pulvinar pellentesque\norci. Donec a auctor augue.",
        fontFamily: "Poppins",
        fontSize: 32,
        fill: "#333333",
        left: 0.05, top: 0.62, // Positioned below the headline
        textAlign: 'left',
        selectable: true
      }
      // Note: The main image (the dog/person) will be added automatically on top of these layers by the applyTemplate function.
    ]
  },
  {
    id: "black-friday-modern",
    name: "Black Friday",
    previewUrl: "/templates/previews/black-friday-thumb.png", // Make sure this exists or use a placeholder
    backgroundColor: "#BE185D", // Pink/Red background
    width: 500,
    height: 800,
    layers: [
      // 1. Background Shape (Dark box behind text)
      {
        type: 'rect',
        fill: '#831843',
        left: 0.5, top: 0.5,
        width: 350, height: 400,
        originX: 'center', originY: 'center',
        selectable: true
      },
      // 2. Top Text
      {
        type: 'text',
        text: "BLACK",
        fontFamily: "Impact",
        fontSize: 80,
        fill: "#000000",
        left: 0.5, top: 0.25,
        originX: 'center', originY: 'center'
      },
      // 3. Bottom Text
      {
        type: 'text',
        text: "FRIDAY",
        fontFamily: "Impact",
        fontSize: 80,
        fill: "#000000",
        left: 0.5, top: 0.75,
        originX: 'center', originY: 'center'
      },
      // 4. Discount Bubble
      {
        type: 'circle',
        fill: '#FCD34D', // Yellow
        width: 40, // Radius
        left: 0.8, top: 0.8,
        originX: 'center', originY: 'center'
      },
      {
        type: 'text',
        text: "50%\nOFF",
        fontSize: 20,
        fontFamily: "Arial",
        fontWeight: "bold",
        fill: "#000000",
        left: 0.8, top: 0.8,
        originX: 'center', originY: 'center'
      }
    ]
  },
  {
    id: "simple-showcase",
    name: "Showcase",
    previewUrl: "/templates/previews/showcase-thumb.png",
    backgroundColor: "#F3F4F6", // Light Grey
    width: 1080,
    height: 1080,
    layers: [
      // Simple Frame Border
      {
        type: 'rect',
        fill: 'transparent',
        width: 0.9, // 90% of canvas
        height: 0.9,
        left: 0.5, top: 0.5,
        originX: 'center', originY: 'center',
        // We use stroke for border in actual implementation, but for this demo struct:
      },
      {
        type: 'text',
        text: "New Arrival",
        fontFamily: "Courier New",
        fontSize: 40,
        fill: "#333333",
        left: 0.5, top: 0.1,
        originX: 'center', originY: 'center'
      }
    ]
  }
];


// Templates remain the same
export const templates = [
  { id: "frame1", url: "/templates/frame1.png", previewUrl: "/templates/frame1.png" },
  { id: "frame2", url: "/templates/frame2.png", previewUrl: "/templates/frame2.png" },
  { id: "frame3", url: "/templates/frame3.png", previewUrl: "/templates/frame3.png" },
];