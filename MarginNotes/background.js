chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'saveWithContext',
    title: 'Сохранить с контекстом',
    contexts: ['selection']
  });
});
