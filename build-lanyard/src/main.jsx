import React from 'react';
import ReactDOM from 'react-dom/client';
import Lanyard from './Lanyard';

export function initLanyard(target, options = {}) {
  const container = typeof target === 'string' ? document.getElementById(target) : target;
  if (!container) return null;

  const root = ReactDOM.createRoot(container);
  root.render(
    <Lanyard
      position={[0, 0, 20]}
      gravity={[0, -40, 0]}
      fov={25}
      transparent={true}
      frontImage={options.frontImage || 'Files/Profile.jpg'}
      backImage={options.backImage || null}
      imageFit={options.imageFit || 'cover'}
      lanyardImage={options.lanyardImage || null}
      lanyardWidth={options.lanyardWidth || 1}
      {...options}
    />
  );

  return {
    destroy() {
      root.unmount();
    }
  };
}

if (typeof window !== 'undefined') {
  window.initLanyard = initLanyard;
}
