chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  addImagesToContainer(message)
  sendResponse('OK')
})

const addImagesToContainer = (urls) => {
  if (!urls || !urls.length) return

  const container = document.querySelector('.container')
  urls.forEach((url) => addImageNode(container, url))
}

const addImageNode = (container, url) => {
  const div = document.createElement('div')
  div.className = 'imageDiv'
  const img = document.createElement('img')
  img.src = url
  div.appendChild(img)
  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.setAttribute('url', url)
  div.appendChild(checkbox)
  container.appendChild(div)
}

document.getElementById('selectAll').addEventListener('change', (event) => {
  const items = document.querySelectorAll('.container input')
  for (const item of items) {
    item.checked = event.target.checked
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

const createArchive = async (urls) => {
  const zip = new JSZip()

  for (const index in urls) {
    try {
      const url = urls[index]
      const response = await fetch(url)
      const blob = await response.blob()
      zip.file(getFileName(index, blob), blob)
    } catch (error) {
      console.error(error)
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
