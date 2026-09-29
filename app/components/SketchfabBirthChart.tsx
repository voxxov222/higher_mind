import React from 'react';

export const SketchfabBirthChart = ({ data }: { data: any }) => {
  return (
    <div className="sketchfab-embed-wrapper w-full h-full">
      <iframe
        title="QBL Wheel"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen; xr-spatial-tracking"
        src="https://sketchfab.com/models/6e78d63889b54a0587c70baea2a89c3a/embed?dnt=1"
        className="w-full h-full"
      ></iframe>
    </div>
  );
};
