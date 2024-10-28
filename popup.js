document.getElementById('grabBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  if (!tab) {
    alert('No active tab')
    return
  }

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id, allFrames: true },
      func: grabImageUrls,
    },
    handleResult,
  )
})

const grabImageUrls = () => {
  const images = document.querySelectorAll('img')
  return Array.from(images).map((image) => image.src)
}

const handleResult = (results) => {
  const imageUrls = results
    .flatMap((result) => result.result)
    .filter((url) => url)

  alert(`Found ${imageUrls.length} images`)

  if (imageUrls.length === 0) {
    alert('No images found on the page')
    return
  }

  openImagesPage(imageUrls)
}

const openImagesPage = (imageUrls) => {
  chrome.tabs.create({ url: 'page.html', active: false }, (tab) => {
    chrome.tabs.sendMessage(tab.id, imageUrls, () => {
      chrome.tabs.update(tab.id, { active: true })
    })
  })
}
