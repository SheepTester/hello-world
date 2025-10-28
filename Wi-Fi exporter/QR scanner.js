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

class QrScanner {
  static readonly DEFAULT_CANVAS_SIZE = 400
  static readonly NO_QR_CODE_FOUND = 'No QR code found'
  private static _disableBarcodeDetector = false
  private static _workerMessageId = 0

  static async hasCamera (): Promise<boolean> {
    try {
      return !!(await QrScanner.listCameras(false)).length
    } catch (e) {
      return false
    }
  }

  static async listCameras (
    requestLabels = false
  ): Promise<Array<QrScanner.Camera>> {
    if (!navigator.mediaDevices) return []

    const enumerateCameras = async (): Promise<Array<MediaDeviceInfo>> =>
      (await navigator.mediaDevices.enumerateDevices()).filter(
        device => device.kind === 'videoinput'
      )

    // Note that enumerateDevices can always be called and does not prompt the user for permission.
    // However, enumerateDevices only includes device labels if served via https and an active media stream exists
    // or permission to access the camera was given. Therefore, if we're not getting labels but labels are requested
    // ask for camera permission by opening a stream.
    let openedStream: MediaStream | undefined
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

  readonly $video: HTMLVideoElement
  readonly $canvas: HTMLCanvasElement
  readonly $overlay?: HTMLDivElement
  private readonly $codeOutlineHighlight?: SVGSVGElement
  private readonly _onDecode?: (result: QrScanner.ScanResult) => void
  private readonly _legacyOnDecode?: (result: string) => void
  private readonly _legacyCanvasSize: number = QrScanner.DEFAULT_CANVAS_SIZE
  private _preferredCamera: QrScanner.FacingMode | QrScanner.DeviceId =
    'environment'
  private readonly _maxScansPerSecond: number = 25
  private _lastScanTimestamp: number = -1
  private _scanRegion: QrScanner.ScanRegion
  private _codeOutlineHighlightRemovalTimeout?: ReturnType<typeof setTimeout>
  private _qrEnginePromise: Promise<Worker | BarcodeDetector>
  private _active: boolean = false
  private _paused: boolean = false
  private _flashOn: boolean = false
  private _destroyed: boolean = false

  constructor (
    video: HTMLVideoElement,
    onDecode: (result: QrScanner.ScanResult) => void,
    options: {
      onDecodeError?: (error: Error | string) => void
      calculateScanRegion?: (video: HTMLVideoElement) => QrScanner.ScanRegion
      preferredCamera?: QrScanner.FacingMode | QrScanner.DeviceId
      maxScansPerSecond?: number
      highlightScanRegion?: boolean
      highlightCodeOutline?: boolean
      overlay?: HTMLDivElement
      /** just a temporary flag until we switch entirely to the new api */
      returnDetailedScanResult?: true
    }
  ) {
    this.$video = video
    this.$canvas = document.createElement('canvas')

    if (options && typeof options === 'object') {
      // we got an options object using the new api
      this._onDecode = onDecode as QrScanner['_onDecode']
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
    const videoContainer = video.parentElement!

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
          this.$overlay.firstElementChild!.animate(
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
        // default style; can be overwritten via css
        this.$overlay.insertAdjacentHTML(
          'beforeend',
          '<svg class="code-outline-highlight" preserveAspectRatio="none" style="display:none;width:100%;' +
            'height:100%;fill:none;stroke:#e9b213;stroke-width:5;stroke-dasharray:25;' +
            'stroke-linecap:round;stroke-linejoin:round"><polygon/></svg>'
        )
        this.$codeOutlineHighlight = this.$overlay
          .lastElementChild as SVGSVGElement
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
        delete this.$overlay!
        // @ts-ignore
        delete this.$codeOutlineHighlight!
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

  async hasFlash (): Promise<boolean> {
    let stream: MediaStream | undefined
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

  isFlashOn (): boolean {
    return this._flashOn
  }

  async toggleFlash (): Promise<void> {
    if (this._flashOn) {
      await this.turnFlashOff()
    } else {
      await this.turnFlashOn()
    }
  }

  async turnFlashOn (): Promise<void> {
    if (this._flashOn || this._destroyed) return
    this._flashOn = true
    if (!this._active || this._paused) return // flash will be turned on later on .start()
    try {
      if (!(await this.hasFlash())) throw 'No flash available'
      // Note that the video track is guaranteed to exist and to be a MediaStream due to the check in hasFlash
      await (this.$video.srcObject as MediaStream)
        .getVideoTracks()[0]
        .applyConstraints({
          // @ts-ignore: constraint 'torch' is unknown to ts
          advanced: [{ torch: true }]
        })
    } catch (e) {
      this._flashOn = false
      throw e
    }
  }

  async turnFlashOff (): Promise<void> {
    if (!this._flashOn) return
    // applyConstraints with torch: false does not work to turn the flashlight off, as a stream's torch stays
    // continuously on, see https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#torch. Therefore,
    // we have to stop the stream to turn the flashlight off.
    this._flashOn = false
    await this._restartVideoStream()
  }

  destroy (): void {
    this.$video.removeEventListener('loadedmetadata', this._onLoadedMetaData)
    this.$video.removeEventListener('play', this._onPlay)
    document.removeEventListener('visibilitychange', this._onVisibilityChange)
    window.removeEventListener('resize', this._updateOverlay)

    this._destroyed = true
    this._flashOn = false
    this.stop() // sets this._paused = true and this._active = false
    QrScanner._postWorkerMessage(this._qrEnginePromise, 'close')
  }

  async start (): Promise<void> {
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

  stop (): void {
    this.pause()
    this._active = false
  }

  async pause (stopStreamImmediately = false): Promise<boolean> {
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

  async setCamera (
    facingModeOrDeviceId: QrScanner.FacingMode | QrScanner.DeviceId
  ): Promise<void> {
    if (facingModeOrDeviceId === this._preferredCamera) return
    this._preferredCamera = facingModeOrDeviceId
    // Restart the scanner with the new camera which will also update the video mirror and the scan region.
    await this._restartVideoStream()
  }

  static async scanImage (
    imageOrFileOrBlobOrUrl:
      | HTMLImageElement
      | HTMLVideoElement
      | HTMLCanvasElement
      | OffscreenCanvas
      | ImageBitmap
      | SVGImageElement
      | File
      | Blob
      | URL
      | String,
    options: {
      scanRegion?: QrScanner.ScanRegion | null
      qrEngine?:
        | Worker
        | BarcodeDetector
        | Promise<Worker | BarcodeDetector>
        | null
      canvas?: HTMLCanvasElement | null
      disallowCanvasResizing?: boolean
      alsoTryWithoutScanRegion?: boolean
      /** just a temporary flag until we switch entirely to the new api */
      returnDetailedScanResult?: true
    }
  ): Promise<QrScanner.ScanResult> {
    let scanRegion: QrScanner.ScanRegion | null | undefined
    // we got an options object using the new api
    scanRegion = options.scanRegion
    let qrEngine = options.qrEngine
    let canvas = options.canvas
    const disallowCanvasResizing = options.disallowCanvasResizing || false
    const alsoTryWithoutScanRegion = options.alsoTryWithoutScanRegion || false

    const gotExternalEngine = !!qrEngine

    try {
      let image:
        | HTMLImageElement
        | HTMLVideoElement
        | HTMLCanvasElement
        | OffscreenCanvas
        | ImageBitmap
        | SVGImageElement
      let canvasContext: CanvasRenderingContext2D
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
      let detailedScanResult: QrScanner.ScanResult

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
          let timeout: ReturnType<typeof setTimeout>
          let onMessage: (event: MessageEvent) => void
          let onError: (error: ErrorEvent | string) => void
          let expectedResponseId = -1
          onMessage = (event: MessageEvent) => {
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
          onError = (error: ErrorEvent | string) => {
            qrEngineWorker.removeEventListener('message', onMessage)
            qrEngineWorker.removeEventListener('error', onError)
            clearTimeout(timeout)
            const errorMessage = !error
              ? 'Unknown Error'
              : (error as ErrorEvent).message || error
            reject('Scanner error: ' + errorMessage)
          }
          qrEngineWorker.addEventListener('message', onMessage)
          qrEngineWorker.addEventListener('error', onError)
          timeout = setTimeout(() => onError('timeout'), 10000)
          const imageData = canvasContext.getImageData(
            0,
            0,
            canvas!.width,
            canvas!.height
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
          new Promise<QrScanner.ScanResult>((resolve, reject) =>
            window.setTimeout(() => reject('Scanner error: timeout'), 10000)
          ),
          (async (): Promise<QrScanner.ScanResult> => {
            try {
              const [scanResult] = await qrEngine.detect(canvas!)
              if (!scanResult) throw QrScanner.NO_QR_CODE_FOUND
              return {
                data: scanResult.rawValue,
                cornerPoints: QrScanner._convertPoints(
                  scanResult.cornerPoints,
                  scanRegion
                )
              }
            } catch (e) {
              const errorMessage = (e as Error).message || (e as string)
             
