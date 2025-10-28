/**
 * @license
 * MIT License
 *
 * Copyright (c) 2017 Nimiq, danimoh
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export default class QrScanner {
  static DEFAULT_CANVAS_SIZE = 400
  static NO_QR_CODE_FOUND = 'No QR code found'
  static _disableBarcodeDetector = false
  static _workerMessageId = 0

  static async hasCamera() {
    try {
      return !!(await QrScanner.listCameras(false)).length
    } catch (e) {
      return false
    }
  }

  static async listCameras(requestLabels = false) {
    if (!navigator.mediaDevices) return []

    const enumerateCameras = async () =>
      (await navigator.mediaDevices.enumerateDevices()).filter(
        device => device.kind === 'videoinput'
      )

    // Note that enumerateDevices can always be called and does not prompt the user for permission.
    // However, enumerateDevices only includes device labels if served via https and an active media stream exists
    // or permission to access the camera was given. Therefore, if we're not getting labels but labels are requested
    // ask for camera permission by opening a stream.
    let openedStream
    try {
      if (
        requestLabels &&
        (await enumerateCameras()).every(camera => !camera.label)
      ) {
        openedStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: true
        })
      }
    } catch (e) {
      // Fail gracefully, especially if the device has no camera or on mobile when the camera is already in use
      // and some browsers disallow a second stream.
    }

    try {
      return (await enumerateCameras()).map((camera, i) => ({
        id: camera.deviceId,
        label: camera.label || (i === 0 ? 'Default Camera' : `Camera ${i + 1}`)
      }))
    } finally {
      // close the stream we just opened for getting camera access for listing the device labels
      if (openedStream) {
        console.warn(
          'Call listCameras after successfully starting a QR scanner to avoid creating ' +
            'a temporary video stream'
        )
        QrScanner._stopVideoStream(openedStream)
      }
    }
  }

  constructor(
    video,
    onDecode,
    options
  ) {
    this.$video = video
    this.$canvas = document.createElement('canvas')

    if (options && typeof options === 'object') {
      // we got an options object using the new api
      this._onDecode = onDecode
    }

    this._onDecodeError = (options && options.onDecodeError) || this._onDecodeError
    this._calculateScanRegion =
      (options && options.calculateScanRegion) || this._calculateScanRegion
    this._preferredCamera = (options && options.preferredCamera) || this._preferredCamera
    this._legacyCanvasSize = this._legacyCanvasSize
    this._maxScansPerSecond =
      (options && options.maxScansPerSecond) || this._maxScansPerSecond

    this._lastScanTimestamp = -1

    this._onPlay = this._onPlay.bind(this)
    this._onLoadedMetaData = this._onLoadedMetaData.bind(this)
    this._onVisibilityChange = this._onVisibilityChange.bind(this)
    this._updateOverlay = this._updateOverlay.bind(this)

    video.disablePictureInPicture = true
    video.playsInline = true
    video.muted = true

    let shouldHideVideo = false
    if (video.hidden) {
      video.hidden = false
      shouldHideVideo = true
    }
    if (!document.body.contains(video)) {
      document.body.appendChild(video)
      shouldHideVideo = true
    }
    const videoContainer = video.parentElement

    if (options && (options.highlightScanRegion || options.highlightCodeOutline)) {
      const gotExternalOverlay = !!options.overlay
      this.$overlay = options.overlay || document.createElement('div')
      const overlayStyle = this.$overlay.style
      overlayStyle.position = 'absolute'
      overlayStyle.display = 'none'
      overlayStyle.pointerEvents = 'none'
      this.$overlay.classList.add('scan-region-highlight')
      if (!gotExternalOverlay && options.highlightScanRegion) {
        this.$overlay.innerHTML =
          '<svg class="scan-region-highlight-svg" viewBox="0 0 238 238" ' +
          'preserveAspectRatio="none" style="position:absolute;width:100%;height:100%;left:0;top:0;' +
          'fill:none;stroke:#e9b213;stroke-width:4;stroke-linecap:round;stroke-linejoin:round">' +
          '<path d="M31 2H10a8 8 0 0 0-8 8v21M207 2h21a8 8 0 0 1 8 8v21m0 176v21a8 8 0 0 1-8 8h-21m-176 ' +
          '0H10a8 8 0 0 1-8-8v-21"/></svg>'
        try {
          this.$overlay.firstElementChild.animate(
            { transform: ['scale(.98)', 'scale(1.01)'] },
            {
              duration: 400,
              iterations: Infinity,
              direction: 'alternate',
              easing: 'ease-in-out'
            }
          )
        } catch (e) {}
        videoContainer.insertBefore(this.$overlay, this.$video.nextSibling)
      }
      if (options.highlightCodeOutline) {
        this.$overlay.insertAdjacentHTML(
          'beforeend',
          '<svg class="code-outline-highlight" preserveAspectRatio="none" style="display:none;width:100%;' +
            'height:100%;fill:none;stroke:#e9b213;stroke-width:5;stroke-dasharray:25;' +
            'stroke-linecap:round;stroke-linejoin:round"><polygon/></svg>'
        )
        this.$codeOutlineHighlight = this.$overlay
          .lastElementChild
      }
    }
    this._scanRegion = this._calculateScanRegion(video)

    requestAnimationFrame(() => {
      if (shouldHideVideo) {
        console.warn(
          'QrScanner has overwritten the video hiding style to avoid Safari stopping the playback.'
        )
        video.style.opacity = '0'
        video.style.width = '0'
        video.style.height = '0'
        if (this.$overlay && this.$overlay.parentElement) {
          this.$overlay.parentElement.removeChild(this.$overlay)
        }
        delete this.$overlay
        delete this.$codeOutlineHighlight
      }

      if (this.$overlay) {
        this._updateOverlay()
      }
    })

    video.addEventListener('play', this._onPlay)
    video.addEventListener('loadedmetadata', this._onLoadedMetaData)
    document.addEventListener('visibilitychange', this._onVisibilityChange)
    window.addEventListener('resize', this._updateOverlay)

    this._qrEnginePromise = QrScanner.createQrEngine()
  }

  async hasFlash() {
    let stream
    try {
      if (this.$video.srcObject) {
        if (!(this.$video.srcObject instanceof MediaStream)) return false
        stream = this.$video.srcObject
      } else {
        stream = (await this._getCameraStream()).stream
      }
      return 'torch' in stream.getVideoTracks()[0].getSettings()
    } catch (e) {
      return false
    } finally {
      if (stream && stream !== this.$video.srcObject) {
        console.warn(
          'Call hasFlash after successfully starting the scanner to avoid creating ' +
            'a temporary video stream'
        )
        QrScanner._stopVideoStream(stream)
      }
    }
  }

  isFlashOn() {
    return this._flashOn
  }

  async toggleFlash() {
    if (this._flashOn) {
      await this.turnFlashOff()
    } else {
      await this.turnFlashOn()
    }
  }

  async turnFlashOn() {
    if (this._flashOn || this._destroyed) return
    this._flashOn = true
    if (!this._active || this._paused) return
    try {
      if (!(await this.hasFlash())) throw 'No flash available'
      await this.$video.srcObject
        .getVideoTracks()[0]
        .applyConstraints({
          advanced: [{ torch: true }]
        })
    } catch (e) {
      this._flashOn = false
      throw e
    }
  }

  async turnFlashOff() {
    if (!this._flashOn) return
    this._flashOn = false
    await this._restartVideoStream()
  }

  destroy() {
    this.$video.removeEventListener('loadedmetadata', this._onLoadedMetaData)
    this.$video.removeEventListener('play', this._onPlay)
    document.removeEventListener('visibilitychange', this._onVisibilityChange)
    window.removeEventListener('resize', this._updateOverlay)

    this._destroyed = true
    this._flashOn = false
    this.stop()
    QrScanner._postWorkerMessage(this._qrEnginePromise, 'close')
  }

  async start() {
    if (this._destroyed)
      throw new Error(
        'The QR scanner can not be started as it had been destroyed.'
      )
    if (this._active && !this._paused) return

    if (window.location.protocol !== 'https:') {
      console.warn(
        'The camera stream is only accessible if the page is transferred via https.'
      )
    }

    this._active = true
    if (document.hidden) return
    this._paused = false
    if (this.$video.srcObject) {
      await this.$video.play()
      return
    }

    try {
      const { stream, facingMode } = await this._getCameraStream()
      if (!this._active || this._paused) {
        QrScanner._stopVideoStream(stream)
        return
      }
      this._setVideoMirror(facingMode)
      this.$video.srcObject = stream
      await this.$video.play()

      if (this._flashOn) {
        this._flashOn = false
        this.turnFlashOn().catch(() => {})
      }
    } catch (e) {
      if (this._paused) return
      this._active = false
      throw e
    }
  }

  stop() {
    this.pause()
    this._active = false
  }

  async pause(stopStreamImmediately = false) {
    this._paused = true
    if (!this._active) return true
    this.$video.pause()

    if (this.$overlay) {
      this.$overlay.style.display = 'none'
    }

    const stopStream = () => {
      if (this.$video.srcObject instanceof MediaStream) {
        QrScanner._stopVideoStream(this.$video.srcObject)
        this.$video.srcObject = null
      }
    }

    if (stopStreamImmediately) {
      stopStream()
      return true
    }

    await new Promise(resolve => setTimeout(resolve, 300))
    if (!this._paused) return false
    stopStream()
    return true
  }

  async setCamera(facingModeOrDeviceId) {
    if (facingModeOrDeviceId === this._preferredCamera) return
    this._preferredCamera = facingModeOrDeviceId
    await this._restartVideoStream()
  }

  static async scanImage(
    imageOrFileOrBlobOrUrl,
    options
  ) {
    let scanRegion
    scanRegion = options && options.scanRegion
    let qrEngine = options && options.qrEngine
    let canvas = options && options.canvas
    const disallowCanvasResizing = (options && options.disallowCanvasResizing) || false
    const alsoTryWithoutScanRegion = (options && options.alsoTryWithoutScanRegion) || false

    const gotExternalEngine = !!qrEngine

    try {
      let image
      let canvasContext
      ;[qrEngine, image] = await Promise.all([
        qrEngine || QrScanner.createQrEngine(),
        QrScanner._loadImage(imageOrFileOrBlobOrUrl)
      ])
      ;[canvas, canvasContext] = QrScanner._drawToCanvas(
        image,
        scanRegion,
        canvas,
        disallowCanvasResizing
      )
      let detailedScanResult

      if (qrEngine instanceof Worker) {
        const qrEngineWorker = qrEngine
        if (!gotExternalEngine) {
          QrScanner._postWorkerMessageSync(
            qrEngineWorker,
            'inversionMode',
            'both'
          )
        }
        detailedScanResult = await new Promise((resolve, reject) => {
          let timeout
          let onMessage
          let onError
          let expectedResponseId = -1
          onMessage = event => {
            if (event.data.id !== expectedResponseId) {
              return
            }
            qrEngineWorker.removeEventListener('message', onMessage)
            qrEngineWorker.removeEventListener('error', onError)
            clearTimeout(timeout)
            if (event.data.data !== null) {
              resolve({
                data: event.data.data,
                cornerPoints: QrScanner._convertPoints(
                  event.data.cornerPoints,
                  scanRegion
                )
              })
            } else {
              reject(QrScanner.NO_QR_CODE_FOUND)
            }
          }
          onError = error => {
            qrEngineWorker.removeEventListener('message', onMessage)
            qrEngineWorker.removeEventListener('error', onError)
            clearTimeout(timeout)
            const errorMessage = !error
              ? 'Unknown Error'
              : error.message || error
            reject('Scanner error: ' + errorMessage)
          }
          qrEngineWorker.addEventListener('message', onMessage)
          qrEngineWorker.addEventListener('error', onError)
          timeout = setTimeout(() => onError('timeout'), 10000)
          const imageData = canvasContext.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          )
          expectedResponseId = QrScanner._postWorkerMessageSync(
            qrEngineWorker,
            'decode',
            imageData,
            [imageData.data.buffer]
          )
        })
      } else {
        detailedScanResult = await Promise.race([
          new Promise((resolve, reject) =>
            window.setTimeout(() => reject('Scanner error: timeout'), 10000)
          ),
          (async () => {
            try {
              const [scanResult] = await qrEngine.detect(canvas)
              if (!scanResult) throw QrScanner.NO_QR_CODE_FOUND
              return {
                data: scanResult.rawValue,
                cornerPoints: QrScanner._convertPoints(
                  scanResult.cornerPoints,
                  scanRegion
                )
              }
            } catch (e) {
              const errorMessage = e.message || e
              if (errorMessage.includes('service unavailable')) {
                QrScanner._disableBarcodeDetector = true
                return QrScanner.scanImage(imageOrFileOrBlobOrUrl, options)
              }
              throw 'Scanner error: ' + errorMessage
            }
          })()
        ])
      }
      return (options && options.returnDetailedScanResult)
        ? detailedScanResult
        : detailedScanResult.data
    } catch (e) {
      if (scanRegion && alsoTryWithoutScanRegion) {
        const optionsClone = Object.assign({}, options)
        optionsClone.scanRegion = null
        return QrScanner.scanImage(imageOrFileOrBlobOrUrl, optionsClone)
      }
      throw e
    } finally {
      if (!gotExternalEngine) {
        QrScanner._postWorkerMessage(qrEngine, 'close')
      }
    }
  }

  _onPlay() {
    this._scanRegion = this._calculateScanRegion(this.$video)
    this._updateOverlay()
    if (this.$overlay) {
      this.$overlay.style.display = ''
    }
    this._scanFrame()
  }

  _onLoadedMetaData() {
    this._scanRegion = this._calculateScanRegion(this.$video)
    this._updateOverlay()
  }

  _onVisibilityChange() {
    if (document.hidden) {
      this.pause()
    } else if (this._active) {
      this.start()
    }
  }

  _updateOverlay() {
    requestAnimationFrame(() => {
      if (!this.$overlay) return
      const video = this.$video
      const videoWidth = video.videoWidth
      const videoHeight = video.videoHeight
      const elementWidth = video.offsetWidth
      const elementHeight = video.offsetHeight
      const elementX = video.offsetLeft
      const elementY = video.offsetTop

      const videoIsViewFitted =
        videoWidth / videoHeight > elementWidth / elementHeight
      const fittedWidth = videoIsViewFitted ? elementWidth : (elementHeight * videoWidth) / videoHeight
      const fittedHeight = videoIsViewFitted ? (elementWidth * videoHeight) / videoWidth : elementHeight
      const left = (elementWidth - fittedWidth) / 2 + elementX
      const top = (elementHeight - fittedHeight) / 2 + elementY

      const overlay = this.$overlay
      overlay.style.width = `${fittedWidth}px`
      overlay.style.height = `${fittedHeight}px`
      overlay.style.left = `${left}px`
      overlay.style.top = `${top}px`

      if (!this.$codeOutlineHighlight) return
      const scanRegion = this._scanRegion
      this.$codeOutlineHighlight.style.transform = `scaleX(${scanRegion.width / videoWidth}) ` +
        `scaleY(${scanRegion.height / videoHeight})`
      this.$codeOutlineHighlight.style.left = `${(scanRegion.x / videoWidth) * 100}%`
      this.$codeOutlineHighlight.style.top = `${(scanRegion.y / videoHeight) * 100}%`
    })
  }

  _calculateScanRegion(video) {
    const canvasSize = this._legacyCanvasSize
    const videoWidth = video.videoWidth
    const videoHeight = video.videoHeight

    const smallestDimension = Math.min(videoWidth, videoHeight)
    const scanRegionSize = Math.round((2 / 3) * smallestDimension)

    return {
      x: Math.round((videoWidth - scanRegionSize) / 2),
      y: Math.round((videoHeight - scanRegionSize) / 2),
      width: scanRegionSize,
      height: scanRegionSize,
      downScaledWidth: canvasSize,
      downScaledHeight: canvasSize
    }
  }

  _scanFrame() {
    if (!this._active || this._paused) return
    requestAnimationFrame(this._scanFrame.bind(this))

    const timeSinceLastScan = Date.now() - this._lastScanTimestamp
    if (this._maxScansPerSecond > 0 && timeSinceLastScan < 1000 / this._maxScansPerSecond) return

    this._lastScanTimestamp = Date.now()
    QrScanner.scanImage(this.$video, {
      scanRegion: this._scanRegion,
      qrEngine: this._qrEnginePromise,
      returnDetailedScanResult: true
    })
      .then(
        (result) => {
          if (!this._active || this._paused) return
          if (this.$codeOutlineHighlight) {
            clearTimeout(this._codeOutlineHighlightRemovalTimeout)
            this._codeOutlineHighlightRemovalTimeout = undefined
            this._setGrabbing()
            const polygon = this.$codeOutlineHighlight.firstElementChild
            const points = result.cornerPoints
              .map(({ x, y }) => `${x},${y}`)
              .join(' ')
            if (polygon.getAttribute('points') !== points) {
              polygon.setAttribute('points', points)
            }
            this._codeOutlineHighlight.style.display = ''
          }
          this._onDecode(result)
        },
        (error) => {
          if (!this._active || this._paused) return
          if (this.$codeOutlineHighlight && !this._codeOutlineHighlightRemovalTimeout) {
            this._codeOutlineHighlightRemovalTimeout = setTimeout(
              () => this._setGrab(),
              200
            )
          }
          if (error !== QrScanner.NO_QR_CODE_FOUND) {
            this._onDecodeError(error)
          }
        }
      )
  }

  _onDecodeError(error) {
    console.error(error)
  }

  _getCameraStream() {
    if (!navigator.mediaDevices)
      throw 'Camera not found.'

    const videoConstraints = {
      width: { min: 360, ideal: 1920 },
      height: { min: 240, ideal: 1080 }
    }
    if (this._preferredCamera === 'environment') {
      videoConstraints.facingMode = 'environment'
    } else if (this._preferredCamera === 'user') {
      videoConstraints.facingMode = 'user'
    } else {
      videoConstraints.deviceId = { exact: this._preferredCamera }
    }

    return new Promise(async (resolve, reject) => {
      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false
        })
      } catch (e) {
        if (!this._preferredCamera.deviceId) {
          reject(e)
          return
        }
        delete videoConstraints.deviceId
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
            audio: false
          })
        } catch (e) {
          reject(e)
          return
        }
      }
      const facingMode = this._getFacingMode(stream)
      resolve({ stream, facingMode })
    })
  }

  async _restartVideoStream() {
    const wasPaused = this._paused
    await this.pause(true)
    if (!wasPaused) {
      this.start()
    }
  }

  _setVideoMirror(facingMode) {
    this.$video.style.transform = facingMode === 'user' ? 'scaleX(-1)' : ''
  }

  _getFacingMode(videoStream) {
    const videoTrack = videoStream.getVideoTracks()[0]
    if (!videoTrack) return null
    if (videoTrack.getSettings) {
      const { facingMode } = videoTrack.getSettings()
      if (facingMode) return facingMode
    }
    if (videoTrack.getConstraints) {
      const { facingMode } = videoTrack.getConstraints()
      if (facingMode) {
        return typeof facingMode === 'string' ? facingMode : facingMode.exact
      }
    }
    return null
  }

  _setGrab() {
    this.$overlay.style.cursor = 'grab'
    if (!this.$codeOutlineHighlight) return
    this.$codeOutlineHighlight.style.display = 'none'
  }

  _setGrabbing() {
    this.$overlay.style.cursor = 'grabbing'
  }

  static _drawToCanvas(
    image,
    scanRegion,
    canvas,
    disallowCanvasResizing
  ) {
    canvas = canvas || document.createElement('canvas')
    const scanRegionX = scanRegion ? scanRegion.x : 0
    const scanRegionY = scanRegion ? scanRegion.y : 0
    const scanRegionWidth = scanRegion ? scanRegion.width : image.width
    const scanRegionHeight = scanRegion ? scanRegion.height : image.height
    const canvasWidth = scanRegion ? scanRegion.downScaledWidth || scanRegionWidth : image.width
    const canvasHeight = scanRegion ? scanRegion.downScaledHeight || scanRegionHeight : image.height
    if (
      !disallowCanvasResizing &&
      (canvas.width !== canvasWidth || canvas.height !== canvasHeight)
    ) {
      canvas.width = canvasWidth
      canvas.height = canvasHeight
    }
    const context = canvas.getContext('2d', {
      alpha: false
    })
    context.imageSmoothingEnabled = false
    context.drawImage(
      image,
      scanRegionX,
      scanRegionY,
      scanRegionWidth,
      scanRegionHeight,
      0,
      0,
      canvas.width,
      canvas.height
    )
    return [canvas, context]
  }

  static async _loadImage(
    imageOrFileOrBlobOrUrl
  ) {
    if (
      imageOrFileOrBlobOrUrl instanceof HTMLImageElement ||
      imageOrFileOrBlobOrUrl instanceof HTMLVideoElement ||
      imageOrFileOrBlobOrUrl instanceof HTMLCanvasElement ||
      imageOrFileOrBlobOrUrl instanceof SVGImageElement ||
      (window.ImageBitmap && imageOrFileOrBlobOrUrl instanceof ImageBitmap)
    ) {
      return imageOrFileOrBlobOrUrl
    } else if (
      (window.OffscreenCanvas &&
        imageOrFileOrBlobOrUrl instanceof OffscreenCanvas) ||
      (window.File && imageOrFileOrBlobOrUrl instanceof File) ||
      imageOrFileOrBlobOrUrl instanceof Blob ||
      imageOrFileOrBlobOrUrl instanceof URL ||
      typeof imageOrFileOrBlobOrUrl === 'string'
    ) {
      const image = new Image()
      if (
        imageOrFileOrBlobOrUrl instanceof File ||
        imageOrFileOrBlobOrUrl instanceof Blob
      ) {
        image.src = URL.createObjectURL(imageOrFileOrBlobOrUrl)
      } else {
        image.src = imageOrFileOrBlobOrUrl.toString()
      }
      try {
        await image.decode()
      } catch (e) {
        throw 'Image not found.'
      }
      if (
        imageOrFileOrBlobOrUrl instanceof File ||
        imageOrFileOrBlobOrUrl instanceof Blob
      ) {
        URL.revokeObjectURL(image.src)
      }
      return image
    } else {
      throw 'Unsupported image type.'
    }
  }

  static _convertPoints(points, scanRegion) {
    if (!points || !scanRegion) return null
    const regionX = scanRegion.x || 0
    const regionY = scanRegion.y || 0
    const regionWidth = scanRegion.width
    const regionHeight = scanRegion.height
    const downscaledWidth = scanRegion.downScaledWidth || regionWidth
    const downscaledHeight = scanRegion.downScaledHeight || regionHeight
    const scaleX = regionWidth / downscaledWidth
    const scaleY = regionHeight / downscaledHeight
    return points.map(point => ({
      x: regionX + point.x * scaleX,
      y: regionY + point.y * scaleY
    }))
  }

  static _stopVideoStream(stream) {
    stream.getTracks().forEach(track => track.stop())
  }

  static createQrEngine() {
    if (!QrScanner._disableBarcodeDetector && 'BarcodeDetector' in window) {
      return new window.BarcodeDetector({
        formats: ['qr_code']
      })
    } else {
      const worker = new Worker(
        './qr-scanner-worker.min.js'
      )
      QrScanner._postWorkerMessageSync(worker, 'setGrayscaleWeights', {
        red: 3,
        green: 4,
        blue: 2,
        useIntegerApproximation: true
      })
      return worker
    }
  }

  static _postWorkerMessage(
    qrEngineOrPromise,
    type,
    data,
    transfer
  ) {
    return Promise.resolve(qrEngineOrPromise).then(qrEngine => {
      if (qrEngine instanceof Worker) {
        const id = QrScanner._workerMessageId++
        qrEngine.postMessage(
          {
            id,
            type,
            data
          },
          transfer
        )
        return id
      }
      return -1
    })
  }

  static _postWorkerMessageSync(
    qrEngine,
    type,
    data,
    transfer
  ) {
    if (qrEngine instanceof Worker) {
      const id = QrScanner._workerMessageId++
      qrEngine.postMessage(
        {
          id,
          type,
          data
        },
        transfer
      )
      return id
    }
    return -1
  }
}
