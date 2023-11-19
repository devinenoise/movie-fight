import { debounce } from './utils.js';

/**
 *
 * @param {object} config
 */
export const createAutoComplete = ({
  root,
  renderOption,
  onOptionSelect,
  inputValue,
  fetchData
}) => {
  // injection point
  root.innerHTML = `
  <label><h2>Search</h2></label>
  <input class="input" />
  <div class="dropdown">
    <div class="dropdown-menu">
      <div class="dropdown-content results"></div>
    </div>
  </div>
`;

  const input = root.querySelector('input');
  const dropdown = root.querySelector('.dropdown');
  const resultsWrapper = root.querySelector('.results');

  // fetchData() is async so onInput needs to be async/await
  const onInput = async event => {
    const items = await fetchData(event.target.value);
    if (!items.length) {
      // hide the dropdown
      dropdown.classList.remove('is-active');
      return;
    }
    // reset search results
    resultsWrapper.innerHTML = '';
    // display the dropdown
    dropdown.classList.add('is-active');

    for (let item of items) {
      const option = document.createElement('a');

      option.classList.add('dropdown-item');
      option.innerHTML = renderOption(item);

      // clicking an option changes the input value to the item title
      option.addEventListener('click', () => {
        dropdown.classList.remove('is-active');
        input.value = inputValue(item);
        onOptionSelect(item);
      });
      resultsWrapper.appendChild(option);
    }
  };

  input.addEventListener('input', debounce(onInput, 500));

  // hide the results menu when clicking outside of it
  document.addEventListener('click', event => {
    if (!root.contains(event.target)) {
      dropdown.classList.remove('is-active');
    }
  });
};
