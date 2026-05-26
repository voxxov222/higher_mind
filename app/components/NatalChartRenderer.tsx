import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Html, Sphere, Trail, Float, Sparkles, Ring } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'motion/react';

export const NatalChartRenderer = ({ data, onPlanetClick }: any) => {
  return (
    <group>
      <mesh>
        <boxGeometry />
        <meshBasicMaterial color="red" />
      </mesh>
    </group>
  );
};
