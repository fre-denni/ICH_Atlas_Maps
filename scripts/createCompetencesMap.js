/********************************************
 * 
 *
 * 
 * 
 ▗▄▄▖ ▗▄▖ ▗▖  ▗▖▗▄▄▖ ▗▄▄▄▖▗▄▄▄▖▗▄▄▄▖▗▖  ▗▖ ▗▄▄▖▗▄▄▄▖ ▗▄▄▖    ▗▖  ▗▖ ▗▄▖ ▗▄▄▖ 
▐▌   ▐▌ ▐▌▐▛▚▞▜▌▐▌ ▐▌▐▌     █  ▐▌   ▐▛▚▖▐▌▐▌   ▐▌   ▐▌       ▐▛▚▞▜▌▐▌ ▐▌▐▌ ▐▌
▐▌   ▐▌ ▐▌▐▌  ▐▌▐▛▀▘ ▐▛▀▀▘  █  ▐▛▀▀▘▐▌ ▝▜▌▐▌   ▐▛▀▀▘ ▝▀▚▖    ▐▌  ▐▌▐▛▀▜▌▐▛▀▘ 
▝▚▄▄▖▝▚▄▞▘▐▌  ▐▌▐▌   ▐▙▄▄▖  █  ▐▙▄▄▖▐▌  ▐▌▝▚▄▄▖▐▙▄▄▖▗▄▄▞▘    ▐▌  ▐▌▐▌ ▐▌▐▌   

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
// the mapping of competences and technologies required to different fruitions output of projects

const createCompetencesMap = (container, data) => {
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

  //define data variables
  let skillDonut,
    techDonut = [];
  let nodes_skToProj,
    nodes_projToTech = [];
  let edges_skToProj, edges_projToTech;
  let projects;
  let techByGroups;

  let labels;
  //project label, data associated with (modal)

  //add defaults

  //simulations
  let skills_sim, tech_sim;

  //colors
  const COLORS = {
    background: "#f7f7f7",
    //add others
  };

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
    .style("background-color", COLORS.background)
    .style("margin", "0");

  //to handle resizing automatically
  //https://stackoverflow.com/questions/16265123/resize-svg-when-window-is-resized-in-d3-js
  // to see later

  const g = svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  /******
   *
   * Step visualisation
   *
   * - get the data from dataset
   *  - skill, skill group, frequency (number of project with skill)
   *  - skill, project node and edges
   *  - tech, techGroup, frequency
   *  - tech, project node and edges
   *  - number of tech, angle donut
   *
   * - skill to node -> raggruppa le skill per skill group (frequency dal numero di projects)
   * - frequcny determina angle slice donut
   * - dispose skill and skill groups by angle and donut padding
   *
   * - Dispose projects in angle (hardcode positions for better edges)
   * - Edges skill group (by skill) to projects (curved angles and directions)
   * - hovering logic
   *
   * - Tech simulation by custom shape (determined by angle -- frequency of total tech group)
   * - color per groups
   * - frequency by tech skill (presence in projects)
   * - edges, and hovering edges (moving space around nodes?)
   *
   * - display and position labels
   * - modals
   *
   */
};
