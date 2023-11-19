export const debounce = (callbackFunction, delay = 1000) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      callbackFunction.apply(null, args);
    }, delay);
  };
};
