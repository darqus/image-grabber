const grabBtn = document.getElementById('grabBtn')

grabBtn.addEventListener('click', async () => {
  const [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  })

  const tabId = currentTab ? currentTab.id : undefined

  if (!tabId) {
    alert('There are no active tabs')
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
  const images = document.querySelectorAll('img')
  return Array.from(images).map((image) => image.src)
}

const onResult = (frames) => {
  const imageUrls = frames.flatMap((frame) => frame.result).filter((url) => url)

  if (imageUrls.length === 0) {
    alert('Could not retrieve images from specified page')
    return
  }

  openImagesPage(imageUrls)
}

const openImagesPage = (imageUrls) => {
  chrome.tabs.create({ url: 'page.html' }, (tab) => {
    chrome.tabs.sendMessage(tab.id, imageUrls, () => {
      chrome.tabs.update(tab.id, { active: true })
    })
  })
}
