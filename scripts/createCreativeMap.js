/********************************************
 * 
 *
 * 
 * 
 ▗▄▄▖▗▄▄▖ ▗▄▄▄▖ ▗▄▖▗▄▄▄▖▗▄▄▄▖▗▖  ▗▖▗▄▄▄▖     ▗▄▖ ▗▄▄▖ ▗▄▄▖ ▗▄▄▖  ▗▄▖  ▗▄▖  ▗▄▄▖▗▖ ▗▖▗▄▄▄▖ ▗▄▄▖
▐▌   ▐▌ ▐▌▐▌   ▐▌ ▐▌ █    █  ▐▌  ▐▌▐▌       ▐▌ ▐▌▐▌ ▐▌▐▌ ▐▌▐▌ ▐▌▐▌ ▐▌▐▌ ▐▌▐▌   ▐▌ ▐▌▐▌   ▐▌   
▐▌   ▐▛▀▚▖▐▛▀▀▘▐▛▀▜▌ █    █  ▐▌  ▐▌▐▛▀▀▘    ▐▛▀▜▌▐▛▀▘ ▐▛▀▘ ▐▛▀▚▖▐▌ ▐▌▐▛▀▜▌▐▌   ▐▛▀▜▌▐▛▀▀▘ ▝▀▚▖
▝▚▄▄▖▐▌ ▐▌▐▙▄▄▖▐▌ ▐▌ █  ▗▄█▄▖ ▝▚▞▘ ▐▙▄▄▖    ▐▌ ▐▌▐▌   ▐▌   ▐▌ ▐▌▝▚▄▞▘▐▌ ▐▌▝▚▄▄▖▐▌ ▐▌▐▙▄▄▖▗▄▄▞▘

    * Designed by Federico Denni & Chiara di Lodovico
    * Data researched and classified by Federica Rubino & Chiara di Lodovico
    * Coded by Federico Denni for Project TRAMA
    * seen on ichatlas.com
    * Politecnico di Milano - Design Department - Coordinated by Davide Spallazzo
    * iCoolHunt Spa
 *                                                                               
 *                                                                               
 *                                                                               
 **********************************************/

// Thanks to Visual Cinnamon, Observable and Shirley Wu for inspiration
// This tool is built upon d3.js and bboxCollide libraries, and visualises
// how data and projects are shaped depending on different creative approaches and methodologies
// more on creative approaches at -> inserire link to paper

const createCreativeMap = (container, data) => {
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

  //set sizes
  const MIN_WIDTH = 660;
  let width = max(MIN_WIDTH, container.clientWidth);
  let height = container.clientHeight;

  //create svg container
  const svg = d3
    .select(container)
    .append("svg")
    .attr("id", "data-visualisation")
    .style("display", "block")
    .attr("width", width)
    .attr("height", height)
    .style("background-color", "#fff")
    .style("margin", "0");

  //to handle resizing automatically
  //https://stackoverflow.com/questions/16265123/resize-svg-when-window-is-resized-in-d3-js
  // to see later

  const g = svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  /** Da vedere impostazione e connessione data */
};
