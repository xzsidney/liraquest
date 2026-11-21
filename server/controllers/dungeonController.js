/**
 * Controller de Masmorras D20 (Desativado no V2 Oficial)
 */
export const getAdventures = async (req, res) => {
  return res.json({
    success: true,
    adventures: [],
  });
};

export const getAdventureDetail = async (req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Aventura não encontrada ou módulo migrado.',
  });
};

export const startDungeonRun = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: 'Módulo de masmorras antigas desativado.',
  });
};

export const resolveDungeonAction = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: 'Módulo de masmorras antigas desativado.',
  });
};

export const getDungeonLeaderboard = async (req, res) => {
  return res.json({
    success: true,
    leaderboard: [],
  });
};
