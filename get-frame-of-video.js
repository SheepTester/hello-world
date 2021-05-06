{
const video = document.querySelector('video')
const canvas = document.createElement('canvas')
const c = canvas.getContext('2d')
canvas.width = video.videoWidth
canvas.height = video.videoHeight
c.drawImage(video, 0, 0)
document.body.textContent = ''
document.body.append(Object.assign(document.createElement('img'), {
  src: canvas.toDataURL()
}))
}
