import { useState, useEffect } from 'react';
import * as THREE from 'three';

// Create a single-pixel blank texture as a temporary/fallback placeholder
// so that the material always has a valid map reference and never crashes
let blankTexture: THREE.Texture | null = null;
function getBlankTexture(): THREE.Texture {
  if (!blankTexture) {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#1e293b'; // slate dark color
      ctx.fillRect(0, 0, 2, 2);
    }
    blankTexture = new THREE.CanvasTexture(canvas);
  }
  return blankTexture;
}

export function useSafeTexture(url: string | string[]): any {
  const isArray = Array.isArray(url);
  const urls = isArray ? url : [url];
  
  const [textures, setTextures] = useState<THREE.Texture[]>(() => 
    urls.map(() => getBlankTexture())
  );

  useEffect(() => {
    if (!urls.length) return;

    let isMounted = true;
    const loader = new THREE.TextureLoader();
    const loadedList: THREE.Texture[] = [...textures];

    urls.forEach((singleUrl, index) => {
      if (!singleUrl) return;

      loader.load(
        singleUrl,
        (tex) => {
          if (!isMounted) return;
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.RepeatWrapping;
          loadedList[index] = tex;
          
          // Trigger state update
          setTextures([...loadedList]);
        },
        undefined,
        (err) => {
          console.warn(`[useSafeTexture] Failed to load texture from "${singleUrl}". Falling back to solid color.`, err);
        }
      );
    });

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(urls)]);

  return isArray ? textures : textures[0];
}
