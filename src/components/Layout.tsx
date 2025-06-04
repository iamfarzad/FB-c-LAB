// In your Layout component
import { GeometricAccent } from './ui/GeometricAccent';

// ... existing code

return (
  <div className="relative min-h-screen">
    {/* Top-right accent */}
    <GeometricAccent 
      theme={theme} 
      position="top-right" 
      size={500}
      opacity={0.12}
    />
    
    {/* Bottom-left accent */}
    <GeometricAccent 
      theme={theme} 
      position="bottom-left" 
      size={400}
      opacity={0.08}
    />
    
    {/* Your existing content */}
    {children}
  </div>
);
