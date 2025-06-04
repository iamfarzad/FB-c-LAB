// global.d.ts

// Augment React.JSX for intrinsic elements with modern JSX transform
declare global {
  namespace React.JSX { // Using React.JSX namespace for new JSX transform
    interface IntrinsicElements {
      'gdm-live-audio': GdmLiveAudioElementProps;
      // Removed 'gdm-live-audio-visuals-3d' as it's replaced by a React component
    }
  }

  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
    Chart: any; // For Chart.js
  }
}

// Define prop types for custom elements
// Extend React.HTMLAttributes for standard HTML attributes like className, id, style
interface GdmLiveAudioElementProps extends React.HTMLAttributes<HTMLElement> {
  theme?: string; // Lit component handles string attribute to Theme enum
  ref?: React.Ref<any>; // Allow ref to be passed
}

// GdmLiveAudioVisuals3DElementProps removed

// This export statement makes this file a module.
export {};
