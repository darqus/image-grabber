chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  addImagesToContainer(message)
  sendResponse('OK')
})

const addImagesToContainer = (imageUrls) => {
  if (!imageUrls || imageUrls.length === 0) return

  const container = document.querySelector('.container')
  imageUrls.forEach((imageUrl) => addImageNode(container, imageUrl))
}

const addImageNode = (container, imageUrl) => {
  const imageDiv = document.createElement('div')
  imageDiv.className = 'imageDiv'

  const imageElement = document.createElement('img')
  imageElement.src = imageUrl
  imageDiv.appendChild(imageElement)

  const checkboxElement = document.createElement('input')
  checkboxElement.type = 'checkbox'
  checkboxElement.setAttribute('url', imageUrl)
  imageDiv.appendChild(checkboxElement)

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
    const urls = getSelectedUrls()
    const archive = await createArchive(urls)
    downloadArchive(archive)
  } catch (error) {
    alert(error.message)
  }
})

const getSelectedUrls = () => {
  const urls = Array.from(document.querySelectorAll('.container input'))
    .filter((item) => item.checked)
    .map((item) => item.getAttribute('url'))

  if (!urls || !urls.length) {
    throw new Error('Please, select at least one image')
  }

  return urls
}

const createArchive = async (imageUrls) => {
  const zip = new JSZip()

  for (const [index, imageUrl] of imageUrls.entries()) {
    try {
      const response = await fetch(imageUrl)
      const imageBlob = await response.blob()
      zip.file(getFileName(index, imageBlob), imageBlob)
    } catch (error) {
      console.error('Error fetching image:', error)
    }
  }

  return zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9,
    },
  })
}

const getFileName = (index, blob) => {
  const name = parseInt(index) + 1
  const [type, extension] = blob.type.split('/')
  if (type !== 'image' || blob.size <= 0) {
    throw new Error('Incorrect content')
  }

  return `${name}.${extension.split('+').shift()}`
}

const downloadArchive = (archive) => {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(archive)
  link.download = 'images.zip'
  document.body.appendChild(link)
  link.click()
  URL.revokeObjectURL(link.href)
  document.body.removeChild(link)
}
