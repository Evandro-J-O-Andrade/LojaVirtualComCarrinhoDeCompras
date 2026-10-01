/**
 * Angel Cosméticos — Cinema de entrada
 * Paleta e tempo da sequência de abertura. Arte dirigida, não tema do sistema.
 */

export const angelCinema = {
  /** Cor do palco por trás do frame (vinhos profundos, nunca preto puro). */
  stage: {
    void: '#1C0714',
    wine: '#3D0C26',
    wineLight: '#6D1448',
    brand: '#8E1A5C',
    cream: '#FFF8F0',
    champagne: '#C4A87C',
  },

  /**
   * Tempo da sequência, em milissegundos.
   * Total ≈ 3700ms. Ordenado do mais curto ao mais longo.
   */
  timing: {
    veilIn: 300,
    frameSettle: 2400,
    ruleDelay: 600,
    ruleDraw: 600,
    wordmarkDelay: 900,
    wordmarkIn: 1000,
    taglineDelay: 1500,
    taglineIn: 700,
    exitDelay: 2900,
    exitDuration: 800,
    total: 3700,
  },

  /** Origem do asset editorial. Native 719×1280 (9:16 retrato). */
  frameImage: '/assets/img/cinematic.png',
  frameRatio: 9 / 16,
} as const

export type AngelCinemaTiming = typeof angelCinema.timing
