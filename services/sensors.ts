import { Accelerometer } from 'expo-sensors';
import { Subscription } from 'expo-modules-core';

let subscription: Subscription | null = null;
const THRESHOLD = 3.5; // G-force threshold for accident detection

export const startAccidentDetection = (onImpact: () => void) => {
  if (subscription) return;

  Accelerometer.setUpdateInterval(100);

  subscription = Accelerometer.addListener(data => {
    const { x, y, z } = data;
    const totalForce = Math.sqrt(x * x + y * y + z * z);

    if (totalForce > THRESHOLD) {
      onImpact();
    }
  });
};

export const stopAccidentDetection = () => {
  if (subscription) {
    subscription.remove();
    subscription = null;
  }
};
