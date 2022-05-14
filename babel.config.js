module.exports = function config(api) {
  api.cache(true);
  const presets = [
    '@babel/env',
    '@babel/preset-react',
    '@babel/preset-typescript'
  ];
  const plugins = [
    '@babel/plugin-proposal-class-properties'
  ];
  return {
    presets,
    plugins
  };
};
