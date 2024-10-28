const grabBtn = document.getElementById('grabBtn')

grabBtn.addEventListener('click', async () => {
  const [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  })

  const tabId = currentTab ? currentTab.id : undefined
  alert(tabId ?? 'There are no active tabs')
})
