// FIX: Create the main App component with state management and UI structure.
// FIX: Import useState, useCallback, and useRef from React to resolve 'Cannot find name' errors.
import React, { useState, useCallback, useRef } from 'react';
import { MOOD_OPTIONS, STYLE_OPTIONS, ASPECT_RATIO_OPTIONS, RESOLUTION_OPTIONS, INTRO_TYPE_OPTIONS, TEXT_ANIMATION_STYLE_OPTIONS, TEXT_ANIMATION_SPEED_OPTIONS, SOUND_EFFECT_OPTIONS, PARTICLE_TYPE_OPTIONS, IMAGE_FILTER_OPTIONS } from './constants';
import { Mood, Style, UploadedImage, AspectRatio, Resolution, UploadedAudio, IntroType, TextAnimationStyle, TextAnimationSpeed, SoundEffect, ParticleType, ImageFilter } from './types';
import { generateVideo, analyzeImageForVideoPrompt } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import OptionSelector from './components/OptionSelector';
import Loader from './components/Loader';
import VideoPlayer from './components/VideoPlayer';
import { MusicIcon, MicIcon } from './components/icons';

type AudioSourceType = 'none' | 'soundEffect' | 'upload' | 'tts' | 'record';

const AUDIO_SOURCE_OPTIONS: { id: AudioSourceType; label: string }[] = [
    { id: 'none', label: 'None' },
    { id: 'soundEffect', label: 'Sound Effect' },
    { id: 'upload', label: 'Upload MP3' },
    { id: 'tts', label: 'Text-to-Speech' },
    { id: 'record', label: 'Record Voice' },
];

