// ==UserScript==
// @name         Skraĉteamĝenanto
// @namespace    https://assets.scratch.mit.edu/
// @version      1.0
// @description  Ĝenu la Skraĉteamon. Alŝutu viajn dosierojn al ĝia valoraĵservilo.
// @author       Vi
// @match        https://scratch.mit.edu/studios/1000/
// @include      https://scratch.mit.edu/studios/1000/projects/
// @grant        none
// ==/UserScript==

;(async () => {
  'use strict'

  // Scratch usa js-md5
  await import('https://unpkg.com/js-md5@0.7.3/build/md5.min.js')
  const { md5, jQuery: $ } = globalThis

  const TAMAÑO_MÁXIMO = 10 * 1000 * 1000 // 10 mb
  const SERVIDOR = 'https://assets.scratch.mit.edu/'

  async function subir (archivo, progreso = null) {
    const condensados = []
    const cuentaDePartes = Math.ceil(archivo.size / TAMAÑO_MÁXIMO)
    for (let i = 0; i < cuentaDePartes; i++) {
      if (progreso) progreso(i, cuentaDePartes)

      const parte = archivo.slice(i * TAMAÑO_MÁXIMO, (i + 1) * TAMAÑO_MÁXIMO)
      const condensado = md5(await parte.arrayBuffer())
      const respuesta = await fetch(SERVIDOR + condensado + '.wav', {
        method: 'POST',
        credentials: 'include',
        body: parte
      })
      if (!respuesta.ok) {
        throw new Error(await respuesta.text())
      }
      condensados.push(condensado)
    }
    if (progreso) progreso(cuentaDePartes, cuentaDePartes)
    return condensados
  }

  async function descargar (condensados, progreso) {
    const partes = []
    let i = 0
    for (const condensado of condensados) {
      if (progreso) progreso(i++, condensados.length)
      const respuesta = await fetch(SERVIDOR + `internalapi/asset/${condensado}.wav/get/`)
      if (!respuesta.ok) {
        throw new Error(await respuesta.text())
      }
      partes.push(await respuesta.blob())
    }
    if (progreso) progreso(condensados.length, condensados.length)
    return new Blob(partes)
  }

  // Hay jQuery en las páginas viejas de Scratch; por qué no usarlo?
  const indicadorDeProgreso = $('<progress>')
  const error = $('<p></p>').css({
    color: 'red',
    whiteSpace: 'pre-wrap'
  }).hide()

  const archivoSeleccionado = $('<input type="file">').on('change', function () {
    if (this.files[0] && this.files[0].size > TAMAÑO_MÁXIMO) {
      aviso.show()
    } else {
      aviso.hide()
    }
  })
  const aviso = $('<p></p>').css('color', 'red').text(
    'Files larger than 10 MB will be split up and uploaded separately. This should be fine, though.'
  ).hide()
  const condensadosGenerados = $('<input type="text" readonly>')

  const paraDescargar = $('<input type="text" placeholder="ID">')

  $('#tabs-content')
    .css({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 'auto'
    })
    .html('')
    .append(
      $('<div></div>').append(
        indicadorDeProgreso,
        $('<form></form>').on('submit', async function (e) {
          e.preventDefault()
          error.hide()
          const archivo = archivoSeleccionado[0].files[0]
          if (!archivo) {
            error.show().text('Select a file to upload first!')
            return
          }
          this.disabled = true
          const condensados = await subir(archivo, (cargado, total) => {
            indicadorDeProgreso
              .attr('max', total)
              .attr('value', cargado)
          }).catch(err => {
            error.show().text(`Error :(\n${err}`)
          })
          this.disabled = false
          if (condensados) {
            // Guardar la extensión del archivo
            if (archivo.name.includes('.') && archivo.name.lastIndexOf('.') > archivo.name.lastIndexOf('/')) {
              condensados.push(archivo.name.slice(archivo.name.lastIndexOf('.') + 1))
            } else {
              condensados.push('')
            }
            condensadosGenerados.val(condensados.join('.')).focus().select()
          }
        }).append(
          $('<label>Select a file to upload: </label>').append(
            archivoSeleccionado,
            aviso
          ),
          '<input type="submit" value="Upload">'
        ),
        $('<label>Copy and save this ID somewhere to access the file later: </label>')
          .append(condensadosGenerados),
        '<hr>',
        $('<form></form>').on('submit', async function (e) {
          e.preventDefault()
          this.disabled = true
          error.hide()
          const condensados = paraDescargar.val().split(/-|\./)
          const extensión = condensados.pop()
          const archivo = await descargar(condensados, (cargado, total) => {
            indicadorDeProgreso
              .attr('max', total)
              .attr('value', cargado)
          }).catch(err => {
            error.show().text(`Error :(\n${err}`)
          })
          this.disabled = false
          if (archivo) {
            const lru = URL.createObjectURL(archivo)
            const enlace = $('<a></a>')
              .attr('href', lru)
              .attr('download', condensados.join('-') + (extensión ? '.' + extensión : ''))
              .appendTo(document.body)
              .get(0)
            enlace.click()
            enlace.remove()
            URL.revokeObjectURL(lru)
          }
        }).append(
          $('<label>Download file from ID: </label>').append(paraDescargar),
          $('<input type="submit" value="Download">')
        ),
        error
      )
    )
    .parent()
    .css({
      display: 'flex',
      flexDirection: 'column'
    })
})()
