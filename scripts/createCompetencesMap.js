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
  const opacity_scale = d3.scaleLinear().range([0.4, 1.0]);
  const skill_radius_scale = d3.scaleSqrt().range([5, MAX_SKILL_NODE]);
  const skill_tech_scale = d3.scaleSqrt().range([4, MAX_TECH_NODE]);
  const scale_link_distance = d3.scaleLinear().domain([1, 50]).range([10, 60]);
  const scale_link_width = d3.scalePow().exponent(0.75).range([1, 2, 40]);

  //open point -> serve da capire la questione dell'offset del donut ring

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
  const DESCRIPTION_WORDS = 25;

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
