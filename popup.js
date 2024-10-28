document.getElementById('grabBtn').addEventListener('click', async () => {
  const tabs = await chrome.tabs.query({ active: true })
  const activeTab = tabs[0]

  if (!activeTab) {
    alert('There are no active tabs')
    return
  }

  executeScript(activeTab)
})

const executeScript = (tab) => {
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id, allFrames: true },
      func: extractImageUrls,
    },
    handleResult,
  )
}

const extractImageUrls = () => {
  const images = document.querySelectorAll('img')
  return Array.from(images).map((image) => image.src)
}

const handleResult = (result) => {
  const imageUrls = result
    .map((frameResult) => frameResult.result)
    .reduce((urls, frameUrls) => urls.concat(frameUrls), [])

  openImagesPage(imageUrls)
}

const openImagesPage = (urls) => {
  chrome.tabs.create({ url: 'page.html', active: false }, (tab) => {
    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
      if (tabId === tab.id && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener)
        chrome.tabs.sendMessage(tab.id, urls, (response) => {
          chrome.tabs.update(tab.id, { active: true })
        })
      }
    })
  })
}
