const searchInput = document.getElementById('search');
const cardsContainer = document.getElementById('cards');

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('ru-RU') + ' ' + d.toLocaleTimeString('ru-RU');
}

function renderCards(cards) {
  cardsContainer.innerHTML = '';
  if (!cards || cards.length === 0) {
    cardsContainer.textContent = 'Карточек пока нет. Выделите текст и выберите «Сохранить с контекстом».';
    return;
  }

  cards.forEach(card => {
        const div = document.createElement('div');
    div.className = 'card';

    const titleEl = document.createElement('h4');
    titleEl.textContent = card.title;

    const textEl = document.createElement('div');
    textEl.className = 'card-text';
    textEl.innerHTML = mdToHtml(card.text);

    const metaEl = document.createElement('div');
    metaEl.className = 'meta';
    metaEl.innerHTML = `
      <a href="${card.url}" target="_blank" class="url">${card.url}</a>
      <span class="date">${formatDate(card.date)}</span>
    `;

    div.appendChild(titleEl);
    div.appendChild(textEl);
    div.appendChild(metaEl);

    cardsContainer.appendChild(div);

  });
}

function filterCards(query, cards) {
  if (!query) return cards;
  const q = query.toLowerCase();
  return cards.filter(c =>
    c.title.toLowerCase().includes(q) ||
    c.text.toLowerCase().includes(q) ||
    c.url.toLowerCase().includes(q)
  );
}

searchInput.addEventListener('input', (e) => {
  chrome.storage.local.get(['cards'], (result) => {
    renderCards(filterCards(e.target.value, result.cards || []));
  });
});

// Загрузка при открытии popup
chrome.storage.local.get(['cards'], (result) => {
  renderCards(result.cards || []);
});