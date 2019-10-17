const { ipcRenderer, nativeImage } = require('electron')
const $ = require('jquery')
const PIXI = require('pixi.js')

const toolbar = require('../../components/toolbar')
const statusBar = require('../../components/status')

let app, size, img

const scales = [
  1.5, 2, 3, 4, 5, 6.25, 8.33, 12.5, 16.67, 25, 33.33, 50, 66.67, 100, 200, 300, 400, 500, 600
]

let scale, scaleID

const App = {
  init() {
    this.bindEvent()
  },
  bindEvent() {
    ipcRenderer.send('init')
    ipcRenderer.on('filePath', (event, arg) => {
      const ni = nativeImage.createFromPath(arg)
      img = new Image()
      img.onload = () => {
        this.onLoad()
      }
      img.src = ni.toDataURL()
      size = ni.getSize()
      scale = size.width / window.innerWidth * 100
      scale = scale.toFixed(2) 
      scales.push(scale)
      scales.sort((a, b) => a - b)
      scaleID = scales.indexOf(scale)
      statusBar.setScale(scale)
    })
    $(document).on('keydown', (e) => {
      const ctrlPressed = e.ctrlKey
      if (ctrlPressed && e.keyCode === 189) this.zoomOut()
      if (ctrlPressed && e.keyCode === 187) this.zoomIn()
    })
    $(window).on('resize', this.resize.bind(this))
  },
  onLoad() {
    $('#spinner').remove()
    $('.tools').removeClass('hide')
    $('.ruler').removeClass('hide')
    $('.status-bar').removeClass('hide')
    this.setupCanvas()
    this.resize()
  },
  resize() {
    const ww = window.innerWidth
    const w = size.width * scale / 100 | 0
    const h = size.height * scale / 100 | 0
    app.view.style.width = w + 'px'
    app.view.style.height = h + 'px'
    const dx = (w - ww) / 2 | 0
    $(window).scrollLeft(dx)
    toolbar.resize()
    statusBar.setScale(scale)
  },
  zoomIn() {
    scaleID += 1
    scaleID = (scaleID === scales.length) ? scales.length - 1 : scaleID
    scale = scales[scaleID]
    this.resize()
  },
  zoomOut() {
    scaleID -= 1
    scaleID = (scaleID < 0) ? 0 : scaleID
    scale = scales[scaleID]
    this.resize()
  },
  setupCanvas() {
    const el = $('#canvas-wrap')
    app = new PIXI.Application({
      width: size.width,
      height: size.height,
      backgroundColor: 0x1099bb,
      resolution: window.devicePixelRatio || 1
    })
    app.view.style.width = size.width + 'px'
    app.view.style.height = size.height + 'px'
    el[0].appendChild(app.view)
    const texture = new PIXI.Texture.from(img)
    const sprite = new PIXI.Sprite(texture)
    app.stage.addChild(sprite)
  }
}

App.init()





