// FIX: Define and export types for the application
export type Mood = 'Adventurous' | 'Anxious' | 'Chaotic' | 'Cinematic' | 'Comedic' | 'Dramatic' | 'Dreamy' | 'Energetic' | 'Ethereal' | 'Festive' | 'Futuristic' | 'Gritty' | 'Hopeful' | 'Horror' | 'Joyful' | 'Majestic' | 'Melancholic' | 'Mischievous' | 'Mysterious' | 'Nostalgic' | 'Ominous' | 'Peaceful' | 'Playful' | 'Reflective' | 'Romantic' | 'Serene' | 'Somber' | 'Spiritual' | 'Suspenseful' | 'Tranquil' | 'Triumphant' | 'Uplifting' | 'Vintage' | 'Whimsical';
export type Style = 'Abstract' | 'Afrofuturism' | 'Anime' | 'Art Brut' | 'Art Deco' | 'Art Nouveau' | 'Baroque' | 'Bauhaus' | 'Biopunk' | 'Black and White' | 'Cassette Futurism' | 'Christmas' | 'Claymation' | 'Comic Book' | 'Cubism' | 'Cyberpunk' | 'Dadaism' | 'Dark Fantasy' | 'De Stijl' | 'Dieselpunk' | 'Expressionism' | 'Fantasy' | 'Fauvism' | 'Folk Art' | 'Futurism' | 'Ghibli-esque' | 'Glitch Art' | 'Gothic' | 'Graffiti' | 'Hyper-realistic' | 'Impressionistic' | 'Islamic Art' | 'Lo-fi' | 'Low Poly' | 'Minimalist' | 'Neoclassicism' | 'Noir' | 'Oil Painting' | 'Pixel Art' | 'Pointillism' | 'Pop Art' | 'Psychedelic' | 'Realism' | 'Renaissance' | 'Rococo' | 'Romanticism' | 'Scream' | 'Sci-Fi' | 'Sketch' | 'Solarpunk' | 'Steampunk' | 'Suprematism' | 'Surreal' | 'Synthwave' | 'Tim Burton' | 'Trompe-l\'œil' | 'Ukiyo-e' | 'Vaporwave' | 'Vintage Film' | 'Voxel Art' | 'Watercolor';
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '2.39:1';
export type Resolution = 'SD' | 'HD' | '4K';
export type IntroType = 'Book Open' | 'Clock Wipe' | 'Crossfade' | 'Curtain Open' | 'Digital Scanlines' | 'Dynamic Transition' | 'Fade In/Out' | 'Focus Pull' | 'Glitch Intro' | 'Hand-drawn Reveal' | 'Ink Reveal' | 'Iris' | 'Kaleidoscope' | 'Lens Flare' | 'Liquid Metal' | 'Logo Animation' | 'None' | 'Old Film Projector' | 'Particle Burst' | 'Pixelate In' | 'Shatter' | 'Slide' | 'Stop Motion Reveal' | 'Time-lapse Reveal' | 'Title Card' | 'Wipe' | 'Zoom';
export type TextAnimationStyle = 'Blink' | 'Bounce' | 'Chase' | 'Drop In' | 'Echo' | 'Elastic' | 'Fade In' | 'Flicker' | 'Flip' | 'Fountain' | 'Glitch' | 'Glow' | 'Jelly' | 'Pop' | 'Pulse' | 'Shake' | 'Slide In' | 'Spin' | 'Strobe' | 'Stutter' | 'Swirl' | 'Typewriter' | 'Wave' | 'Wiggle' | 'Wobble' | 'Zoom In';
export type TextAnimationSpeed = 'Slow' | 'Normal' | 'Fast';
export type SoundEffect = 'None' | 'Applause' | 'Bell' | 'Birdsong' | 'Camera' | 'Explosion' | 'HoHoHo' | 'MagicWand' | 'OceanWaves' | 'Rain' | 'Thunder';
export type ParticleType = 'None' | 'Sparkles' | 'Dust' | 'Confetti' | 'Rain' | 'Snow' | 'Fireflies';
export type ImageFilter = 'None' | 'Sepia' | 'Grayscale' | 'Invert' | 'Vintage' | 'Technicolor' | 'Lomo' | 'Polaroid';

export interface UploadedImage {
  file: File;
  base64: string;
  previewUrl: string;
}

export interface UploadedAudio {
  file: File;
  base64: string;
}

export interface AnalyzedPrompt {
  prompt: string;
  mood: Mood;
  style: Style;
}