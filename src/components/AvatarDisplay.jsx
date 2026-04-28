import React, { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';

function AvatarDisplay({ config = {}, size = 120 }) {
  const svg = useMemo(() => {
    return createAvatar(avataaars, {
      ...config,
      size: size,
      backgroundColor: ['transparent'],
      radius: 50,
      accessoriesProbability: config?.accessories && config.accessories.length > 0 && config.accessories[0] !== 'none' ? 100 : 0
    }).toDataUri();
  }, [config, size]);

  return <img src={svg} alt="Avatar" style={{ width: size, height: size, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }} />;
}

export default AvatarDisplay;
