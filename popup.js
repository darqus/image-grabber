const grabBtn = document.getElementById('grabBtn')

grabBtn.addEventListener('click', async () => {
  const [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  })

  const tabId = currentTab ? currentTab.id : undefined

  if (!tabId) {
    alert(tabId ?? 'There are no active tabs')
    return
  }

  chrome.scripting.executeScript(
    {
      target: { tabId, allFrames: true },
      func: grabImages,
    },
    onResult,
  )
})

const grabImages = () => {
  alert('Grabbing images...')
}

const onResult = (frames) => {
  alert('Result:', frames)
}
