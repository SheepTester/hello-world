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
          video: true,
        })
      }
    } catch (e) {
      // Fail gracefully, especially if the device has no camera or on mobile when the camera is already in use
      // and some browsers disallow a second stream.
    }

    try {
      return (await enumerateCameras()).map((camera, i) => ({
        id: camera.deviceId,
        label: camera.label || (i === 0 ? 'Default Camera' : `Camera ${i + 1}`),
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

  constructor(video, onDecode, options) {
    this.$video = video
    this.$canvas = document.createElement('canvas')

    if (options && typeof options === 'object') {
      // we got an options object using the new api
      this._onDecode = onDecode
    }

    this._onDecodeError = options.onDecodeError || this._onDecodeError
    this._calculateScanRegion =
      options.calculateScanRegion || this._calculateScanRegion
    this._preferredCamera = options.preferredCamera || this._preferredCamera
    this._legacyCanvasSize = this._legacyCanvasSize
    this._maxScansPerSecond =
      options.maxScansPerSecond || this._maxScansPerSecond

    this._onPlay = this._onPlay.bind(this)
    this._onLoadedMetaData = this._onLoadedMetaData.bind(this)
    this._onVisibilityChange = this._onVisibilityChange.bind(this)
    this._updateOverlay = this._updateOverlay.bind(this)

    // @ts-ignore
    video.disablePictureInPicture = true
    // Allow inline playback on iPhone instead of requiring full screen playback,
    // see https://webkit.org/blog/6784/new-video-policies-for-ios/
    // @ts-ignore
    video.playsInline = true
    // Allow play() on iPhone without requiring a user gesture. Should not really be needed as camera stream
    // includes no audio, but just to be safe.
    video.muted = true

    // Avoid Safari stopping the video stream on a hidden video.
    // See https://github.com/cozmo/jsQR/issues/185
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

    if (options.highlightScanRegion || options.highlightCodeOutline) {
      const gotExternalOverlay = !!options.overlay
      this.$overlay = options.overlay || document.createElement('div')
      const overlayStyle = this.$overlay.style
      overlayStyle.position = 'absolute'
      overlayStyle.display = 'none'
      overlayStyle.pointerEvents = 'none'
      this.$overlay.classList.add('scan-region-highlight')
      if (!gotExternalOverlay && options.highlightScanRegion) {
        // default style; can be overwritten via css, e.g. by changing the svg's stroke color, hiding the
        // .scan-region-highlight-svg, setting a border, outline, background, etc.
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
              easing: 'ease-in-out',
            }
          )
        } catch (e) {}
        videoContainer.insertBefore(this.$overlay, this.$video.nextSibling)
      }
      if (options.highlightCodeOutline) {
        // default style; can be overwritten via css
        this.$overlay.insertAdjacentHTML(
          'beforeend',
          '<svg class="code-outline-highlight" preserveAspectRatio="none" style="display:none;width:100%;' +
            'height:100%;fill:none;stroke:#e9b213;stroke-width:5;stroke-dasharray:25;' +
            'stroke-linecap:round;stroke-linejoin:round"><polygon/></svg>'
        )
        this.$codeOutlineHighlight =
          this.$overlay.lastElementChild
      }
    }
    this._scanRegion = this._calculateScanRegion(video)

    requestAnimationFrame(() => {
      // Checking in requestAnimationFrame which should avoid a potential additional re-flow for getComputedStyle.
      // const videoStyle = window.getComputedStyle(video)
      // if (videoStyle.display === 'none') {
      //   video.style.setProperty('display', 'block', 'important')
      //   shouldHideVideo = true
      // }
      // if (videoStyle.visibility !== 'visible') {
      //   video.style.setProperty('visibility', 'visible', 'important')
      //   shouldHideVideo = true
      // }
      if (shouldHideVideo) {
        // Hide the video in a way that doesn't cause Safari to stop the playback.
        console.warn(
          'QrScanner has overwritten the video hiding style to avoid Safari stopping the playback.'
        )
        video.style.opacity = '0'
        video.style.width = '0'
        video.style.height = '0'
        if (this.$overlay && this.$overlay.parentElement) {
          this.$overlay.parentElement.removeChild(this.$overlay)
        }
        // @ts-ignore
        delete this.$overlay
        // @ts-ignore
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
        if (!(this.$video.srcObject instanceof MediaStream)) return false // srcObject is not a camera stream
        stream = this.$video.srcObject
      } else {
        stream = (await this._getCameraStream()).stream
      }
      return 'torch' in stream.getVideoTracks()[0].getSettings()
    } catch (e) {
      return false
    } finally {
      // close the stream we just opened for detecting whether it supports flash
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
    if (!this._active || this._paused) return // flash will be turned on later on .start()
    try {
      if (!(await this.hasFlash())) throw 'No flash available'
      // Note that the video track is guaranteed to exist and to be a MediaStream due to the check in hasFlash
      await this.$video.srcObject.getVideoTracks()[0].applyConstraints({
        // @ts-ignore: constraint 'torch' is unknown to ts
        advanced: [{ torch: true }],
      })
    } catch (e) {
      this._flashOn = false
      throw e
    }
  }

  async turnFlashOff() {
    if (!this._flashOn) return
    // applyConstraints with torch: false does not work to turn the flashlight off, as a stream's torch stays
    // continuously on, see https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#torch. Therefore,
    // we have to stop the stream to turn the flashlight off.
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
    this.stop() // sets this._paused = true and this._active = false
    QrScanner._postWorkerMessage(this._qrEnginePromise, 'close')
  }

  async start() {
    if (this._destroyed)
      throw new Error(
        'The QR scanner can not be started as it had been destroyed.'
      )
    if (this._active && !this._paused) return

    if (window.location.protocol !== 'https:') {
      // warn but try starting the camera anyways
      console.warn(
        'The camera stream is only accessible if the page is transferred via https.'
      )
    }

    this._active = true
    if (document.hidden) return // camera will be started as soon as tab is in foreground
    this._paused = false
    if (this.$video.srcObject) {
      // camera stream already/still set
      await this.$video.play()
      return
    }

    try {
      const { stream, facingMode } = await this._getCameraStream()
      if (!this._active || this._paused) {
        // was stopped in the meantime
        QrScanner._stopVideoStream(stream)
        return
      }
      this._setVideoMirror(facingMode)
      this.$video.srcObject = stream
      await this.$video.play()

      // Restart the flash if it was previously on
      if (this._flashOn) {
        this._flashOn = false // force turnFlashOn to restart the flash
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
        // revoke srcObject only if it's a stream which was likely set by us
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
    // Restart the scanner with the new camera which will also update the video mirror and the scan region.
    await this._restartVideoStream()
  }

  static async scanImage(imageOrFileOrBlobOrUrl, options) {
    let scanRegion
    // we got an options object using the new api
    scanRegion = options.scanRegion
    let qrEngine = options.qrEngine
    let canvas = options.canvas
    const disallowCanvasResizing = options.disallowCanvasResizing || false
    const alsoTryWithoutScanRegion = options.alsoTryWithoutScanRegion || false

    const gotExternalEngine = !!qrEngine

    try {
      let image
      let canvasContext
      ;[qrEngine, image] = await Promise.all([
        qrEngine || QrScanner.createQrEngine(),
        QrScanner._loadImage(imageOrFileOrBlobOrUrl),
      ])
      ;[canvas, canvasContext] = QrScanner._drawToCanvas(
        image,
        scanRegion,
        canvas,
        disallowCanvasResizing
      )
      let detailedScanResult

      if (qrEngine instanceof Worker) {
        const qrEngineWorker = qrEngine // for ts to know that it's still a worker later in the event listeners
        if (!gotExternalEngine) {
          // Enable scanning of inverted color qr codes.
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
                ),
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
                ),
              }
            } catch (e) {
              const errorMessage = e.message || e
              if (errorMessage.includes('not implemented')) {
                // Not implemented can mean that the BarcodeDetector is not available in general or that it's
                // not available for the current platform. We have a fallback to the web worker based engine,
                // so we don't want to throw an error here, but we can't just ignore it either, as we might
                // be using an external engine that doesn't have a fallback.
                if (!gotExternalEngine) {
                  // The web worker based engine is available, so we can ignore this error and just
                  // resolve with a "no qr code found" to trigger the fallback scan without a scan region.
                  // Unfortunately, we can't just switch to the web worker based engine here, as the qrEngine
                  // is a promise that might already be resolved with the BarcodeDetector.
                  throw QrScanner.NO_QR_CODE_FOUND
                } else {
                  // We're using an external engine, so we can't just ignore this error.
                  throw e
                }
              }
              throw e
            }
          })(),
        ])
      }
      return detailedScanResult
    } catch (e) {
      if (!alsoTryWithoutScanRegion || !scanRegion) throw e
      const detailedScanResult = await QrScanner.scanImage(
        imageOrFileOrBlobOrUrl,
        {
          ...options,
          scanRegion: null,
          alsoTryWithoutScanRegion: false, // to prevent endless recursion
        }
      )
      return detailedScanResult
    } finally {
      if (!gotExternalEngine) {
        QrScanner._postWorkerMessage(qrEngine, 'close')
      }
    }
  }

  /* async */
  static createQrEngine(workerPath = QrScanner.WORKER_PATH) {
    const useBarcodeDetector =
      !QrScanner._disableBarcodeDetector && 'BarcodeDetector' in window

    if (!useBarcodeDetector) {
      const worker = new Worker(workerPath)
      const promise = new Promise((resolve, reject) => {
        let timeout
        let onMessage
        let onError
        onMessage = event => {
          if (event.data !== 'ready') return
          worker.removeEventListener('message', onMessage)
          worker.removeEventListener('error', onError)
          clearTimeout(timeout)
          resolve(worker)
        }
        onError = error => {
          worker.removeEventListener('message', onMessage)
          worker.removeEventListener('error', onError)
          clearTimeout(timeout)
          const errorMessage = !error ? 'Unknown Error' : error.message || error
          reject('Failed to load QR scanner worker: ' + errorMessage)
        }
        worker.addEventListener('message', onMessage)
        worker.addEventListener('error', onError)
        timeout = setTimeout(() => onError('timeout'), 10000)
      })
      // Post a message to the worker to start loading the wasm module. The loading is split into a separate
      // message to be able to set up the ready promise listener before the worker is fully initialized.
      QrScanner._postWorkerMessageSync(worker, 'load')
      return promise
    }

    if (!QrScanner._detectionFormatted) {
      // It's not set now, but it will be in the then() below.
      // We are checking it here to only run the check once.
      QrScanner._detectionFormatted = QrScanner._checkBarcodeDetectorFormat()
    }

    return QrScanner._detectionFormatted.then(formatted =>
      formatted
        ? new BarcodeDetector({ formats: ['qr_code'] })
        : new BarcodeDetector()
    )
  }

  /** @deprecated */
  setGrayscaleWeights(red, green, blue, useIntegerApproximation = true) {
    QrScanner._postWorkerMessage(
      this._qrEnginePromise,
      'setGrayscaleWeights',
      {
        red,
        green,
        blue,
        useIntegerApproximation,
      }
    )
  }

  /** @deprecated */
  setInversionMode(inversionMode) {
    QrScanner._postWorkerMessage(this._qrEnginePromise, 'inversionMode', {
      inversionMode,
    })
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
      // Running in requestAnimationFrame which should avoid a potential additional re-flow for getComputedStyle.
      if (!this.$overlay) return
      const video = this.$video
      const videoWidth = video.videoWidth
      const videoHeight = video.videoHeight
      const elementWidth = video.offsetWidth
      const elementHeight = video.offsetHeight

      const elementRatio = elementWidth / elementHeight
      const videoRatio = videoWidth / videoHeight

      // The video is naturally centered in the element, so we can use this to calculate the border widths.
      // This logic is slightly wrong for position: cover, but we don't support that anyway.
      const borderSizeX =
        elementRatio > videoRatio
          ? (elementWidth - elementHeight * videoRatio) / 2
          : 0
      const borderSizeY =
        elementRatio > videoRatio
          ? 0
          : (elementHeight - elementWidth / videoRatio) / 2

      const PADDING = 0 // has to be 0 for now as the scan region is calculated upon the video element not the overlay
      this.$overlay.style.width = `${elementWidth - 2 * borderSizeX + 2 * PADDING}px`
      this.$overlay.style.height = `${elementHeight - 2 * borderSizeY + 2 * PADDING}px`
      this.$overlay.style.top = `${borderSizeY - PADDING}px`
      this.$overlay.style.left = `${borderSizeX - PADDING}px`
    })
  }

  _calculateScanRegion(video) {
    const videoWidth = video.videoWidth
    const videoHeight = video.videoHeight

    const GUESSED_SCAN_REGION_SIZE = 240
    const videoMinDimension = Math.min(videoWidth, videoHeight)
    const scanRegionSize = Math.round(
      (2 / 3) *
        (videoMinDimension > GUESSED_SCAN_REGION_SIZE
          ? GUESSED_SCAN_REGION_SIZE
          : videoMinDimension)
    )

    return {
      x: Math.round((videoWidth - scanRegionSize) / 2),
      y: Math.round((videoHeight - scanRegionSize) / 2),
      width: scanRegionSize,
      height: scanRegionSize,
    }
  }

  /* async */
  _scanFrame() {
    if (!this._active || this._paused || !this.$video.videoWidth) {
      return
    }

    const now = performance.now()
    if (now - this._lastScanTimestamp < 1000 / this._maxScansPerSecond) {
      // We're scanning too fast, so we'll skip this frame.
      // We could also use a timeout to scan the next frame, but this is more efficient.
      // It also avoids the timeout being called after the scanner has been stopped.
      requestAnimationFrame(() => this._scanFrame())
      return
    }
    this._lastScanTimestamp = now

    Promise.resolve() // a promise to make sure we're not blocking the UI
      .then(() => {
        if (!this._active || this._paused) {
          // was stopped in the meantime
          return
        }

        return QrScanner.scanImage(this.$video, {
          scanRegion: this._scanRegion,
          qrEngine: this._qrEnginePromise,
          canvas: this.$canvas,
        })
      })
      .then(
        result => {
          if (!this._active || this._paused) {
            // was stopped in the meantime
            return
          }
          this._onDecode(result)
          if (this.$codeOutlineHighlight) {
            clearTimeout(this._codeOutlineHighlightRemovalTimeout)
            this._codeOutlineHighlightRemovalTimeout = undefined
            this._showCodeOutline(result.cornerPoints)
          }
        },
        error => {
          if (!this._active || this._paused) {
            // was stopped in the meantime
            return
          }
          if (error === QrScanner.NO_QR_CODE_FOUND) {
            this._onDecodeError(error)
          } else {
            // Try to restart the camera stream which often fixes stream errors.
            // However, some errors are not recoverable, so we first check for those.
            const errorMessage = error.message || error
            if (
              !/not readable/i.test(errorMessage) &&
              !/not allowed/i.test(errorMessage) &&
              !/disappeared/i.test(errorMessage) &&
              !/failed to start/i.test(errorMessage) &&
              !/not supported/i.test(errorMessage) &&
              !/could not connect/i.test(errorMessage) &&
              !/could not start/i.test(errorMessage) &&
              !/permission denied/i.test(errorMessage)
            ) {
              this._restartVideoStream()
            }
            this._onDecodeError(error)
          }
        }
      )
      .then(() => {
        // schedule the next scan
        requestAnimationFrame(() => this._scanFrame())
      })
  }

  _onDecodeError(error) {
    // default error handler
    if (error === QrScanner.NO_QR_CODE_FOUND) return
    console.error(error)
  }

  _showCodeOutline(cornerPoints) {
    if (!this.$codeOutlineHighlight) return
    const polygon = this.$codeOutlineHighlight.firstElementChild
    const video = this.$video
    const videoWidth = video.videoWidth
    const videoHeight = video.videoHeight
    const elementWidth = video.offsetWidth
    const elementHeight = video.offsetHeight

    const elementRatio = elementWidth / elementHeight
    const videoRatio = videoWidth / videoHeight
    const borderSizeX =
      elementRatio > videoRatio
        ? (elementWidth - elementHeight * videoRatio) / 2
        : 0
    const borderSizeY =
      elementRatio > videoRatio
        ? 0
        : (elementHeight - elementWidth / videoRatio) / 2

    const scaleX = (elementWidth - 2 * borderSizeX) / videoWidth
    const scaleY = (elementHeight - 2 * borderSizeY) / videoHeight

    const scaledPoints = cornerPoints.map(
      point =>
        `${point.x * scaleX + borderSizeX} ${point.y * scaleY + borderSizeY}`
    )
    polygon.setAttribute('points', scaledPoints.join(' '))

    this.$codeOutlineHighlight.style.display = ''

    clearTimeout(this._codeOutlineHighlightRemovalTimeout)
    this._codeOutlineHighlightRemovalTimeout = setTimeout(
      () => (this.$codeOutlineHighlight.style.display = 'none'),
      150
    )
  }

  /* async */
  _getCameraStream() {
    if (!navigator.mediaDevices)
      throw new Error('Camera not found or not supported.')

    const constraints = [
      {
        width: { min: 1024 } /* 1280, 1920 */,
      },
      {
        width: { min: 768 } /* 1024, 1280 */,
      },
      {},
    ]
    if (typeof this._preferredCamera === 'string') {
      // environment or user
      constraints.forEach(
        constraint => (constraint.facingMode = this._preferredCamera)
      )
    } else {
      // device id
      constraints.forEach(
        constraint => (constraint.deviceId = this._preferredCamera)
      )
    }

    return this._getMatchingCameraStream(constraints)
  }

  /* async */
  _getMatchingCameraStream(constraints) {
    for (const constraint of constraints) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: constraint,
          audio: false,
        })
        const facingMode = this._getFacingMode(stream)
        return { stream, facingMode }
      } catch (e) {}
    }

    // Try with default constraints and return the stream if it works, otherwise throw the last error.
    // The default constraints are used as a fallback to increase the chance of getting a stream.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      })
      const facingMode = this._getFacingMode(stream)
      return { stream, facingMode }
    } catch (e) {
      // Fallback to error from the last constraint which is probably the most relevant.
      throw new Error(`Could not get camera stream: ${e.message || e}`)
    }
  }

  async _restartVideoStream() {
    // If the scanner is not active, we don't need to restart the stream. The new camera will be used on next start.
    if (!this._active) return
    // To apply a new camera, we need to stop the old stream and create a new one.
    // Pausing is not enough, as the old stream is still active and prevents a new one from being created.
    // On some devices, it's also not enough to stop the stream, but the srcObject must be cleared and the video
    // reloaded.
    await this.pause(true)
    await this.start()
  }

  _setVideoMirror(facingMode) {
    // In some cases, the video stream is mirrored, which makes it difficult to scan QR codes.
    // We can fix this by applying a CSS transform to the video element.
    // The default is to not mirror the video, which is correct for environments cameras.
    // For user facing cameras, we need to mirror the video to make it look natural.
    const scale = facingMode === 'user' ? -1 : 1
    this.$video.style.transform = `scaleX(${scale})`
  }

  _getFacingMode(stream) {
    if (!stream) return null
    const videoTrack = stream.getVideoTracks()[0]
    if (!videoTrack) return null
    // Make sure to not throw an exception here as this method is called from a catch block.
    return /user|front/i.test(videoTrack.label)
      ? 'user'
      : /environment|back/i.test(videoTrack.label)
        ? 'environment'
        : videoTrack.getSettings().facingMode || null // getSettings also returns a string
  }

  static _drawToCanvas(
    image,
    scanRegion,
    canvas,
    disallowCanvasResizing = false
  ) {
    canvas = canvas || document.createElement('canvas')
    const scanRegionX = scanRegion ? scanRegion.x : 0
    const scanRegionY = scanRegion ? scanRegion.y : 0
    const scanRegionWidth = scanRegion
      ? scanRegion.width
      : image.width || image.videoWidth
    const scanRegionHeight = scanRegion
      ? scanRegion.height
      : image.height || image.videoHeight

    if (!disallowCanvasResizing) {
      const canvasWidth = scanRegion
        ? scanRegion.width
        : QrScanner.DEFAULT_CANVAS_SIZE
      const canvasHeight = scanRegion
        ? scanRegion.height
        : QrScanner.DEFAULT_CANVAS_SIZE
      if (canvas.width !== canvasWidth) {
        canvas.width = canvasWidth
      }
      if (canvas.height !== canvasHeight) {
        canvas.height = canvasHeight
      }
    }

    const context = canvas.getContext('2d', {
      willReadFrequently: true,
    })
    context.imageSmoothingEnabled = false // gives less blurry images
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

  /* async */
  static _loadImage(imageOrFileOrBlobOrUrl) {
    if (
      imageOrFileOrBlobOrUrl instanceof HTMLImageElement ||
      imageOrFileOrBlobOrUrl instanceof HTMLVideoElement ||
      imageOrFileOrBlobOrUrl instanceof HTMLCanvasElement ||
      imageOrFileOrBlobOrUrl instanceof SVGImageElement ||
      ('OffscreenCanvas' in window &&
        imageOrFileOrBlobOrUrl instanceof OffscreenCanvas) ||
      ('ImageBitmap' in window && imageOrFileOrBlobOrUrl instanceof ImageBitmap)
    ) {
      return imageOrFileOrBlobOrUrl
    } else if (
      imageOrFileOrBlobOrUrl instanceof File ||
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
      return new Promise((resolve, reject) => {
        let timeout
        const onError = () => {
          image.removeEventListener('load', onLoad)
          image.removeEventListener('error', onError)
          clearTimeout(timeout)
          reject('Could not load image.')
        }
        const onLoad = () => {
          image.removeEventListener('load', onLoad)
          image.removeEventListener('error', onError)
          clearTimeout(timeout)
          if (
            imageOrFileOrBlobOrUrl instanceof File ||
            imageOrFileOrBlobOrUrl instanceof Blob
          ) {
            URL.revokeObjectURL(image.src)
          }
          resolve(image)
        }
        image.addEventListener('load', onLoad)
        image.addEventListener('error', onError)
        timeout = setTimeout(onError, 10000)
      })
    } else {
      throw new Error(
        'Image type not supported.' +
          'For browsers that don\'t support the ImageBitmap API, you can use a polyfill.'
      )
    }
  }

  static _stopVideoStream(stream) {
    for (const track of stream.getTracks()) {
      track.stop()
      track.dispatchEvent(new Event('ended')) // manually trigger ended event to be spec compliant
    }
  }

  /* async */
  static _checkBarcodeDetectorFormat() {
    try {
      // some browsers (Chromium <= 79) support the BarcodeDetector but not the format option
      new BarcodeDetector({ formats: [] })
      return true
    } catch (e) {
      return false
    }
  }

  static _postWorkerMessage(workerOrPromise, type, data, transfer) {
    Promise.resolve(workerOrPromise).then(worker => {
      if (!(worker instanceof Worker)) return // BarcodeDetector
      worker.postMessage({ type, data }, transfer)
    })
  }

  static _postWorkerMessageSync(worker, type, data, transfer) {
    if (!(worker instanceof Worker)) {
      // BarcodeDetector
      console.warn(
        'Can not post message to BarcodeDetector. This is probably a bug.'
      )
      return -1
    }
    const id = QrScanner._workerMessageId++
    worker.postMessage({ id, type, data }, transfer)
    return id
  }

  static _convertPoints(points, scanRegion) {
    if (!points || !scanRegion) return points
    const xOffset = scanRegion.x || 0
    const yOffset = scanRegion.y || 0
    for (const point of points) {
      point.x += xOffset
      point.y += yOffset
    }
    return points
  }
}
