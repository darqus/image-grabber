document.getElementById('grabBtn').addEventListener('click', async () => {
  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  })

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

const openImagesPage = (imageUrls) => {
  chrome.tabs.create({ url: 'page.html', active: false }, (tab) => {
    const handleTabUpdate = (tabId, { status }) => {
      if (tabId === tab.id && status === 'complete') {
        chrome.tabs.onUpdated.removeListener(handleTabUpdate)
        chrome.tabs.sendMessage(tab.id, imageUrls, () => {
          chrome.tabs.update(tab.id, { active: true })
        })
      }
    }
    chrome.tabs.onUpdated.addListener(handleTabUpdate)
  })
}
