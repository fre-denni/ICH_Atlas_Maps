/********************************************
 * 
 *
 * 
 * 
 ▗▄▄▖ ▗▄▖ ▗▖  ▗▖▗▄▄▖  ▗▄▖ ▗▄▄▖ ▗▄▄▄▖ ▗▄▄▖ ▗▄▖ ▗▖  ▗▖    ▗▄▄▄▖▗▄▖  ▗▄▖ ▗▖   
▐▌   ▐▌ ▐▌▐▛▚▞▜▌▐▌ ▐▌▐▌ ▐▌▐▌ ▐▌  █  ▐▌   ▐▌ ▐▌▐▛▚▖▐▌      █ ▐▌ ▐▌▐▌ ▐▌▐▌   
▐▌   ▐▌ ▐▌▐▌  ▐▌▐▛▀▘ ▐▛▀▜▌▐▛▀▚▖  █   ▝▀▚▖▐▌ ▐▌▐▌ ▝▜▌      █ ▐▌ ▐▌▐▌ ▐▌▐▌   
▝▚▄▄▖▝▚▄▞▘▐▌  ▐▌▐▌   ▐▌ ▐▌▐▌ ▐▌▗▄█▄▖▗▄▄▞▘▝▚▄▞▘▐▌  ▐▌      █ ▝▚▄▞▘▝▚▄▞▘▐▙▄▄▖

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
// This tool is built upon d3.js and bboxCollide libraries, and help users
// to dinamically compare the data from the qualitative research on best practices in ICH projects

const createComparisonsTool = (container, data) => {
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
};
