import './css/styles.css';
import { fetchCountries } from './fetchCountries.js';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
const debounce = require('lodash.debounce');
let countryToFind = null;

const DEBOUNCE_DELAY = 300;

const refs = {
  inputEl: document.getElementById('search-box'),
  countriesList: document.querySelector('.country-list'),
  countryInfo: document.querySelector('.country-info'),
};

refs.inputEl.addEventListener('input', debounce(onInput, DEBOUNCE_DELAY));

function onInput(event) {
  countryToFind = event.target.value.trim();
  if (!countryToFind) {
    clearPage();
    return;
  }
  fetchCountries(countryToFind)
    .then(countriesArray => {
      if (countriesArray.length > 10) {
        Notify.info(
          '"Too many matches found. Please enter a more specific name."'
        );
        clearPage();
        return;
      }
      if (countriesArray.length === 1) {
        return renderExtendedCountryInfo(countriesArray[0]);
      }
      renderCountriesList(countriesArray);
    })
    .catch(error => {
      //   видати сповіщення про помилку
      clearPage();
      Notify.failure('Oops, there is no country with that name');
    });
}

function renderExtendedCountryInfo(country) {
  clearPage();
  const langKeys = Object.keys(country.languages);
  const allLanguages = [];
  for (const key of langKeys) {
    allLanguages.push(country.languages[key]);
  }
  refs.countryInfo.innerHTML = `<h1><img src=${
    country.flags.svg
  } alt="flag" width="40">${
    country.name.official
  }</h1><ul><li><span>Capital:</span>${
    country.capital
  }</li><li><span>Population:</span>${
    country.population
  }</li><li><span>Languages:</span>${allLanguages.join(', ')}</li></ul>`;
}

function renderCountriesList(countriesArray) {
  clearPage();
  const countriesListMarkup = countriesArray
    .map(country => {
      return `<li><img src=${country.flags.svg}  alt="flag" width="40" >${country.name.official}</li>`;
    })
    .join('');

  refs.countriesList.innerHTML = countriesListMarkup;
}

function clearPage() {
  refs.countriesList.innerHTML = '';
  refs.countryInfo.innerHTML = '';
}
