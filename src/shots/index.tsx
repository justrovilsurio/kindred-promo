import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { ShotKey } from '../timeline';
import { S1Open } from './S1Open';
import { S2Deal } from './S2Deal';

const Todo: React.FC = () => <AbsoluteFill style={{ background: '#2a3550' }} />;

export const SHOT_COMPONENTS: Record<ShotKey, React.FC> = {
  open: S1Open,
  deal: S2Deal,
  filter: Todo,
  story: Todo,
  tc1: Todo,
  editor: Todo,
  publish: Todo,
  tc2: Todo,
  sections: Todo,
  outro: Todo,
};
