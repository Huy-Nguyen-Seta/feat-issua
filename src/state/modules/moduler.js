const requireModule = require.context('.', true, /index.js$/);

const modules = {};

requireModule.keys().forEach((fileName) => {
  if (fileName === './index.js') return;
  const module = requireModule(fileName);
  modules[module.namespace] = module.default;
});

// saga moduler
const requireSagaModule = require.context('.', true, /saga.js$/);
const sagaModules = [];

requireSagaModule.keys().forEach((fileName) => {
  if (fileName === './index.js') return;
  if (!requireSagaModule(fileName).sagaFlow) return;
  sagaModules.push(requireSagaModule(fileName).sagaFlow);
});

export default modules;
export {
  sagaModules
};
