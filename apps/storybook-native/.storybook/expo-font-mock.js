const loadAsync = async () => Promise.resolve();
const isLoaded = () => true;
const isLoading = () => false;

module.exports = {
  loadAsync,
  isLoaded,
  isLoading,
  default: { loadAsync, isLoaded, isLoading },
};
