/***
 * Setup:
 * -ASCII art
 * -Importare e gestire datasets
 * -Logica resizing
 * -Logica esportazione immagine (.png)
 ***/

//Come funzionerà?
//prima versione di prova:
// fare un network graph che mostri i collegamenti tra le entità (force-layout semplice)
// aggiungi variazione data (colori, dimensioni, etc)
// capire come funzionano per determinare scrittura libro

//seconda versione - definire design
// nodo centrale con oral traditions, ich elements e specification
// aggiungere interattività con human resources

const createEcosystemMap = (container) => {
  /////////define math variables
  const PI = Math.PI;
  const TAU = PI * 2;

  let round = Math.round;
  let cos = Math.cos;
  let sin = Math.sin;
  let sqrt = Math.sqrt;
  let min = Math.min;
  let max = Math.max;
  let abs = Math.abs;
  let ceil = Math.ceil;
  let floor = Math.floor;
  let atan2 = Math.atan2;

  /////////set sizes
  let width, height;

  const MIN_WIDTH = 660;
  const MAX_HEIGHT = 1250; //increase if you want really large viz on tall screens
  const PADDING = 24; //in scale of eights

  ///// colors
  const COLORS = {};

  /////////////////////FOR VISUALISATION///////////////////////

  //simulations
  let simulation;

  //Canvas setup

  function draw() {
    //always clean visualisation

    //Clear any cached anchor data
    if (simulation) {
      simulation.stop();
      simulation = null;
    }
  } //draw()

  function chart(skillData, techData, projData) {
    //data logic
    //call resizing (first draw)
    chart.resize();
  } //chart()

  //Calculate sizes
  function handleSizes(w, h) {}
  //calculate sizes
  function handleScales() {} //handleScale()

  chart.width = function (value) {
    if (!arguments.length) return width;
    width = max(MIN_WIDTH, value);
    return chart; //method chaining
  }; //define width chart

  chart.height = function (value) {
    if (!arguments.length) return height;
    height = min(MAX_HEIGHT, value);
    return chart;
  }; //define height chart

  chart.resize = function () {
    svg.attr("width", width).attr("height", height);
    g.attr("transform", `translate(${width / 2}, ${height / 2})`);
    handleSizes(width, height);
    handleScales();
    draw();
  }; //handle resizes

  //Download function of chart
  chart.downloadPNG = function () {
    //download canvas
  }; //chart.download

  return chart;
};
