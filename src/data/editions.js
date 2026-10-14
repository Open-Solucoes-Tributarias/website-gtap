export const editions = [
  // [número, logo, pasta do álbum, largura e altura do logo, foto de capa (índice no álbum), fotógrafo]
  // Logo sem extensão = SVG em /assets/logos; com extensão, usa o arquivo como está.
  ['I', 'gtapi', 'i-gtap', 351, 114, 20],
  ['II', 'iigtap', 'ii-gtap', 351, 114, 21],
  ['III', 'iiigtap', 'iii-gtap', 351, 113, 12],
  ['IV', 'ivgtap', 'iv-gtap', 349, 106, 18],
  ['V', 'vgtap', 'v-gtap', 351, 117, 29],
  ['VI', 'vigtap', 'vi-gtap', 351, 107, 5],
  ['VII', 'viigtap', 'vii-gtap', 349, 100, 5],
  ['VIII', 'viiigtap', 'viii-gtap', 360, 99, 54],
  ['IX', 'ixgtap', 'ix-gtap', 151, 49, 5],
  ['X', 'xgtap.webp', 'x-gtap', 600, 104, 365, 'Alan Gois'],
].map(([number, logo, folder, logoWidth, logoHeight, cover, photographer]) => ({
  // Dimensões do logo: reservam o espaço antes de carregar (sem layout shift).
  editionText: `${number} GTAP`,
  logo: `/assets/logos/${/\.\w+$/.test(logo) ? logo : `${logo}.svg`}`,
  logoWidth,
  logoHeight,
  folder,
  cover,
  ...(photographer && { photographer }),
}));
