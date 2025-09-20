// FIX: Implement video generation service using Gemini API.
import { GoogleGenAI, Type } from "@google/genai";
import { Mood, Style, UploadedImage, AspectRatio, UploadedAudio, IntroType, TextAnimationStyle, TextAnimationSpeed, ParticleType, Resolution, AnalyzedPrompt, ImageFilter } from '../types';
import { MOOD_OPTIONS, STYLE_OPTIONS } from '../constants';

// FIX: Initialize GoogleGenAI with apiKey from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

interface GenerateVideoParams {
  prompt: string;
  mood: Mood;
  style: Style;
  aspectRatio: AspectRatio;
  resolution?: Resolution;
  animationText?: string;
  textColor?: string;
  textBackgroundColor?: string;
  textBackgroundOpacity?: number;
  textBackgroundBlur?: number;
  textAnimationStyle?: TextAnimationStyle;
  textAnimationSpeed?: TextAnimationSpeed;
  textAnimationDuration?: number;
  image?: UploadedImage;
  audio?: UploadedAudio;
  audioVolume?: number;
  soundEffectDescription?: string;
  soundEffectIntensity?: number;
  textToSpeech?: string;
  intro?: IntroType;
  motionBlur?: boolean;
  vignette?: boolean;
  filmGrain?: boolean;
  particleType?: ParticleType;
  particleDensity?: number;
  imageFilter?: ImageFilter;
}

export const analyzeImageForVideoPrompt = async (
  image: UploadedImage
): Promise<AnalyzedPrompt> => {
  const validMoods = MOOD_OPTIONS.map(m => m.value).join(', ');
  const validStyles = STYLE_OPTIONS.map(s => s.value).join(', ');

  const instructionPrompt = `Analyze the provided image and generate a JSON object containing a detailed prompt for a video generation model like VEO. The JSON object must have three keys:
1. "prompt": A detailed string describing the scene, subjects, atmosphere, and suggesting cinematic motion (e.g., slow pan, zoom in, subtle movement).
2. "mood": Choose the most fitting mood from this list: ${validMoods}.
3. "style": Choose the most fitting artistic style from this list: ${validStyles}.

Your entire response must be only the raw JSON object, without any markdown formatting or extra text.`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: instructionPrompt },
                {
                    inlineData: {
                        mimeType: image.file.type,
                        data: image.base64,
                    },
                },
            ],
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    prompt: { type: Type.STRING },
                    mood: { type: Type.STRING },
                    style: { type: Type.STRING },
                },
                required: ["prompt", "mood", "style"]
            }
        }
    });

    const analyzedData = JSON.parse(response.text);

    return {
        prompt: analyzedData.prompt,
        mood: analyzedData.mood as Mood,
        style: analyzedData.style as Style,
    };
  } catch (error) {
    console.error("Error analyzing image:", error);
    if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error("AI analysis returned an invalid format. Please try again.");
    }
    throw new Error("Failed to analyze image for video prompt.");
  }
};

