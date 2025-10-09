/*** *****************************************
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
 ********************************************* ***/

// Thanks to Visual Cinnamon, Observable and Shirley Wu for inspiration
// This tool is built upon d3.js and bboxCollide libraries, and visualises
// the mapping of competences and technologies required to different fruitions output of projects

const createCompetencesMap = (container, dataset1, dataset2, dataset3) => {
  /**
   *
   *
   *
   */
  //////////////////////////////////////
  ////// Constants & Variables ////////
  /////////////////////////////////////

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

  /////////////////////DATASETS///////////////////////

  //populate datasets
  let skillData = dataset1;
  let techData = dataset2;
  let projData = dataset3;

  //unique lists
  let skills, //skill, frequency
    capTech, //uniqueId, frequency, type
    repTech, //same
    dissTech, //same
    projects, //uniqueId
    skillType; //uniqueId, angle

  //calc list
  let skills_in_skillType, //for type angle
    skills_in_Projects; //for skill radius

  //for simulations
  let nodes_skillToproj, nodes_projTotech;
  let edges_skillToproj, edges_projTotech;

  ////////////hover/clicked variables
  let vizProj;
  let clicked; //collect clicked nodes -- need to collect related?

  //modals + html variables
  let nodeModal, projModal;
  let header, label;
  let title, date, description, fruition_label, domain_label, hyperlink;

  /////////////////////GEOMETRY & VISUALS///////////////////////

  //colors
  const COLORS = {
    background: "#f5f5f0",
    //add others
  };

  /***
   * GEOM
   * raggio proj -> (spessore + buco interno = derivati)
   * padding proj
   *    raggio tech (derivato= raggio proj - padding proj)
   *        settori triangolari
   * raggio minimo vuoto centrale (da togliere a raggio tech)
   * raggio skilltype -> (spessore + buco interno = derivati)
   * angolo
   *    raggio padding esterno + raggio padding interno (o offset da capire) <-
   *        mid point interno, midpoint esterno
   *        centro Cerchi simulation
   *      -> (buco interno determinato da padding)
   ***/

  /////////set sizes
  const MIN_WIDTH = 660;
  let width = max(MIN_WIDTH, container.clientWidth);
  let height = container.clientHeight;

  let BOUNDARY_RADIUS = width / 2; //facendo così si riesce ad ottenere una versione "responsive"
  let PROJECTS_RADIUS;
  let TECHNOLOGY_RADIUS;
  let DONUT_RADIUS;

  let angle;

  /////////////////////FOR VISUALISATION///////////////////////

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

  //simulations
  let skill_sim, tech_sim;
};
