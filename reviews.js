import Swiper from 'swiper/bundle';
import 'swiper/swiper-bundle.css';

import 'izitoast/dist/css/iziToast.min.css';
import iziToast from 'izitoast';

// Пример використання iZToast
iziToast.show({
    title: 'Hello',
    message: 'Not found',
    position: 'topRight'
});

let reviews = [];

// Асинхронна функція для отримання відгуків з API
async function fetchReviews() {
  try {
    const response = await fetch('https://portfolio-js.b.goit.study/api/reviews');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log('Full API response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

// Функція для показу повідомлення про помилку
function showErrorMessage() {
  const errorMessage = document.getElementById('error-message');
  errorMessage.style.display = 'block';
}

// Функція для приховування повідомлення про помилку
function hideErrorMessage() {
  const errorMessage = document.getElementById('error-message');
  errorMessage.style.display = 'none';
}

// Функція для створення картки відгуку
function createReviewCard(review) {
  const li = document.createElement('li');
  li.classList.add('reviews-card', 'swiper-slide');

  const img = document.createElement('img');
  img.classList.add('reviews-list-avatar');
  img.src = review.avatar_url;
  img.alt = `${review.author} avatar`;
  img.width = 48;
  img.height = 48;

  const box = document.createElement('div');
  box.classList.add('reviews-box');

  const h3 = document.createElement('h3');
  h3.classList.add('name-item');
  h3.textContent = review.author;

  const p = document.createElement('p');
  p.classList.add('item-text');
  p.textContent = review.review;

  box.appendChild(h3);
  box.appendChild(p);
  li.appendChild(img);
  li.appendChild(box);

  return li;
}

// Асинхронна функція для відображення відгуків на сторінці
async function renderReviews() {
  const reviewsList = document.getElementById('reviews-list');
  reviews = await fetchReviews();
  console.log('Reviews to render:', reviews);
  if (!reviews || reviews.length === 0) {
    showErrorMessage();
  } else {
    reviews.forEach(review => {
      const reviewCard = createReviewCard(review);
      reviewsList.appendChild(reviewCard);
    });

    initSwiper(); // Ініціалізація Swiper після додавання відгуків
  }
}

// Функція для ініціалізації Swiper
function initSwiper() {
  let endReached = false; // Прапорець для відстеження досягнення кінця слайдів

  const swiper = new Swiper('.swiper-container', {
    slidesPerView: 1,
    spaceBetween: 16,
    navigation: {
      nextEl: '.custom-swiper-button-next',
      prevEl: '.custom-swiper-button-prev',
    },
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    breakpoints: {
      768: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      1440: {
        slidesPerView: 4,
        spaceBetween: 16,
      },
    },
    on: {
      init: function () {
        const prevButton = document.querySelector('.custom-swiper-button-prev');
        prevButton.disabled = true; // Дезактивація кнопки "Prev" при ініціалізації
      },
      slideChange: function () {
        const swiperInstance = this;
        const prevButton = document.querySelector('.custom-swiper-button-prev');
        const nextButton = document.querySelector('.custom-swiper-button-next');

        prevButton.disabled = swiperInstance.isBeginning;
        nextButton.disabled = false;

        hideErrorMessage();
        endReached = false; // Скидання прапорця при зміні слайду
      },
    },
  });

  const nextButton = document.querySelector('.custom-swiper-button-next');
  const prevButton = document.querySelector('.custom-swiper-button-prev');

  // Функція обробки натискання кнопки "Prev"
  function handlePrevClick() {
    hideErrorMessage(); // Приховати повідомлення про помилку при натисканні на "Prev"
  }

  // Функція обробки натискання кнопки "Next"
  function handleNextClick() {
    if (endReached) {
      showErrorMessage(); // Показати повідомлення про помилку при досягненні кінця і повторному натисканні
      nextButton.disabled = true; // Заблокувати кнопку "Next"
    } else if (swiper.isEnd) {
      endReached = true; // Виставити прапорець, якщо досягнуто кінця слайдів
      showErrorMessage(); // Показати повідомлення про помилку при першому досягненні кінця
      nextButton.disabled = true; // Заблокувати кнопку "Next"
    }
  }

  prevButton.addEventListener('click', handlePrevClick);
  nextButton.addEventListener('click', handleNextClick);

  // Обробка подій клавіатури
  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      handlePrevClick();
    } else if (event.key === 'ArrowRight') {
      handleNextClick();
    }
  });

  // Обробка гортання слайдів на мобільних пристроях
  swiper.on('touchEnd', () => {
    if (swiper.isEnd) {
      if (endReached) {
        showErrorMessage(); // Показати повідомлення про помилку при досягненні кінця і повторному гортанні
        nextButton.disabled = true; // Заблокувати кнопку "Next"
      } else {
        endReached = true; // Виставити прапорець при досягненні кінця слайдів
        showErrorMessage(); // Показати повідомлення про помилку при першому досягненні кінця
        nextButton.disabled = true; // Заблокувати кнопку "Next"
      }
    } else {
      hideErrorMessage(); // Приховати повідомлення про помилку при гортанні назад
    }
  });
}

document.addEventListener('DOMContentLoaded', renderReviews);
