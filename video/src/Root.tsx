import React from "react";
import { AbsoluteFill, Composition, Series } from "remotion";
import {
  IntroScene,
  ProblemScene,
  DiscoverScene,
  ApplyScene,
  FundedScene,
  DeliverScene,
  ProofScene,
} from "./scenes";

const FPS = 30;

// Scene durations in frames (@30fps). Sum = total composition length.
const D = {
  intro: 100,
  problem: 80,
  discover: 120,
  apply: 120,
  funded: 130,
  deliver: 120,
  proof: 130,
};
export const TOTAL = Object.values(D).reduce((a, b) => a + b, 0); // 800 frames ≈ 26.7s

const CtoFunOnboarding: React.FC = () => (
  <AbsoluteFill>
    <Series>
      <Series.Sequence durationInFrames={D.intro}>
        <IntroScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={D.problem}>
        <ProblemScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={D.discover}>
        <DiscoverScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={D.apply}>
        <ApplyScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={D.funded}>
        <FundedScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={D.deliver}>
        <DeliverScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={D.proof}>
        <ProofScene />
      </Series.Sequence>
    </Series>
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <Composition
    id="CtoFunOnboarding"
    component={CtoFunOnboarding}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
