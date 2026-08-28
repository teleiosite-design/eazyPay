import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

interface OfflineQrCodeProps {
  payload: string;
  size?: number;
}

// Simple deterministic pseudo-QR grid generator for offline token rendering
export const OfflineQrCode: React.FC<OfflineQrCodeProps> = ({ payload, size = 200 }) => {
  const gridSize = 25;
  const cellSize = size / gridSize;

  // Simple hash to generate a deterministic pattern from payload string
  const getCellState = (r: number, c: number): boolean => {
    // 1. Finder patterns at 3 corners
    if ((r < 7 && c < 7) || (r < 7 && c >= gridSize - 7) || (r >= gridSize - 7 && c < 7)) {
      if ((r === 0 || r === 6 || c === 0 || c === 6) && (r < 7 && c < 7)) return true;
      if ((r === 0 || r === 6 || c === gridSize - 7 || c === gridSize - 1) && (r < 7 && c >= gridSize - 7)) return true;
      if ((r === gridSize - 7 || r === gridSize - 1 || c === 0 || c === 6) && (r >= gridSize - 7 && c < 7)) return true;
      if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
      if (r >= 2 && r <= 4 && c >= gridSize - 5 && c <= gridSize - 3) return true;
      if (r >= gridSize - 5 && r <= gridSize - 3 && c >= 2 && c <= 4) return true;
      return false;
    }

    // 2. Timing patterns
    if (r === 6 || c === 6) return (r + c) % 2 === 0;

    // 3. Data grid based on string hash
    let hash = 0;
    const str = `${payload}_${r}_${c}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % 2 === 0;
  };

  const cells = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (getCellState(r, c)) {
        cells.push(
          <Rect
            key={`${r}-${c}`}
            x={c * cellSize}
            y={r * cellSize}
            width={cellSize}
            height={cellSize}
            fill="#FFFFFF"
          />
        );
      }
    }
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Rect x={0} y={0} width={size} height={size} fill="#050914" />
        {cells}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#00F2FE',
    alignSelf: 'center',
  },
});
