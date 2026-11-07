chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectionData') {
    const selection = window.getSelection();
    if (!selection.toString().trim()) {
      sendResponse({ success: false, error: 'Нет выделенного текста' });
      return;
    }

    const text = selection.toString().trim();
    const title = document.title || 'Без заголовка';
    const url = window.location.href;
    const date = new Date().toISOString();

    sendResponse({
      success: true,
      data: { text, title, url, date }
    });
  }
});

// Обработка клика по контекстному меню
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== 'saveWithContext') return;

  chrome.tabs.sendMessage(tab.id, { action: 'getSelectionData' }, (response) => {
    if (response && response.success) {
      const card = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        text: response.data.text,
        title: response.data.title,
        url: response.data.url,
        date: response.data.date
      };

      chrome.storage.local.get(['cards'], (result) => {
        const cards = result.cards || [];
        cards.push(card);
        chrome.storage.local.set({ cards }, () => {
          // Можно добавить уведомление, если нужно
        });
      });
    } else {
      console.error(response?.error || 'Не удалось получить данные выделения');
    }
  });
});
