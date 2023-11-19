/* CSS classes are leveraging Bulma CSS */

import { createAutoComplete } from './autocomplete.js';

// reusable config object
const autoCompleteConfig = {
  renderOption(movie) {
    // check for blank poster images
    const imgSRC = movie.Poster === 'N/A' ? '' : movie.Poster;
    return `
    <img src="${imgSRC}" alt="${movie.Title} poster"/>
    <h3>${movie.Title} (${movie.Year})</h3>`;
  },
  inputValue(movie) {
    return movie.Title;
  },
  async fetchData(searchTerm) {
    const response = await axios.get('http://www.omdbapi.com', {
      params: {
        apikey: 'c1ef93bd',
        // s = search
        s: searchTerm
      }
    });
    // Check for error message in the response
    if (response.data.Error) {
      return [];
    }
    return response.data.Search;
  }
};

// left widget
createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector('#left-autocomplete'),
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden');
    onMovieSelect(movie, document.querySelector('#left-summary'), 'left');
  }
});
// right widget
createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector('#right-autocomplete'),
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden');
    onMovieSelect(movie, document.querySelector('#right-summary'), 'right');
  }
});

/**
 *
 * @param {object} movieDetail
 * @returns html template
 */
const movieTemplate = movieDetail => {
  const awards = movieDetail.Awards.split(' ').reduce((prev, word) => {
    let value = parseInt(word);
    if (isNaN(value)) {
      return prev;
    } else {
      return prev + value;
    }
  }, 0);
  const dollars = Number(movieDetail.BoxOffice.replace(/\D/g, '')) || 0;
  const metascore = Number(movieDetail.Metascore) || 0;
  const rating = Number(movieDetail.imdbRating) || 0;
  const votes = Number(movieDetail.imdbVotes.replace(/\D/g, '')) || 0;
  return `
  <article class="media">
    <figure class="media-left">
      <p class="image">
        <img src="${movieDetail.Poster}" alt="${movieDetail.Title} poster"/>
      </p>
    </figure>
    <div class="media-content">
      <div class="content">
        <h1>${movieDetail.Title}</h1>
        <h4>${movieDetail.Genre}</h4>
        <p>${movieDetail.Plot}</p>
      </div>
    </div>
  </article>
  <article data-value=${awards} class="notification is-primary">
    <p class="title">${movieDetail.Awards}</p>
    <p class="subtitle">Awards</p>
  </article>
  <article data-value=${dollars} class="notification is-primary">
    <p class="title">${movieDetail.BoxOffice}</p>
    <p class="subtitle">Box Office</p>
  </article>
  <article data-value=${metascore} class="notification is-primary">
    <p class="title">${movieDetail.Metascore}</p>
    <p class="subtitle">Metascore</p>
  </article>
  <article data-value=${rating} class="notification is-primary">
    <p class="title">${movieDetail.imdbRating}</p>
    <p class="subtitle">IMDB Rating</p>
  </article>
  <article data-value=${votes} class="notification is-primary">
    <p class="title">${movieDetail.imdbVotes}</p>
    <p class="subtitle">IMDB Votes</p>
  </article>
  `;
};

let leftMovie;
let rightMovie;

/**
 *
 * @param {string} movie
 * @param {HTMLElement} summaryElement
 * @param {string} side
 */
const onMovieSelect = async (movie, summaryElement, side) => {
  const response = await axios.get('http://www.omdbapi.com', {
    params: {
      apikey: 'c1ef93bd',
      // i = imdbID
      i: movie.imdbID
    }
  });
  summaryElement.innerHTML = movieTemplate(response.data);
  side === 'left' ? (leftMovie = response.data) : (rightMovie = response.data);
  leftMovie && rightMovie ? runComparison() : null;
};

const runComparison = () => {
  // find all 'article' elements for each side
  const leftSideStats = document.querySelectorAll(
    '#left-summary .notification'
  );
  const rightSideStats = document.querySelectorAll(
    '#right-summary .notification'
  );
  // run a comparison on the data-attributes by looping through the left side and assigning the matching right side using the index from the left side
  leftSideStats.forEach((leftStat, index) => {
    const rightStat = rightSideStats[index];
    const leftSideValue = Number(leftStat.dataset.value);
    const rightSideValue = Number(rightStat.dataset.value);
    // then apply some styling to that 'article 'element
    if (rightSideValue > leftSideValue) {
      leftStat.classList.remove('is-primary');
      leftStat.classList.add('is-warning');
    } else {
      rightStat.classList.remove('is-primary');
      rightStat.classList.add('is-warning');
    }
  });
};