export const generateVideo = async ({
  prompt,
  mood,
  style,
  aspectRatio,
  resolution,
  animationText,
  textColor,
  textBackgroundColor,
  textBackgroundOpacity,
  textBackgroundBlur,
  textAnimationStyle,
  textAnimationSpeed,
  textAnimationDuration,
  image,
  audio,
  audioVolume,
  soundEffectDescription,
  soundEffectIntensity,
  textToSpeech,
  intro,
  motionBlur,
  vignette,
  filmGrain,
  particleType,
  particleDensity,
  imageFilter,
}: GenerateVideoParams): Promise<string> => {
  // Construct a more descriptive and robust prompt for the model
  const promptParts = [];

  // Add intro sequence instruction, if selected.
  if (intro === 'Title Card') {
      const titleText = animationText?.trim() || prompt.trim();
      if (titleText) {
          promptParts.push(`Begin the video with a stylish, animated title card that creatively displays the text: "${titleText}".`);
      } else {
          promptParts.push("Begin the video with a stylish, animated title card.");
      }
  } else if (intro === 'Logo Animation') {
      promptParts.push("Start the video with a short, professional, and abstract logo animation reveal before the main scene begins.");
  } else if (intro === 'Fade In/Out') {
      promptParts.push("Start the video with a simple, elegant fade-in from black.");
  } else if (intro === 'Dynamic Transition') {
      promptParts.push("Begin the video with a creative and dynamic transition into the main scene.");
  } else if (intro === 'Glitch Intro') {
      promptParts.push("Start the video with a high-energy, digital glitch effect transition into the main scene.");
  } else if (intro === 'Lens Flare') {
      promptParts.push("Begin the video with a dramatic and cinematic lens flare effect sweeping across the screen.");
  } else if (intro === 'Ink Reveal') {
      promptParts.push("Start the video with an artistic ink bleed or watercolor reveal of the first frame.");
  } else if (intro === 'Particle Burst') {
      promptParts.push("Begin the video with an explosion of particles that resolves into the main scene.");
  } else if (intro === 'Wipe') {
      promptParts.push("Begin the video with a clean, cinematic wipe transition (e.g., left-to-right, top-to-bottom, or a creative shape) into the main scene.");
  } else if (intro === 'Slide') {
      promptParts.push("Start the video with the first frame sliding smoothly into view from off-screen (e.g., from the left, right, top, or bottom).");
  } else if (intro === 'Zoom') {
      promptParts.push("Begin the video with a rapid zoom-in from a black or white screen, or a blur, that resolves into the main scene.");
  } else if (intro === 'Crossfade') {
      promptParts.push("Begin the video with a smooth crossfade transition from a black screen into the main scene.");
  } else if (intro === 'Iris') {
      promptParts.push("Start the video with a classic iris wipe transition (a circle that expands or contracts) to reveal the main scene.");
  } else if (intro === 'Clock Wipe') {
      promptParts.push("Begin the video with a clock wipe transition, where a radial line sweeps around the screen to reveal the main scene, like the hand of a clock.");
  } else if (intro === 'Curtain Open') {
      promptParts.push("Begin the video with a theatrical curtain-opening effect, where two black bars or a simulated curtain part to reveal the main scene.");
  } else if (intro === 'Focus Pull') {
      promptParts.push("Start the video with a cinematic focus pull, where the camera racks focus from a blurry foreground or background element to reveal the main subject in sharp detail.");
  } else if (intro === 'Shatter') {
      promptParts.push("Begin the video with the first frame appearing as if it's shattering into pieces, which then reassemble to form the complete scene.");
  } else if (intro === 'Hand-drawn Reveal') {
      promptParts.push("Begin the video with a creative hand-drawn scribble animation that reveals the first frame of the main scene.");
  } else if (intro === 'Pixelate In') {
      promptParts.push("Start the video with a heavily pixelated image that gradually resolves into the sharp, clear first frame of the main scene.");
  } else if (intro === 'Stop Motion Reveal') {
      promptParts.push("Begin the video with a stop-motion animation effect where elements of the scene build up frame-by-frame to reveal the full first scene.");
  } else if (intro === 'Book Open') {
      promptParts.push("Begin the video with an animation of a book opening, with the first frame of the scene appearing on one of its pages before transitioning to the full video.");
  } else if (intro === 'Digital Scanlines') {
      promptParts.push("Start the video with a retro digital scanline effect, like an old CRT monitor powering on, that resolves into the main scene.");
  } else if (intro === 'Old Film Projector') {
      promptParts.push("Begin the video with the effect of an old film projector starting up, complete with film leader, a countdown, and the sound of a projector, before transitioning into the main scene.");
  } else if (intro === 'Kaleidoscope') {
    promptParts.push("Begin the video with a beautiful, unfolding kaleidoscope effect that resolves into the main scene.");
  } else if (intro === 'Liquid Metal') {
    promptParts.push("Start the video with a fluid, liquid metal or mercury-like animation that forms into the first frame.");
  } else if (intro === 'Time-lapse Reveal') {
    promptParts.push("Begin the video with a fast-paced time-lapse sequence (e.g., clouds moving, a flower blooming) that transitions into the main scene.");
  }


  // Start with the user's core prompt or a generic one if only an image is provided.
  if (prompt.trim()) {
      promptParts.push(prompt.trim());
  } else if (image) {
      promptParts.push("Animate the provided image into a beautiful video clip.");
  }

  // Add style and mood descriptions.
  promptParts.push(`The animation style should be ${style}, evoking a ${mood} mood.`);

  // Add aspect ratio.
  promptParts.push(`The video must be in a ${aspectRatio} aspect ratio.`);

  // Add resolution instruction.
  if (resolution) {
    promptParts.push(`The final video quality should be ${resolution}. For example, 'HD' is 1080p and '4K' is 2160p.`);
  }

  // Add motion blur instruction.
  if (motionBlur) {
    promptParts.push("Apply a cinematic motion blur effect to enhance the sense of movement and create a more dynamic look.");
  }

  // Add vignette instruction.
  if (vignette) {
      promptParts.push("Apply a dark, subtle vignette effect to the edges of the video to create a more focused and dramatic cinematic feel.");
  }

  // Add film grain instruction.
  if (filmGrain) {
      promptParts.push("Add a subtle, realistic film grain effect over the entire video to give it an authentic, cinematic, celluloid look.");
  }

  // Add image filter instruction.
  if (imageFilter && imageFilter !== 'None') {
    promptParts.push(`Apply a '${imageFilter}' image filter to the entire video for a stylized, post-processed look.`);
  }

  // Add particle effect instruction.
  if (particleType && particleType !== 'None') {
    let particlePrompt = `Incorporate a visual particle effect of '${particleType}' into the scene.`;
    if (particleDensity !== undefined) {
        particlePrompt += ` The density of these particles should be approximately ${particleDensity}%. A lower percentage means a subtle effect, while a higher percentage means a more prominent effect.`;
    }
    promptParts.push(particlePrompt);
  }

  // Add audio influence, if provided.
  if (audio) {
    let audioPrompt = "The video's motion, pacing, and emotional tone should be directly inspired by and synchronized with an accompanying audio track.";
    if (audioVolume !== undefined) {
      audioPrompt += ` The intended volume of this audio is ${audioVolume}%, which should influence the video's intensity. A lower volume suggests a more subtle, atmospheric role for the music, while a higher volume suggests the music is a dominant, driving force in the scene.`;
    }
    promptParts.push(audioPrompt);
  } else if (soundEffectDescription) {
    let soundPrompt = `The video should be thematically appropriate for an accompanying sound effect described as: "${soundEffectDescription}".`;
    if (soundEffectIntensity !== undefined) {
        soundPrompt += ` The thematic influence of this sound should be at ${soundEffectIntensity}% intensity. A lower intensity means a more subtle connection, while a higher intensity means the video's theme is strongly dominated by the sound effect.`;
    }
    soundPrompt += " The video should NOT generate its own audio.";
    promptParts.push(soundPrompt);
  } else if (textToSpeech && textToSpeech.trim() !== '') {
    promptParts.push(`The video's mood, theme, and pacing should be appropriate for a voiceover narration that says: "${textToSpeech.trim()}". The video should NOT generate its own audio or voiceover.`);
  }

  // Add text overlay instruction.
  if (animationText && animationText.trim() !== '') {
    let textPrompt = `CRITICAL INSTRUCTION: Render the exact text "${animationText.trim()}" as an animated overlay.`;
    if (textColor) {
        textPrompt += ` The text color should be ${textColor}.`;
    }
    if (textBackgroundColor) {
        textPrompt += ` The text should have a background color of ${textBackgroundColor}. Make the background a simple, clean rectangle behind the text.`;
        if (textBackgroundOpacity !== undefined) {
            textPrompt += ` The background should have an opacity of approximately ${textBackgroundOpacity}%.`;
        }
        if (textBackgroundBlur !== undefined && textBackgroundBlur > 0) {
            textPrompt += ` Apply a blur effect of roughly ${textBackgroundBlur}px to the background.`;
        }
    }
    if (textAnimationStyle) {
        textPrompt += ` The text should animate using a '${textAnimationStyle}' effect.`;
    }
    if (textAnimationSpeed) {
        textPrompt += ` The animation speed should be ${textAnimationSpeed}.`;
    }
    if (textAnimationDuration) {
        textPrompt += ` The animation should last for approximately ${textAnimationDuration} seconds.`;
    }
    textPrompt += ' The text must be clearly visible and integrated aesthetically into the scene.';
    promptParts.push(textPrompt);
  }

  const fullPrompt = promptParts.join(' ');

  const generateVideosParams: any = {
    // FIX: Use the correct model for video generation.
    model: 'veo-2.0-generate-001',
    prompt: fullPrompt,
    config: {
      numberOfVideos: 1,
    },
  };

  if (image) {
    generateVideosParams.image = {
      imageBytes: image.base64,
      mimeType: image.file.type,
    };
  }

  try {
    // FIX: Call generateVideos and handle the long-running operation.
    let operation = await ai.models.generateVideos(generateVideosParams);

    // Polling logic for video generation
    while (!operation.done) {
      // Wait for 10 seconds before checking the status again.
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (downloadLink) {
        // FIX: The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY!}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.statusText}`);
        }
        const videoBlob = await response.blob();
        return URL.createObjectURL(videoBlob);
    } else {
        throw new Error("Video generation failed. No download link found.");
    }

  } catch (error) {
    console.error("Error generating video:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate video: ${error.message}`);
    }
    throw new Error("An unknown error occurred during video generation.");
  }
};