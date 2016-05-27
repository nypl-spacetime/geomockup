var dragging = false
var breakpoint = 800
var resizer
var item
var map
var info
var step = 0
var minSize = 300
var resizeMode = "horizontal"
var infoSize = 0
var defaultSize = 0
var defaultSizeH = 360
var defaultSizeV = 200
var resizerSize = 30
var startPos

function init () {
  item = document.getElementById("item")
  info = document.getElementById("information")
  resizer = document.getElementById("resizer")
  resizer.addEventListener("mousedown", dragStart)
  resizer.addEventListener("touchstart", dragStart)
  window.addEventListener("mouseup", dragEnd)
  window.addEventListener("touchend", dragEnd)
  window.addEventListener("resize", windowResize)
  document.getElementById("view-link").addEventListener("click", toggleProviders)

  var steps = document.getElementsByClassName("step")

  for (var i=0; i<steps.length; i++) {
    steps[i].addEventListener("transitionend", removeHidden)
  }

  windowResize()
  createMap()
  updateDivs()
  goNextStep()
}

function goNextStep() {
  var steps = document.getElementsByClassName("step")
  step++
  if (step > steps.length) step = 1
  var prev = document.getElementById("step" + (step-1))
  if (prev) {
    prev.classList.toggle("hidden")
    prev.classList.toggle("active")
  }
  document.getElementById("step" + step).classList.toggle("active")
}

function removeHidden(e) {
  if (!e.target.classList.contains("active")) e.target.classList.remove("hidden")
}

function toggleProviders(e) {
  document.getElementById("providers").classList.toggle("active")
  e.preventDefault()
}

function updateDivs() {
  if (infoSize == 0) infoSize = defaultSize
  if (resizeMode == "horizontal") {
    item.style.right = infoSize+"px"
    item.style.bottom = "0"
    item.style.height = "auto"
    info.style.width = infoSize+"px"
    info.style.top = "0"
  } else {
    item.style.top = "0"
    item.style.height = infoSize+"px"
    item.style.bottom = "0"
    item.style.right = "0"
    info.style.top = infoSize+"px"
    info.style.right = "0"
    info.style.width = "auto"
  }
  if (map) map.invalidateSize()
}

function dragStart(e) {
  dragging = true
  resizer.classList.add("active")
  var xy = e.clientY ? {x:e.clientX, y:e.clientY} : {x:e.pageX, y:e.pageY}
  startPos = resizeMode == "horizontal" ? xy.x - info.offsetLeft : xy.y - info.offsetTop
  window.addEventListener("mousemove", dragMove)
  window.addEventListener("touchmove", dragMove)
  e.preventDefault()
}


function dragMove(e) {
  window.getSelection().removeAllRanges()
  if (!dragging) return
  if (resizeMode == "horizontal") {
    var clientX = e.clientX ? e.clientX : e.pageX
    var width = window.innerWidth - clientX
    if (startPos != undefined) width += startPos
    if (width >= minSize && clientX >= minSize) {
      infoSize = width
      updateDivs()
    }
  } else {
    minSize = resizerSize
    var clientY = e.clientY ? e.clientY : e.pageY
    if (startPos != undefined) clientY -= startPos
    if (clientY >= minSize && clientY + minSize < window.innerHeight) {
      infoSize = clientY
      updateDivs()
    }
  }
  // console.log(resizeMode, infoSize)
  e.preventDefault()
}

function dragEnd(e) {
  dragging = false
  resizer.classList.remove("active")
  e.preventDefault()
}

function createMap() {
  var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
  })

  map = L.map('map', {
    center: [40.753621, -73.983230],
    zoom: 17
  })

  var hereIcon = L.divIcon({
    className: 'map-marker',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    html: '<div class="location"><span class="here">HERE!</span>(I think)</div>'
  })

  var hereMarker

  map.on('click', function(e) {
    if (!hereMarker) {
      hereMarker = L.marker(map.getCenter(), {
        icon: hereIcon,
        clickable: false
      })
      hereMarker.addTo(map)
    }
    hereMarker.setLatLng(map.getCenter())
    document.getElementById("submit").className = "moved submit"
    document.getElementById("submit").addEventListener("click", function(e) {
      e.preventDefault()
      goNextStep()
    })
  })

  map.on('move', function(e) {
    if (!hereMarker) return
    hereMarker.setLatLng(map.getCenter())
  })

  map.addLayer(layer)
}

function windowResize() {
  var w = window.innerWidth
  if (w <= breakpoint) {
    resizeMode = "vertical"
    defaultSize = defaultSizeV
  } else {
    resizeMode = "horizontal"
    defaultSize = defaultSizeH
  }
  updateDivs()
}