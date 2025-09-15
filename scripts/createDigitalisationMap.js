/********************************************
 *
 *
 *
 *
▗▄▄▄ ▗▄▄▄▖ ▗▄▄▖▗▄▄▄▖▗▄▄▄▖▗▄▖ ▗▖   ▗▄▄▄▖ ▗▄▄▖ ▗▄▖▗▄▄▄▖▗▄▄▄▖ ▗▄▖ ▗▖  ▗▖    ▗▄▄▄▖▗▖   ▗▖ ▗▖▗▖  ▗▖
▐▌  █  █  ▐▌     █    █ ▐▌ ▐▌▐▌     █  ▐▌   ▐▌ ▐▌ █    █  ▐▌ ▐▌▐▛▚▖▐▌    ▐▌   ▐▌   ▐▌ ▐▌ ▝▚▞▘ 
▐▌  █  █  ▐▌▝▜▌  █    █ ▐▛▀▜▌▐▌     █   ▝▀▚▖▐▛▀▜▌ █    █  ▐▌ ▐▌▐▌ ▝▜▌    ▐▛▀▀▘▐▌   ▐▌ ▐▌  ▐▌  
▐▙▄▄▀▗▄█▄▖▝▚▄▞▘▗▄█▄▖  █ ▐▌ ▐▌▐▙▄▄▖▗▄█▄▖▗▄▄▞▘▐▌ ▐▌ █  ▗▄█▄▖▝▚▄▞▘▐▌  ▐▌    ▐▌   ▐▙▄▄▖▝▚▄▞▘▗▞▘▝▚▖

    * Designed by Federico Denni & Chiara di Lodovico
    * Data researched and classified by Federica Rubino & Chiara di Lodovico
    * Coded by Federico Denni for Project TRAMA
    * seen on ichatlas.com
    * Politecnico di Milano - Design Department - Coordinated by Davide Spallazzo
    * iCoolHunt Spa
 *                                                                               
 *                                                                               
 *                                                                               
 **************************************************/

// Thanks to Visual Cinnamon, Observable and Shirley Wu for inspiration
// This tool is built upon d3.js and bboxCollide libraries, and visualises
// how different assets of ICH domain are digitised

const createDigitalisationMap = (container, data) => {
  //////////////////////////////////////
  ////// Constants & Variables ////////
  /////////////////////////////////////

  //define math variables
  const PI = Math.PI;
  const TAU = PI * 2;

  let round = Math.round;
  let cos = Math.cos;
  let sin = Math.sin;
  let sqrt = Math.sqrt;
  let min = Math.min;
  let max = Math.max;
  let abs = Math.abs;

  //define data variables -- let the user modify them
  let ichGroup, dataGroup, capTechGroup, repTechGroup, digzGroup; //parse datasets
  let ichTosource_nodes, ichTosource_edges; //connect ich elements to data source
  let dataTocap_nodes, dataTocap_edges; //connect data types to capturing tech
  let capTorep_nodes, capTorep_edges; //connect capturing tech to representation tech
  let repTodigz_nodes, repTodigz_edges; //connect representation tech to digitization
  let digzTodissTofruit_nodes, digzTodissTofruit_edges; //connect digitization to dissemination to fruition

  let fruition = [];
  let ichModal = [];

  //setup data viz
  //define simulations
  let element_sim, data_sim, tech_sim, dig_sim;

  //set sizes
  const MIN_WIDTH = 660;
  let width = max(MIN_WIDTH, container.clientWidth);
  let height = container.clientHeight;

  //set colors
  const COLORS = {
    background: "#f5f5f0",
    //add others
  };

  //create svg container
  const svg = d3
    .select(container)
    .append("svg")
    .attr("id", "data-visualisation")
    .style("display", "block")
    .attr("width", width)
    .attr("height", height)
    .style("background-color", COLORS.background)
    .style("margin", "0");

  //to handle resizing automatically
  //https://stackoverflow.com/questions/16265123/resize-svg-when-window-is-resized-in-d3-js
  // to see later

  //add zoom function

  const g = svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  /*********************
   *
   * Processo data visualisation
   * - Dichiarazioni variabili
   * - Spacchettamento dataset -> recupero data in mini dataset
   *      - Tipo di elemento, tipo di data (raggruppamenti)
   *          - calcolo "r" : frequency
   *      - creare dataset connessioni (edges and nodes)
   *          - Element - Domain - ICH Specification - Data Source
   *          - Data source - Data type
   *          - Capturing technology - Data Type
   *          - Representation technology - Capturing technology - Digitization output
   *          - Digitization output - Representation Technology - Fruition output
   *              - Extract Unique Id fruition output
   *      - connessioni elemento a data source
   *          - edge (node preso da tabelle precedenti)
   * - Force simulation 1/2 per raggruppamento tra nodi
   * - Force simulation verticale per distinzione gruppi
   * - Force simulation positionining edges e distinzioni per gruppo (gravità?)
   *      - arcotangente dei nodi
   * - animazione frecce
   * - hovering
   *    - visualizzazione paths
   *    - sfocatura resto
   * - clicking
   *    - apertura modale
   *    - lista di elementi interni (elemento -> specific-elements)
   *
   */
};
