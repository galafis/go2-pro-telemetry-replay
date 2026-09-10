export default {
  slug: 'go2-pro-telemetry-replay',
  title: 'Go2 PRO Telemetry Replay',
  group: 'Unitree Go2 PRO',
  color: '#2367a1',
  tagline: {
    en: 'Inspect recorded trajectories and expose gaps in the evidence.',
    pt: 'Inspecione trajetórias registradas e identifique lacunas nos dados.',
  },
  description:
    'EN: Offline telemetry replay prototype with a Unitree Go2 PRO roadmap. PT: Protótipo de reprodução de telemetria com plano de desenvolvimento para o Unitree Go2 PRO.',
  topics: ['unitree-go2', 'robotics', 'telemetry', 'replay', 'data-quality', 'javascript'],
  setting: {
    key: 'maxGapMs',
    label: {
      en: 'Maximum sample gap (ms)',
      pt: 'Intervalo máximo entre amostras (ms)',
    },
    min: 1,
    max: 60000,
    step: 1,
  },
};
