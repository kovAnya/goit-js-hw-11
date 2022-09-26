import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';

const formEl = document.querySelector('#search-form');
const loadMoreBtn = document.querySelector('.load-more');
const ApiKey = '30134727-fca765f7bf10fdaddeb4af19e';
const galleryEl = document.querySelector('.gallery');
let searchValue = null;
let page = 1;
let viewedHits = 0;
let gallery = new SimpleLightbox('.gallery a');

loadMoreBtn.classList.add('visually-hidden');
formEl.addEventListener('submit', onFormSubmit);

async function onFormSubmit(event) {
  event.preventDefault();
  loadMoreBtn.classList.add('visually-hidden');
  viewedHits = 0;
  page = 1;
  galleryEl.innerHTML = '';
  searchValue = event.target.elements.searchQuery.value
    .trim()
    .replaceAll(' ', '+');
  if (!searchValue) {
    return;
  }
  fetchImages(searchValue, page, true);
  loadMoreBtn.addEventListener('click', onLoadMore);
}

async function fetchImages(searchValue, page, firstFetch = false) {
  const foundInfo = await fetch(
    `https://pixabay.com/api/?key=${ApiKey}&q=${searchValue}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`
  ).then(resp => resp.json());
  const imageHitsArray = (await foundInfo).hits;
  const totalHits = (await foundInfo).totalHits;
  viewedHits += imageHitsArray.length;

  if (imageHitsArray.length === 0) {
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }

  if (firstFetch === true) {
    Notify.success(`Hooray! We found ${totalHits} images.`);
  }

  if (totalHits <= viewedHits) {
    loadMoreBtn.classList.add('visually-hidden');
    if (firstFetch === false) {
      Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } else {
    loadMoreBtn.classList.remove('visually-hidden');
  }
  renderGallery(imageHitsArray);
  gallery.refresh();
}

function renderGallery(imageHitsArray) {
  const galleryMarkup = imageHitsArray.map(
    ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    }) => {
      return `
      <a class="photo-card" href="${largeImageURL}">
    <div>
    <img src="${webformatURL}" alt="${tags}" loading="lazy"/>
    <div class="info">
    <p class="info-item">
    <b>Likes</b>
    <span>${likes}</span>
    </p>
    <p class="info-item">
    <b>Views</b>
    <span>${views}</span>
    </p>
    <p class="info-item">
    <b>Comments</b>
    <span>${comments}</span>
    </p>
    <p class="info-item">
    <b>Downloads</b>
    <span>${downloads}</span>
    </p>
    </div>
    </div>
    </a>
    `;
    }
  );
  galleryEl.insertAdjacentHTML('beforeend', galleryMarkup.join(''));
}

async function onLoadMore() {
  page += 1;
  await fetchImages(searchValue, page);
  window.scrollBy({
    top: galleryEl.firstElementChild.getBoundingClientRect().height * 2,
    behavior: 'smooth',
  });
}
