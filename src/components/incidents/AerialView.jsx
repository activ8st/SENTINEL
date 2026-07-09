import React, { useState, useEffect, useRef } from 'react';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'INSERT_YOUR_API_KEY';

export default function AerialView({ address }) {
  const [videoUrl, setVideoUrl] = useState(null);
  const [status, setStatus] = useState('LOADING'); // LOADING, PROCESSING, NOT_FOUND, READY
  const videoRef = useRef(null);

  useEffect(() => {
    if (!address) return;

    let isMounted = true;

    async function fetchVideo() {
      setStatus('LOADING');
      try {
        const urlParameter = new URLSearchParams();
        urlParameter.set('address', address);
        urlParameter.set('key', API_KEY);
        
        const response = await fetch(`https://aerialview.googleapis.com/v1/videos:lookupVideo?${urlParameter.toString()}`);
        const videoResult = await response.json();

        if (!isMounted) return;

        if (videoResult.state === 'PROCESSING') {
          setStatus('PROCESSING');
        } else if (videoResult.error && videoResult.error.code === 404) {
          setStatus('NOT_FOUND');
        } else if (videoResult.uris?.MP4_MEDIUM?.landscapeUri) {
          setVideoUrl(videoResult.uris.MP4_MEDIUM.landscapeUri);
          setStatus('READY');
        } else {
          setStatus('NOT_FOUND');
        }
      } catch (error) {
        if (isMounted) setStatus('NOT_FOUND');
      }
    }

    fetchVideo();
    return () => { isMounted = false; };
  }, [address]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  return (
    <div className="w-full h-full min-h-[250px] flex items-center justify-center bg-gray-900 rounded-xl overflow-hidden relative border border-gray-700 shadow-inner">
      {status === 'LOADING' && (
        <div className="text-gray-400 flex flex-col items-center p-6">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium">Ricerca drone in corso...</p>
        </div>
      )}
      
      {status === 'PROCESSING' && (
        <div className="text-gray-400 text-center px-6 py-8">
          <p className="font-semibold text-yellow-500 mb-2">Video in elaborazione</p>
          <p className="text-sm">Google sta generando il video 3D per questo indirizzo. Riprova più tardi.</p>
        </div>
      )}

      {status === 'NOT_FOUND' && (
        <div className="text-gray-400 text-center px-6 py-8">
          <p className="font-semibold text-red-400 mb-2">Non disponibile</p>
          <p className="text-sm">Aerial View non ha ancora coperto quest'area o manca la chiave API.</p>
        </div>
      )}

      {status === 'READY' && videoUrl && (
        <video 
          ref={videoRef}
          src={videoUrl} 
          className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" 
          muted 
          autoPlay 
          loop 
          onClick={togglePlay}
        >
          Il tuo browser non supporta HTML5 video.
        </video>
      )}
    </div>
  );
}