function App() {
  const [prompt, setPrompt] = useState<string>('');
  const [mood, setMood] = useState<Mood>('Cinematic');
  const [style, setStyle] = useState<Style>('Hyper-realistic');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState<Resolution>('HD');
  const [intro, setIntro] = useState<IntroType>('None');
  const [animationText, setAnimationText] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [textBackgroundColor, setTextBackgroundColor] = useState<string>('#000000');
  const [textBackgroundOpacity, setTextBackgroundOpacity] = useState<number>(50);
  const [textBackgroundBlur, setTextBackgroundBlur] = useState<number>(5);
  const [textAnimationStyle, setTextAnimationStyle] = useState<TextAnimationStyle>('Fade In');
  const [textAnimationSpeed, setTextAnimationSpeed] = useState<TextAnimationSpeed>('Normal');
  const [textAnimationDuration, setTextAnimationDuration] = useState<number>(3);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [uploadedAudio, setUploadedAudio] = useState<UploadedAudio | null>(null);
  const [audioVolume, setAudioVolume] = useState<number>(50);
  const [soundEffect, setSoundEffect] = useState<SoundEffect>('None');
  const [soundEffectIntensity, setSoundEffectIntensity] = useState<number>(50);
  const [textToSpeech, setTextToSpeech] = useState<string>('');
  const [motionBlur, setMotionBlur] = useState<boolean>(false);
  const [vignette, setVignette] = useState<boolean>(false);
  const [filmGrain, setFilmGrain] = useState<boolean>(false);
  const [particleType, setParticleType] = useState<ParticleType>('None');
  const [particleDensity, setParticleDensity] = useState<number>(50);
  const [imageFilter, setImageFilter] = useState<ImageFilter>('None');
  const [analyzeAndGenerate, setAnalyzeAndGenerate] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Unified audio source state
  const [audioType, setAudioType] = useState<AudioSourceType>('none');

  // States and refs for voice recording
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<number | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleImageUpload = useCallback((image: UploadedImage) => {
    setUploadedImage(image);
    setAnalyzeAndGenerate(false);
  }, []);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
    if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
    }
    if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
    }
    setIsRecording(false);
    setRecordingTime(0);
  }, []);
  
  const handleAudioTypeChange = (newType: AudioSourceType) => {
    setAudioType(newType);
    // Reset all audio-related states when switching types
    setUploadedAudio(null);
    setSoundEffect('None');
    setTextToSpeech('');
    handleStopRecording();
  };
  
  const handleAudioUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'audio/mpeg' || file.type === 'audio/webm')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        setUploadedAudio({ file, base64 });
      };
      reader.readAsDataURL(file);
    } else {
        alert('Please select a valid MP3 or WEBM file.');
    }
  }, []);

  const handleStartRecording = useCallback(async () => {
    if (isRecording) return;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        const audioChunks: Blob[] = [];

        recorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        recorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioFile = new File([audioBlob], "voice_recording.webm", { type: "audio/webm" });
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = (e.target?.result as string).split(',')[1];
                setUploadedAudio({ file: audioFile, base64 });
            };
            reader.readAsDataURL(audioFile);
            
            // Release microphone
            stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setIsRecording(true);
        setRecordingTime(0);

        recordingIntervalRef.current = window.setInterval(() => {
            setRecordingTime((prev) => prev + 1);
        }, 1000);
        
        recordingTimeoutRef.current = setTimeout(() => {
            handleStopRecording();
        }, 8000);

    } catch (err) {
        console.error("Microphone access denied:", err);
        setError("Microphone access is required to record audio. Please enable it in your browser settings and try again.");
    }
  }, [isRecording, handleStopRecording]);

  const handleReset = useCallback(() => {
    setPrompt('');
    setMood('Cinematic');
    setStyle('Hyper-realistic');
    setAspectRatio('16:9');
    setResolution('HD');
    setIntro('None');
    setAnimationText('');
    setTextColor('#FFFFFF');
    setTextBackgroundColor('#000000');
    setTextBackgroundOpacity(50);
    setTextBackgroundBlur(5);
    setTextAnimationStyle('Fade In');
    setTextAnimationSpeed('Normal');
    setTextAnimationDuration(3);
    setUploadedImage(null);
    setUploadedAudio(null);
    setAudioVolume(50);
    setSoundEffect('None');
    setSoundEffectIntensity(50);
    setTextToSpeech('');
    setAudioType('none');
    setMotionBlur(false);
    setVignette(false);
    setFilmGrain(false);
    setParticleType('None');
    setParticleDensity(50);
    setImageFilter('None');
    setAnalyzeAndGenerate(false);
    setIsLoading(false);
    setVideoUrl(null);
    setError(null);
    handleStopRecording();
  }, [handleStopRecording]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt && !uploadedImage) {
      setError('Please provide a prompt or an image to generate a video.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      let videoParams;

      if (analyzeAndGenerate && uploadedImage) {
          const analysis = await analyzeImageForVideoPrompt(uploadedImage);
          videoParams = {
              prompt: analysis.prompt,
              mood: analysis.mood,
              style: analysis.style,
              aspectRatio: aspectRatio,
              resolution: resolution,
              image: uploadedImage,
          };
      } else {
          const selectedSound = SOUND_EFFECT_OPTIONS.find(opt => opt.value === soundEffect);
          videoParams = {
            prompt,
            mood,
            style,
            aspectRatio,
            resolution,
            intro,
            animationText,
            textColor: animationText ? textColor : undefined,
            textBackgroundColor: animationText ? textBackgroundColor : undefined,
            textBackgroundOpacity: animationText ? textBackgroundOpacity : undefined,
            textBackgroundBlur: animationText ? textBackgroundBlur : undefined,
            textAnimationStyle: animationText ? textAnimationStyle : undefined,
            textAnimationSpeed: animationText ? textAnimationSpeed : undefined,
            textAnimationDuration: animationText ? textAnimationDuration : undefined,
            image: uploadedImage ?? undefined,
            audio: audioType === 'upload' || audioType === 'record' ? uploadedAudio ?? undefined : undefined,
            audioVolume: audioType === 'upload' || audioType === 'record' ? audioVolume : undefined,
            soundEffectDescription: audioType === 'soundEffect' && selectedSound && selectedSound.value !== 'None' ? selectedSound.label : undefined,
            soundEffectIntensity: audioType === 'soundEffect' ? soundEffectIntensity : undefined,
            textToSpeech: audioType === 'tts' && textToSpeech.trim() ? textToSpeech : undefined,
            motionBlur,
            vignette,
            filmGrain,
            particleType: particleType !== 'None' ? particleType : undefined,
            particleDensity: particleType !== 'None' ? particleDensity : undefined,
            imageFilter: imageFilter !== 'None' ? imageFilter : undefined,
          };
      }

      const generatedUrl = await generateVideo(videoParams);
      setVideoUrl(generatedUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderAudioOptions = () => {
    switch (audioType) {
        case 'soundEffect':
            return (
                <div className="space-y-4 animate-fade-in">
                    <div>
                        <label htmlFor="sound-effect" className="block text-sm font-medium text-gray-300 mb-2">Choose a sound effect</label>
                        <select
                            id="sound-effect"
                            value={soundEffect}
                            onChange={(e) => setSoundEffect(e.target.value as SoundEffect)}
                            className="block w-full bg-brand-gray border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-purple focus:border-brand-purple text-white"
                        >
                            {SOUND_EFFECT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    {soundEffect !== 'None' && (
                        <div>
                            <label htmlFor="sound-intensity" className="block text-sm font-medium text-gray-300 mb-2">
                                Sound Effect Intensity: <span className="font-bold text-brand-purple-light">{soundEffectIntensity}%</span>
                            </label>
                            <input
                                id="sound-intensity" type="range" min="0" max="100" step="1"
                                value={soundEffectIntensity}
                                onChange={(e) => setSoundEffectIntensity(parseInt(e.target.value, 10))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-purple"
                            />
                        </div>
                    )}
                </div>
            );
        case 'upload':
            return (
                <div className="space-y-4 animate-fade-in">
                    {uploadedAudio ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-brand-gray rounded-lg px-4 py-2">
                                <div className="flex items-center gap-3">
                                    <MusicIcon className="w-5 h-5 text-brand-purple-light" />
                                    <p className="text-sm text-gray-200 font-medium truncate">{uploadedAudio.file.name}</p>
                                </div>
                                <button onClick={() => setUploadedAudio(null)} type="button" className="text-sm text-gray-400 hover:text-white">Remove</button>
                            </div>
                            <div>
                                <label htmlFor="audio-volume" className="block text-sm font-medium text-gray-300 mb-2">
                                    Audio Volume: <span className="font-bold text-brand-purple-light">{audioVolume}%</span>
                                </label>
                                <input
                                    id="audio-volume" type="range" min="0" max="100" step="1"
                                    value={audioVolume}
                                    onChange={(e) => setAudioVolume(parseInt(e.target.value, 10))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-purple"
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="audio-upload" className="block text-sm font-medium text-gray-300 mb-2">Upload your own MP3</label>
                            <input
                                id="audio-upload" type="file" accept=".mp3,audio/mpeg,.webm"
                                onChange={handleAudioUpload}
                                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-purple file:text-white hover:file:bg-brand-purple-light cursor-pointer"
                            />
                        </div>
                    )}
                </div>
            );
        case 'tts':
            return (
                <div className="animate-fade-in">
                    <label htmlFor="text-to-speech" className="block text-sm font-medium text-gray-300 mb-2">
                        Generate audio from text
                    </label>
                    <textarea
                        id="text-to-speech" rows={3}
                        value={textToSpeech}
                        onChange={(e) => setTextToSpeech(e.target.value)}
                        placeholder="Enter text here to generate a voiceover..."
                        className="w-full bg-brand-gray border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-brand-purple text-white placeholder-gray-500"
                    />
                </div>
            );
        case 'record':
            return (
                <div className="animate-fade-in">
                    {isRecording ? (
                        <div className="space-y-3 text-center">
                            <div className="font-medium text-gray-300">Recording... {recordingTime}s / 8s</div>
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div className="bg-red-600 h-2.5 rounded-full transition-all duration-1000 linear" style={{ width: `${(recordingTime / 8) * 100}%` }}></div>
                            </div>
                            <button
                                type="button"
                                onClick={handleStopRecording}
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                            >
                                Stop Recording
                            </button>
                        </div>
                    ) : uploadedAudio ? (
                        <div className="space-y-4">
                           <div className="flex items-center justify-between bg-brand-gray rounded-lg px-4 py-2">
                                <div className="flex items-center gap-3">
                                    <MicIcon className="w-5 h-5 text-brand-purple-light" />
                                    <p className="text-sm text-gray-200 font-medium truncate">{uploadedAudio.file.name}</p>
                                </div>
                                <button onClick={() => setUploadedAudio(null)} type="button" className="text-sm text-gray-400 hover:text-white">Remove</button>
                            </div>
                            <div>
                                <label htmlFor="audio-volume" className="block text-sm font-medium text-gray-300 mb-2">
                                    Voiceover Volume: <span className="font-bold text-brand-purple-light">{audioVolume}%</span>
                                </label>
                                <input
                                    id="audio-volume" type="range" min="0" max="100" step="1"
                                    value={audioVolume}
                                    onChange={(e) => setAudioVolume(parseInt(e.target.value, 10))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-purple"
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Record your voice (max 8s)</label>
                            <button
                                type="button"
                                onClick={handleStartRecording}
                                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-white bg-brand-gray hover:bg-gray-700"
                            >
                                <MicIcon className="w-5 h-5 mr-2" />
                                Start Recording
                            </button>
                        </div>
                    )}
                </div>
            );
        default:
            return null;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <Loader />;
    }
    if (videoUrl) {
      const selectedSound = SOUND_EFFECT_OPTIONS.find(opt => opt.value === soundEffect);
      
      let finalAudioUrl: string | null = null;
      if (audioType === 'upload' || audioType === 'record') {
        finalAudioUrl = uploadedAudio ? URL.createObjectURL(uploadedAudio.file) : null;
      } else if (audioType === 'soundEffect') {
        finalAudioUrl = selectedSound?.url || null;
      }

      const speechText = audioType === 'tts' && textToSpeech.trim() ? textToSpeech : null;
      
      return <VideoPlayer videoUrl={videoUrl} onReset={handleReset} audioUrl={speechText ? null : finalAudioUrl} speechText={speechText} audioVolume={(audioType === 'upload' || audioType === 'record') ? audioVolume : undefined} />;
    }
    return (
      <div className="w-full max-w-3xl mx-auto animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-2 tracking-tight">
          Cinematic Video Generator
        </h1>
        <p className="text-lg text-gray-400 text-center mb-10">
          Bring your ideas to life. Describe a scene, upload an image, and let AI create a stunning video clip for you.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="p-8 bg-brand-gray rounded-xl shadow-lg space-y-6">
            <div>
              <label htmlFor="prompt" className="block text-lg font-medium text-gray-200 mb-2">
                1. Describe your scene
              </label>
              <textarea
                id="prompt"
                rows={3}
                className="w-full bg-brand-gray-light border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-brand-purple text-white placeholder-gray-500"
                placeholder="e.g., A robot holding a red skateboard in a futuristic city"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            
            <div>
               <label className="block text-lg font-medium text-gray-200 mb-2">
                2. Add a starting image (Optional)
              </label>
              {uploadedImage ? (
                 <div className="relative group">
                   <img src={uploadedImage.previewUrl} alt="Uploaded preview" className="w-full h-auto max-h-80 object-contain rounded-lg shadow-md" />
                   <button
                     onClick={() => setUploadedImage(null)}
                     className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                     aria-label="Remove image"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                     </svg>
                   </button>
                 </div>
              ) : (
                <ImageUploader onImageUpload={handleImageUpload} />
              )}
            </div>
          </div>
          
          {uploadedImage && (
            <div className="p-6 bg-brand-gray rounded-xl shadow-lg animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <label htmlFor="analyze-toggle" className="font-medium text-gray-200 text-lg">
                    ✨ Analyze Image for Prompt
                  </label>
                  <p className="text-sm text-gray-400">Let AI create the prompt for you. Other creative options will be disabled.</p>
                </div>
                <label htmlFor="analyze-toggle" className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="analyze-toggle"
                    className="sr-only peer"
                    checked={analyzeAndGenerate}
                    onChange={(e) => setAnalyzeAndGenerate(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-purple-light peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-purple"></div>
                </label>
              </div>
            </div>
          )}

          <div className="p-8 bg-brand-gray rounded-xl shadow-lg space-y-8">
            <h2 className="text-lg font-medium text-gray-200">
              3. Customize Your Video
            </h2>
            
            <fieldset disabled={analyzeAndGenerate}>
              <div className={`space-y-8 transition-opacity ${analyzeAndGenerate ? 'opacity-50' : ''}`}>
                <OptionSelector
                  label="Mood"
                  options={MOOD_OPTIONS}
                  selectedValue={mood}
                  onChange={(value) => setMood(value)}
                  type="select"
                />
                
                <OptionSelector
                  label="Artistic Style"
                  options={STYLE_OPTIONS}
                  selectedValue={style}
                  onChange={(value) => setStyle(value)}
                  type="radio"
                />

                <div className="space-y-6">
                    <label className="block text-sm font-medium text-gray-300">
                        (Optional) Animated Text Overlay
                    </label>
                    <input
                        id="animation-text"
                        type="text"
                        value={animationText}
                        onChange={(e) => setAnimationText(e.target.value)}
                        placeholder="e.g., Summer Vibes"
                        className="block w-full bg-brand-gray-light border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-purple focus:border-brand-purple text-white placeholder-gray-500"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="text-color" className="block text-sm font-medium text-gray-300 mb-2">
                                Text Color
                            </label>
                            <input
                                id="text-color"
                                type="color"
                                value={textColor}
                                onChange={(e) => setTextColor(e.target.value)}
                                className="w-full h-10 p-1 bg-brand-gray-light border border-gray-600 rounded-md cursor-pointer"
                            />
                        </div>
                        <div>
                            <label htmlFor="text-bg-color" className="block text-sm font-medium text-gray-300 mb-2">
                                Background Color
                            </label>
                            <input
                                id="text-bg-color"
                                type="color"
                                value={textBackgroundColor}
                                onChange={(e) => setTextBackgroundColor(e.target.value)}
                                className="w-full h-10 p-1 bg-brand-gray-light border border-gray-600 rounded-md cursor-pointer"
                            />
                        </div>
                        <OptionSelector
                            label="Animation Style"
                            options={TEXT_ANIMATION_STYLE_OPTIONS}
                            selectedValue={textAnimationStyle}
                            onChange={(value) => setTextAnimationStyle(value)}
                            type="select"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="text-bg-opacity" className="block text-sm font-medium text-gray-300 mb-2">
                                Background Opacity: <span className="font-bold text-brand-purple-light">{textBackgroundOpacity}%</span>
                            </label>
                            <input
                                id="text-bg-opacity"
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={textBackgroundOpacity}
                                onChange={(e) => setTextBackgroundOpacity(parseInt(e.target.value, 10))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-purple"
                            />
                        </div>
                        <div>
                            <label htmlFor="text-bg-blur" className="block text-sm font-medium text-gray-300 mb-2">
                                Background Blur: <span className="font-bold text-brand-purple-light">{textBackgroundBlur}px</span>
                            </label>
                            <input
                                id="text-bg-blur"
                                type="range"
                                min="0"
                                max="20"
                                step="1"
                                value={textBackgroundBlur}
                                onChange={(e) => setTextBackgroundBlur(parseInt(e.target.value, 10))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-purple"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <OptionSelector
                            label="Animation Speed"
                            options={TEXT_ANIMATION_SPEED_OPTIONS}
                            selectedValue={textAnimationSpeed}
                            onChange={(value) => setTextAnimationSpeed(value)}
                            type="radio"
                        />
                        <div>
                            <label htmlFor="text-duration" className="block text-sm font-medium text-gray-300 mb-2">
                                Animation Duration: <span className="font-bold text-brand-purple-light">{textAnimationDuration}s</span>
                            </label>
                            <input
                                id="text-duration"
                                type="range"
                                min="1"
                                max="10"
                                step="0.5"
                                value={textAnimationDuration}
                                onChange={(e) => setTextAnimationDuration(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-purple"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        (Optional) Audio Options (influences mood)
                    </label>
                    <div className="p-4 bg-brand-gray-light rounded-lg space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {AUDIO_SOURCE_OPTIONS.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleAudioTypeChange(option.id)}
                                    className={`px-4 py-2 text-sm rounded-full transition-all duration-200 transform ${
                                        audioType === option.id
                                            ? 'bg-brand-purple text-white font-semibold shadow-lg scale-105 ring-2 ring-brand-purple-light/70'
                                            : 'bg-brand-gray text-gray-300 hover:bg-gray-600 hover:scale-105'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                        <div className="pt-4 min-h-[50px]">
                            {renderAudioOptions()}
                        </div>
                    </div>
                </div>

                <OptionSelector
                    label="Intro Sequence"
                    options={INTRO_TYPE_OPTIONS}
                    selectedValue={intro}
                    onChange={(value) => setIntro(value)}
                    type="radio"
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-brand-gray-light rounded-lg">
                      <div className="flex flex-col">
                          <label htmlFor="motion-blur" className="font-medium text-gray-200">
                          Motion Blur
                          </label>
                          <p className="text-sm text-gray-400">Adds a dynamic blur to moving elements.</p>
                      </div>
                      <label htmlFor="motion-blur-toggle" className="relative inline-flex items-center cursor-pointer">
                          <input 
                              type="checkbox" 
                              id="motion-blur-toggle" 
                              className="sr-only peer"
                              checked={motionBlur}
                              onChange={(e) => setMotionBlur(e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-purple-light peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-purple"></div>
                      </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-brand-gray-light rounded-lg">
                        <div className="flex flex-col">
                            <label htmlFor="vignette-toggle-label" className="font-medium text-gray-200">
                            Vignette
                            </label>
                            <p className="text-sm text-gray-400">Adds dark corners for a dramatic focus.</p>
                        </div>
                        <label htmlFor="vignette-toggle" className="relative inline-flex items-center cursor-pointer">
                            <input
                            type="checkbox"
                            id="vignette-toggle"
                            className="sr-only peer"
                            checked={vignette}
                            onChange={(e) => setVignette(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-purple-light peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-purple"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-brand-gray-light rounded-lg">
                        <div className="flex flex-col">
                            <label htmlFor="film-grain-toggle-label" className="font-medium text-gray-200">
                            Film Grain
                            </label>
                            <p className="text-sm text-gray-400">Adds a classic, cinematic grain effect.</p>
                        </div>
                        <label htmlFor="film-grain-toggle" className="relative inline-flex items-center cursor-pointer">
                            <input
                            type="checkbox"
                            id="film-grain-toggle"
                            className="sr-only peer"
                            checked={filmGrain}
                            onChange={(e) => setFilmGrain(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-purple-light peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-purple"></div>
                        </label>
                    </div>
                    <div className="p-4 bg-brand-gray-light rounded-lg">
                        <OptionSelector
                            label="Image Filter"
                            options={IMAGE_FILTER_OPTIONS}
                            selectedValue={imageFilter}
                            onChange={(value) => setImageFilter(value)}
                            type="select"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-300">
                    (Optional) Add Particle Effects
                  </label>
                  <div className="p-4 bg-brand-gray-light rounded-lg space-y-4">
                    <OptionSelector
                      label="Particle Type"
                      options={PARTICLE_TYPE_OPTIONS}
                      selectedValue={particleType}
                      onChange={(value) => setParticleType(value)}
                      type="select"
                    />
                    {particleType !== 'None' && (
                      <div>
                        <label htmlFor="particle-density" className="block text-sm font-medium text-gray-300 mb-2">
                          Particle Density: <span className="font-bold text-brand-purple-light">{particleDensity}%</span>
                        </label>
                        <input
                          id="particle-density"
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={particleDensity}
                          onChange={(e) => setParticleDensity(parseInt(e.target.value, 10))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-purple"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </fieldset>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <OptionSelector
                    label="Aspect Ratio"
                    options={ASPECT_RATIO_OPTIONS}
                    selectedValue={aspectRatio}
                    onChange={(value) => setAspectRatio(value)}
                    type="radio"
                />
                 <OptionSelector
                    label="Resolution"
                    options={RESOLUTION_OPTIONS}
                    selectedValue={resolution}
                    onChange={(value) => setResolution(value)}
                    type="radio"
                />
            </div>
          </div>

          {error && <p className="text-red-500 text-center font-semibold">{error}</p>}
          
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isLoading || (!prompt && !uploadedImage)}
              className="inline-flex items-center justify-center w-full max-w-xs px-8 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-brand-purple hover:bg-brand-purple-light disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {isLoading ? 'Generating...' : 'Generate Video'}
            </button>
          </div>
        </form>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-brand-gray-dark text-white font-sans flex items-center justify-center p-4">
      {renderContent()}
    </div>
  );
}

export default App;