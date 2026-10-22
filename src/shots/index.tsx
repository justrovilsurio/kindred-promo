import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { ShotKey } from '../timeline';
import { S1Open } from './S1Open';
import { S2Deal } from './S2Deal';
import { S3Filter } from './S3Filter';
import { S4Story } from './S4Story';
import { TitleCard1, TitleCard2 } from './TitleCard';
import { S5Editor } from './S5Editor';
import { S6Publish } from './S6Publish';
import { S7Sections } from './S7Sections';
import { S8Outro } from './S8Outro';

const Todo: React.FC = () => <AbsoluteFill style={{ background: '#2a3550' }} />;

export const SHOT_COMPONENTS: Record<ShotKey, React.FC> = {
  open: S1Open,
  deal: S2Deal,
  filter: S3Filter,
  story: S4Story,
  tc1: TitleCard1,
  editor: S5Editor,
  publish: S6Publish,
  tc2: TitleCard2,
  sections: S7Sections,
  outro: S8Outro,
};
