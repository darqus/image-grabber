const grabBtn = document.getElementById('grabBtn')
grabBtn.addEventListener('click', () => {
  // Get active browser tab
  chrome.tabs.query({ active: true }, (tabs) => {
    const tab = tabs[0]
    if (tab) {
      execScript(tab)
    } else {
      alert('There are no active tabs')
    }
  })
})

const execScript = (tab) => {
  // Execute a function on a page of the current browser tab
  // and process the result of execution
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id, allFrames: true },
      func: grabImages,
    },
    onResult,
  )
}

const grabImages = () => {
  const images = document.querySelectorAll('img')
  return Array.from(images).map((image) => image.src)
}

const onResult = (frames) => {
  // If script execution failed on remote end
  // and could not return results
  if (!frames || !frames.length) {
    alert('Could not retrieve images from specified page')
    return
  }
  // Combine arrays of image URLs from
  // each frame to a single array
  const imageUrls = frames
    .map((frame) => frame.result)
    .reduce((r1, r2) => r1.concat(r2))
  // Open a page with a list of images and send urls to it
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
