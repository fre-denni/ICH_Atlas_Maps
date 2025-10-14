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
  let atan2 = Math.atan2;

  /////////set sizes
  let width, height;
  let angle;

  const MIN_WIDTH = 660;
  const MAX_HEIGHT = 1250; //increase if you want really large viz on screens
  const PADDING = 24; //in scale of 8th
  const MAX_TECH_NODE = 16;
  const MAX_SKILL_NODE = 24;

  //variables for scaling
  const DEFAULT_SIZE = 1000;
  let SF;

  //working variables
  const DEBUG = "visible"; //"hidden";

  //proportional scaling
  let DONUT_WIDTH,
    DONUT_RADIUS,
    BOUNDARY_RADIUS,
    PROJECTS_RADIUS,
    TECHNOLOGY_RADIUS,
    CENTRAL_HOLE_RADIUS,
    SKILL_BOUNDARY_RADIUS;

  //////set scales
  const opacity_scale = d3.scaleLinear().range([0.4, 1.0]);
  const skill_radius_scale = d3.scaleSqrt().range([5, MAX_SKILL_NODE]);
  const skill_tech_scale = d3.scaleSqrt().range([4, MAX_TECH_NODE]);
  const boundary_scale = d3.scaleSqrt();
  const scale_link_distance = d3.scaleLinear().domain([1, 50]).range([10, 60]);
  const scale_link_width = d3.scalePow().exponent(0.75).range([1, 2, 40]);

  /////////////////////DATASETS///////////////////////

  //unique lists
  let skills, //skill, frequency
    capTech, //uniqueId, frequency, type
    repTech, //same
    dissTech, //same
    projects, //uniqueId
    skillType = []; //uniqueId, angle

  //for simulations (una lista da e per progetti?) (distinta da tipo?)
  let skills_in_skillType,
    edges_types = [];
  let tech_in_techType,
    edges_tech = [];
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
  let title,
    date,
    description,
    credits,
    fruition_label,
    domain_label,
    hyperlink = [];
  const DESCRIPTION_WORDS = 25; //to change if needed

  /////////////////////GEOMETRY & VISUALS///////////////////////

  //colors
  const COLORS = {
    background: "#f5f5f0",
    ui: "#440EB3",
    proj: "#8F8AEB",
    /**
    skills:,
    disstech:,
    reptech:,
    captech:, 
    */
    label: "#A3A3A3",
    text: "#121212",
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

  let g = svg.append("g"); //define widht & height?

  //////////////////////////////////
  ////// Manage Datasets //////////
  /////////////////////////////////

  /***
   *
   * Function to divide the various datasets in useful lists of skills and arrays
   * @param {Array} s - skills, skill type, related projects
   * @param {Array} t - projects, dissemination, representation and capturing technologies
   * @param {Array} p - cleaned titles for projects, projects, links, description, credits, domain, fruition (ignore external links)
   * @returns {Array} various list
   ***/
  function prepareData(s, t, p) {
    //call handle functions
    handleSkillsdata(s);
    handleTechdata(t);
    handleProjdata(p);
  } //prepareData()

  //parse and clean projects string format
  function parseProjectsString(projects) {
    if (!projects || projects.length <= 6) {
      return [];
    }
    const cleaned = projects.slice(3, -3);
    return cleaned.split('"", ""');
  } //parseProjectsString()

  function handleSkillsdata(data) {
    //Clean receveing data
    const cleaned = data.map((d) => ({
      skill: d.Skills,
      type: d["Skill Type"],
      projects: parseProjectsString(d.Projects),
    }));

    //Create a unique list of projects
    const allProjectsNames = new Set(cleaned.flatMap((d) => d.projects));
    projects = [...allProjectsNames];

    //Populate the skills list with frequency
    skills = cleaned.map((d) => ({
      skill: d.skill,
      frequency: d.projects.length,
    }));

    //Populate the skill type list wuith frequencies
    const typeFreq = d3.rollup(
      cleaned,
      (v) => v.length,
      (d) => d.type
    );
    skillType = Array.from(typeFreq, ([name, count]) => ({
      type: name,
      frequency: count,
    }));

    //Populate type and skill connection
    skills_in_skillType = d3.group(cleaned, (d) => d.type);
    edges_types = cleaned.map((d) => ({
      source: d.type,
      target: d.skill,
    }));

    //Populate projects connection
    const skillNodes = cleaned.map((d) => ({ id: d.skill, type: "skill" }));
    const typesNodes = cleaned.map((d) => ({ id: d.type, type: "Type" }));
    const projectNodes = projects.map((name) => ({
      id: name,
      type: "project",
    }));
    nodes_skillToproj = [...skillNodes, ...projectNodes, ...typesNodes];

    edges_skillToproj = cleaned.flatMap((d) =>
      d.projects.map((p) => ({
        source: d.skill,
        target: p,
      }))
    );
  } //handleSkillsdata()

  function handleTechdata(data) {
    const tech = data.flatMap((d) => {
      const l = [];
      if (d["capturing technologies"]) {
        l.push({
          project: d.projects,
          tech: d["capturing technologies"],
          type: "capt_tech",
        });
      }
      if (d["representation technologies"]) {
        l.push({
          project: d.projects,
          tech: d["representation technologies"],
          type: "rep_tech",
        });
      }
      if (d["Dissemination Technologies"]) {
        l.push({
          project: d.projects,
          tech: d["Dissemination Technologies"],
          type: "diss_tech",
        });
      }
      return l;
    });

    //Calculate frequency of tech
    const techFreq = d3.rollup(
      tech,
      (v) => v.length,
      (d) => d.tech
    );

    //create a set of unique id for each tech
    const uniqueTech = new Set(tech.map((d) => d.tech));
    capTech = [];
    repTech = [];
    dissTech = [];

    //populate the lists
    uniqueTech.forEach((t) => {
      const info = tech.find((d) => d.tech === t);
      const entry = {
        name: t,
        type: info.type,
        frequency: techFreq.get(t) || 0,
      };

      if (entry.type === "capt_tech") capTech.push(entry);
      if (entry.type === "rep_tech") repTech.push(entry);
      if (entry.type === "diss_tech") dissTech.push(entry);
    });

    //create a local list of unique projects
    const prj = new Set(tech.map((d) => d.projects));
    const prj_node = Array.from(prj).map((id) => ({ id, type: "project" }));

    //prepare nodes for simulation
    const nodes = Array.from(uniqueTech).map((t) => {
      const info = tech.find((d) => d.tech === t);
      return {
        id: t,
        type: info.type,
      };
    });

    //populate nodes to projects
    nodes_projTotech = [...prj_node, ...nodes];

    const edges = tech.map((d) => ({
      source: d.projects,
      target: d.tech,
    }));

    edges_projTotech = [...edges];

    //make types node
    const techTypeNodes = [
      { id: "cap_tech", type: "tech_type" },
      { id: "rep_tech", type: "tech_type" },
      { id: "diss_tech", type: "tech_type" },
    ];

    //populate tech types
    tech_in_techType = [...nodes, ...techTypeNodes];

    const type_edges = Array.from(uniqueTech).map((t) => {
      const info = tech.find((d) => d.tech === t);
      return {
        source: t,
        target: info.type,
      };
    });

    edges_tech = [...type_edges];
  } //handleTechdata()

  //to handle project description
  function truncate(text, limit) {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length > limit) {
      return words.slice(0, limit).join(" ") + "...";
    }
    return text;
  } //truncate()

  function handleProjdata(data) {
    //create the comparison list for showing prettier titles
    vizProj = data.map((d) => ({
      title: d.title,
      display: d.viz_title,
    }));

    //Populate the individual list from their respectives columns
    title = data.map((d) => d.title);
    date = data.map((d) => d.date);
    credits = data.map((d) => d.credits);
    fruition_label = data.map((d) => d.fruitionOutputs);
    domain_label = data.map((d) => d.ichDomains);
    hyperlink = data.map((d) => d.links_slug);

    //truncate the text
    description = data.map((d) => truncate(d.description, DESCRIPTION_WORDS));
  } //handleProjdata()

  //////////////////////////////////
  //////////// Mains //////////////
  /////////////////////////////////

  function draw() {
    g.selectAll("*").remove(); //clean the visualisation
    //call specific drawing and simulation functions;
    drawProjects(PROJECTS_RADIUS);
    const donut = drawDonut(DONUT_RADIUS);
    drawTech(CENTRAL_HOLE_RADIUS, TECHNOLOGY_RADIUS);
    //calculate mid-points and boundaries
    defineBoundaries(donut);

    //call simulations
    //call hover logic
  } //draw()

  function chart(skillData, techData, projData) {
    //data logic
    prepareData(skillData, techData, projData);
    //call resizing (first draw)
    chart.resize();
  } //chart())

  //////////////////////////////////
  ////// Drawing functions ////////
  /////////////////////////////////

  function drawProjects(radius) {
    //define rhombus width and height (responsive)
    const node_height = round(8 * SF);
    const node_width = round(8 * SF);
    //draw svg rhombus
    const rhombus = `M 0 ${-node_height / 2} L ${node_width / 2} 0 L 0 ${
      node_height / 2
    } L ${-node_width / 2} 0 Z`;

    //calculate positions
    const positions = projects.map((p, i) => {
      angle = (i / projects.length) * 2 * PI; //distribute evenly
      return {
        id: p,
        x: radius * SF * cos(angle),
        y: radius * SF * sin(angle),
      };
    });

    //how to rotate them so that the points are pointed to the center?
    //draw functions
    let project_ring = g
      .append("g")
      .attr("class", "project-ring")
      .selectAll("path")
      .data(positions)
      .join("path");

    let project_node = project_ring
      .attr("class", "project-node")
      .attr("d", rhombus)
      .attr("fill", "green")
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`);
  } //drawProjects()

  function drawDonut(radius) {
    //define thickness of the donut ring
    const thickness = PADDING * SF;

    //define arc
    const arc = d3
      .arc()
      .innerRadius(radius - thickness / 2)
      .outerRadius(radius + thickness / 2);

    const pie = d3
      .pie()
      .value((d) => d.frequency)
      .sort(null)
      .padAngle(0.015);

    //get the data for the angles
    const data = pie(skillType);

    g.append("g")
      .attr("class", "donut-skill")
      .selectAll("path")
      .data(data)
      .join("path")
      .attr("class", "slice-type")
      .attr("d", arc)
      .attr("fill", COLORS.ui);

    return { thickness, data, arc };
  } //drawDonut()

  function drawTech(radius, hole) {
    //define the arc for the technology area
    const arc = d3.arc().innerRadius(hole).outerRadius(radius);

    //define pie
    const pie = d3.pie().sort(null).padAngle(0.02);
    const slices = pie([1, 1, 1]);

    //draw
    g.append("g")
      .attr("class", "technology-areas")
      .selectAll("path")
      .data(slices)
      .join("path")
      .attr("class", "tech-area")
      .attr("d", arc)
      .attr("fill", "gray");
    //to change later
  } //drawTech()

  //define boundaries
  function defineBoundaries({ thickness, data, arc }) {
    // define parameters
    const inner = DONUT_RADIUS - (thickness - thickness / 4);
    const outer = DONUT_RADIUS + thickness * 1.5 + SKILL_BOUNDARY_RADIUS;
    const frequency = d3.extent(data, (d) => d.data.frequency);

    //create scale
    boundary_scale
      .domain(frequency)
      .range([SKILL_BOUNDARY_RADIUS / 2, SKILL_BOUNDARY_RADIUS * 2]);

    //assign coordinates
    data.forEach((d) => {
      const centroid = arc.centroid(d);
      angle = atan2(centroid[1], centroid[0]);

      d.innerX = inner * cos(angle);
      d.innerY = inner * sin(angle);
      d.outerX = outer * cos(angle);
      d.outerY = outer * sin(angle);
    });

    //draw points
    const points = g.append("g").attr("class", "anchors");

    points
      .selectAll("circle.inner-point")
      .data(data)
      .join("circle")
      .attr("class", "inner-point")
      .attr("cx", (d) => d.innerX)
      .attr("cy", (d) => d.innerY)
      .attr("r", 3 * SF)
      .attr("fill", "gray")
      .attr("visibility", DEBUG);

    points
      .selectAll("circle.outer-point")
      .data(data)
      .join("circle")
      .attr("class", "outer-point")
      .attr("cx", (d) => d.outerX)
      .attr("cy", (d) => d.outerY)
      .attr("r", 3 * SF)
      .attr("fill", "gray")
      .attr("visibility", DEBUG);

    const boundaries = g.append("g").attr("class", "skill-boundaries");

    boundaries
      .selectAll("circle.boundary")
      .data(data)
      .join("circle")
      .attr("class", "boundary")
      .attr("cx", (d) => d.outerX)
      .attr("cy", (d) => d.outerY)
      .attr("r", (d) => boundary_scale(d.data.frequency))
      .attr("fill", "none")
      .attr("stroke", "gray")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4")
      .attr("visibility", DEBUG);
  } //defineBoundaries()

  //////////////////////////////////
  ////// Sizing functions /////////
  /////////////////////////////////

  //Calculate sizes
  function handleSizes(w, h) {
    //set ideal
    const diameter = min(w, h) - PADDING * 4; //sweet spot
    BOUNDARY_RADIUS = diameter / 2; //building block variable

    //define donut sizes
    DONUT_RADIUS = round(BOUNDARY_RADIUS / 1.24); //max dimension of the skill donut
    DONUT_WIDTH = DONUT_RADIUS * 2;

    //Calculate main scale factor
    SF = DONUT_WIDTH / (DEFAULT_SIZE * 0.56);

    PROJECTS_RADIUS = round(DONUT_RADIUS * 0.67); //round(DONUT_RADIUS - (DONUT_RADIUS / 4 + 2 * PADDING)); //Project ring dimension
    TECHNOLOGY_RADIUS = round(PROJECTS_RADIUS * 0.7); //Tech circles domains

    //constructor circles
    CENTRAL_HOLE_RADIUS = round(BOUNDARY_RADIUS * 0.1); //empty central space
    SKILL_BOUNDARY_RADIUS = round(
      (BOUNDARY_RADIUS - DONUT_RADIUS - PADDING) / 2
    );

    //check if everythins is correct
    /*console.log("SF:" + SF);
    console.log("Donut widht:" + DONUT_WIDTH);
    console.log("Donut radius:" + DONUT_RADIUS);
    console.log("Boundary radius:" + BOUNDARY_RADIUS);
    console.log("Projects radius:" + PROJECTS_RADIUS);
    console.log("Technology radius:" + TECHNOLOGY_RADIUS);
    console.log("central hole radius:" + CENTRAL_HOLE_RADIUS);
    console.log("Boundary circle for skill radius:" + SKILL_BOUNDARY_RADIUS);*/
  } //handleSizes()

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
    draw();
  }; //handle resizes

  return chart;
};
