function flashCards(json, flip) {
  var wordelem = document.getElementById('word'),
  defelem = document.getElementById('def'),
  cardnum = -1,
  randomised = [],
  wrongs = [],
  flipside = 0;
  function flipObject(obj) {
    let temp = {};
    Object.keys(obj).forEach(k => temp[obj[k]] = k);
    return temp;
  }
  if (typeof flip === "boolean" ? flip : window.location.search === "?flip") json = flipObject(json);
  function shuffle(array) {
    // https://bost.ocks.org/mike/shuffle/
    var m = array.length, t, i;
    while (m)
      i = Math.floor(Math.random() * m--),
      t = array[m],
      array[m] = array[i],
      array[i] = t;
    return array;
  }
  randomised = shuffle(Object.keys(json));
  function cont(iswrong) {
    if (iswrong && randomised[cardnum]) wrongs.push(randomised[cardnum]);
    function doThings() {
      cardnum++, flipside = 0;
      wordelem.classList.add(iswrong? 'swapout' : 'fadeout');
      setTimeout(() => {
        wordelem.classList.remove('swapout');
        wordelem.classList.remove('fadeout');
        if (cardnum >= randomised.length && wrongs.length) randomised = shuffle(wrongs), wrongs = [], cardnum = 0;
        if (cardnum < randomised.length) {
          wordelem.style.opacity = 1;
          wordelem.classList.remove('hidefirst');
          wordelem.classList.add('swapin');
          wordelem.innerHTML = `<span>${randomised[cardnum]}</span>`;
          defelem.innerHTML = `<span>${json[randomised[cardnum]]}</span>`;
          setTimeout(() => {
            wordelem.classList.remove('swapin');
          },200);
        } else {
          wordelem.style.opacity = 0;
          defelem.style.opacity = 0;
          wordelem.classList.add('hidefirst');
        }
      }, 200);
    }
    if (flipside === 1) {
      defelem.classList.remove('flipin');
      defelem.classList.add('flipout');
      wordelem.classList.remove('flipout');
      wordelem.classList.add('flipin');
      setTimeout(() => {
        doThings();
        defelem.classList.remove('flipout');
        wordelem.classList.remove('flipin');
      }, 500);
    } else {
      defelem.classList.remove('flipout');
      wordelem.classList.remove('flipin');
      doThings();
    }
  }
  function flip() {
    if (flipside === 0) {
      wordelem.classList.remove('flipin');
      wordelem.classList.add('flipout');
      defelem.classList.remove('flipout');
      defelem.classList.add('flipin');
    } else {
      defelem.classList.remove('flipin');
      defelem.classList.add('flipout');
      wordelem.classList.remove('flipout');
      wordelem.classList.add('flipin');
    }
    flipside = (flipside + 1) % 2;
  }
  wordelem.classList.add('hidefirst');
  cont(false);
  document.onkeydown = e => {
    if (e.keyCode === 37) cont(true);
    else if (e.keyCode === 39) cont(false);
    else if (e.keyCode === 32) flip();
  };
}
