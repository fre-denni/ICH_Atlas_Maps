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
  let elementGroup, dataGroup, techGroup;
  let edges_capturing, edges_representation, edges_dissemination;
  let fruition, digitization;

  //setup data viz
  //define simulations
  let element_sim, data_sim, tech_sim, dig_sim;

  //set sizes
  const DEFAULT = 1500;
  let width,
    height = DEFAULT;

  //set colors

  //create svg container
  const svg = d3
    .select(container)
    .append("svg")
    .attr("id", "data-visualisation")
    .style("display", "block")
    .style("background-color", "#fff")
    .style("margin", "0");

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
   *      - connessioni elemento a data source
   *          - edge (node preso da tabelle precedenti)
   *      - connessioni gruppo data a gruppo tecnologie
   *          - proposta -> 3 momenti di intervento della tecnologia
   *      - connessioni tecnologie a digitization
   *      - digitization e fruition
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
