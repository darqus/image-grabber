chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  addImagesToContainer(message)
  sendResponse('OK')
})

const addImagesToContainer = (imageUrls) => {
  if (!imageUrls || !imageUrls.length) {
    return
  }

  const container = document.querySelector('.container')
  imageUrls.forEach((url) => addImageNode(container, url))
}

const addImageNode = (container, url) => {
  const imageDiv = document.createElement('div')
  imageDiv.className = 'imageDiv'
  const img = document.createElement('img')
  img.src = url
  imageDiv.appendChild(img)
  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.setAttribute('data-url', url)
  imageDiv.appendChild(checkbox)
  container.appendChild(imageDiv)
}

document.getElementById('selectAll').addEventListener('change', (event) => {
  const checkboxes = document.querySelectorAll('.container input')
  for (const checkbox of checkboxes) {
    checkbox.checked = event.target.checked
  }
})

document.getElementById('downloadBtn').addEventListener('click', async () => {
  try {
    const selectedUrls = getSelectedImageUrls()
    const archive = await createArchive(selectedUrls)
    downloadArchive(archive)
  } catch (error) {
    alert(error.message)
  }
})

const getSelectedImageUrls = () => {
  const checkedCheckboxes = document.querySelectorAll(
    '.container input[type="checkbox"]:checked',
  )
  const selectedUrls = Array.from(checkedCheckboxes).map((checkbox) =>
    checkbox.getAttribute('data-url'),
  )
  if (!selectedUrls.length) {
    throw new Error('Please select at least one image')
  }
  return selectedUrls
}

const createArchive = async (urls) => {
  const zip = new JSZip()
  for (const url of urls) {
    const response = await fetch(url)
    const blob = await response.blob()
    const filename = url.split('/').pop()
    zip.file(filename, blob)
  }
  return zip.generateAsync({ type: 'blob' })
}

const downloadArchive = (archive) => {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(archive)
  a.download = 'images.zip'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(a.href)
}
