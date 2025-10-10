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

//to handle resizing automatically
//https://stackoverflow.com/questions/16265123/resize-svg-when-window-is-resized-in-d3-js
// to see later

const createCompetencesMap = (container) => {
  /***
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

  /////////set sizes
  let width, height;
  let angle;

  const MIN_WIDTH = 660;
  const MAX_HEIGHT = 1250; //increase if you want really large viz on screens
  const PADDING = 24; //in scale of 8th
  const MAX_TECH_NODE = 16;
  const MAX_SKILL_NODE = 24;

  //proportional scaling
  let DONUT_WIDTH = max(width, height) - min(width, height);
  let DONUT_RADIUS = round(DONUT_WIDTH / 2); //max dimension of the skill donut
  let BOUNDARY_RADIUS = round(
    (height / 2 - DONUT_RADIUS - PADDING) / 2 + DONUT_RADIUS
  ); //max dimension of the chart
  let PROJECTS_RADIUS = round(DONUT_RADIUS - (DONUT_RADIUS / 4 + 2 * PADDING)); //Project ring dimension
  let TECHNOLOGY_RADIUS = round(
    (PROJECTS_RADIUS - PADDING) / 2 + PROJECTS_RADIUS / 4
  ); //Tech Circles domains

  //constructor circles
  let CENTRAL_HOLE_RADIUS = round(BOUNDARY_RADIUS / 10); //empty central space
  let SKILL_BOUNDARY_RADIUS = round(
    (BOUNDARY_RADIUS - DONUT_RADIUS - PADDING) / 2
  );

  //////set scales
  //quali?
  //-> skill nodes, tech nodes, angles (?)

  //open point -> serve da capire la questione dell'offset del donut ring

  /////////////////////DATASETS///////////////////////

  //unique lists
  let skills, //skill, frequency
    capTech, //uniqueId, frequency, type
    repTech, //same
    dissTech, //same
    projects, //uniqueId
    skillType = []; //uniqueId, angle

  //calc list
  let skills_in_skillType, //for type angle
    skills_in_Projects = []; //for skill radius

  //for simulations
  let nodes_skillToproj,
    nodes_projTotech = [];
  let edges_skillToproj,
    edges_projTotech = [];

  ////////////hover/clicked variables
  let vizProj,
    clicked = []; //collect clicked nodes -- need to collect related?

  //modals + html variables
  let nodeModal, projModal;
  let header, label;
  let title, date, description, fruition_label, domain_label, hyperlink;

  /////////////////////GEOMETRY & VISUALS///////////////////////

  //colors
  const COLORS = {
    background: "#f5f5f0",
  };

  /////////////////////FOR VISUALISATION///////////////////////

  //simulations
  let skill_sim, tech_sim;

  let svg = d3
    .select(container)
    .append("svg")
    .attr("id", "data-visualisation")
    .style("display", "block")
    .attr("width", width)
    .attr("height", height)
    .style("background-color", COLORS.background)
    .style("margin", "0");

  let g = svg.append("g");

  //////////////////////////////////
  ////// Manage Datasets //////////
  /////////////////////////////////

  function prepareData(s, t, p) {
    //dataset logic
    /**
     *
     */
  } //prepareData()

  //////////////////////////////////
  ////// Drawing functions ////////
  /////////////////////////////////

  function draw() {
    g.selectAll("*").remove(); //clean the visualisation

    //call specific drawing and simulation functions;

    //call simulations
    //call hover logic
  } //draw()

  function chart(skillData, techData, projData) {
    //create svg container
    //data logic
    //draw logic
    prepareData(skillData, techData, projData);
    chart.resize();
  } //chart())

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

    draw();
  }; //handle resizes

  return chart;
};
