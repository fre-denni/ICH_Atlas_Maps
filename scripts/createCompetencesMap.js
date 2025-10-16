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

//working variables
const DEBUG = "hidden";

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
  let pow = Math.pow;
  let ceil = Math.ceil;
  let floor = Math.floor;
  let atan2 = Math.atan2;

  /////////set sizes
  let width, height;
  let angle;

  const MIN_WIDTH = 660;
  const MAX_HEIGHT = 1250; //increase if you want really large viz on screens
  const PADDING = 24; //in scale of 8th
  const MAX_TECH_NODE = 8;
  const MAX_SKILL_NODE = 8;
  let node_height, node_width;

  //variables for scaling
  const DEFAULT_SIZE = 1000;
  let SF;

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
  const skill_radius_scale = d3
    .scaleSqrt()
    .range([MAX_SKILL_NODE / 2, MAX_SKILL_NODE]);
  const skill_tech_scale = d3.scaleSqrt();
  const boundary_scale = d3.scaleSqrt();
  const scale_link_width = d3.scalePow();
  const scale_rad_curve = d3.scaleLinear();
  const scale_angle_start_offset = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, 0.01]);
  const scale_angle_end_offset = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, 0.03]);
  const scale_curve_depth = d3.scaleLinear();
  const scale_fan_width = d3.scaleLinear().clamp(true);

  /////////////////////DATASETS///////////////////////

  //unique lists
  let skills, //skill, frequency
    capTech, //uniqueId, frequency, type
    repTech, //same
    dissTech, //same
    projects, //uniqueId
    skillType = []; //uniqueId, angle

  //collect the project positions
  let proj_pos = [];

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

  ///// DETERMINE LINE RADIAL
  const radialLine = d3
    .lineRadial()
    .angle((d) => d.angle + PI / 2)
    .radius((d) => d.radius)
    .curve(d3.curveBasis);

  //simulations
  let simulation;

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
    if (!projects) {
      return [];
    }
    try {
      const list = JSON.parse(projects);
      return Array.isArray(list) ? list : [];
    } catch (e) {
      console.error("Failed to parse projects string: ", list, e);
      return [];
    }
  } //parseProjectsString()

  function handleSkillsdata(data) {
    //Clean receveing data
    const cleaned = data
      .filter((d) => d.Skills && d["Skill Type"])
      .map((d) => ({
        skill: d.Skills.trim(),
        type: d["Skill Type"].trim(),
        projects: parseProjectsString(d.Projects),
      }));

    //console.log(cleaned[5]);

    //Create a unique list of projects
    const allProjectsNames = new Set(cleaned.flatMap((d) => d.projects));
    projects = [...allProjectsNames];

    //console.log(projects);

    //Populate the skills list with frequency
    skills = cleaned.map((d) => ({
      skill: d.skill,
      frequency: d.projects.length,
    }));

    //console.log(skills);

    //add domain to scale
    const domain = d3.extent(skills, (d) => d.frequency);
    skill_radius_scale.domain(domain);

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

    //console.log(skillType); //eliminate whitespace

    //Populate type and skill connection
    skills_in_skillType = d3.group(cleaned, (d) => d.type);
    edges_types = cleaned.map((d) => ({
      source: d.type,
      target: d.skill,
    }));

    //Populate projects connection
    nodes_skillToproj = cleaned;

    edges_skillToproj = cleaned.flatMap((d) =>
      d.projects.map((p) => ({
        source: d.skill,
        target: p,
      }))
    );

    shared_skills = cleaned;
  } //handleSkillsdata()

  function parseTechString(t) {
    //clean tech data
    if (!t) return [];
    let list = [];
    try {
      list = JSON.parse(t);
    } catch (e) {
      list = t.split(",");
    }
    //consistent data cleaning
    return list.map((d) => d.trim());
  }

  function handleTechdata(data) {
    const tech = data.flatMap((d) => {
      const prj = d.projects;
      const entries = [];

      const capt = parseTechString(d["capturing technologies"]);
      const rep = parseTechString(d["representation technologies"]);
      const dis = parseTechString(d["Dissemination Technologies"]);

      capt.forEach((t) => entries.push({ prj, tech: t, type: "capt_tech" }));
      rep.forEach((t) => entries.push({ prj, tech: t, type: "rep_tech" }));
      dis.forEach((t) => entries.push({ prj, tech: t, type: "diss_tech" }));

      return entries;
    });

    //Calculate frequency of tech
    const techFreq = d3.rollup(
      tech,
      (v) => v.length,
      (d) => d.tech
    );

    //set domain
    const domain = d3.extent(techFreq.values());
    skill_tech_scale.domain(domain);

    //populate the array with all techs
    const allTech = Array.from(techFreq.keys());

    capTech = [];
    repTech = [];
    dissTech = [];

    //populate the lists
    allTech.forEach((t) => {
      const info = tech.find((d) => d.tech === t);
      const entry = {
        name: t,
        type: info.type,
        frequency: techFreq.get(t),
      };

      if (entry.type === "capt_tech") capTech.push(entry);
      if (entry.type === "rep_tech") repTech.push(entry);
      if (entry.type === "diss_tech") dissTech.push(entry);
    });

    /*console.log(capTech[0]);
    console.log(repTech[0]);
    console.log(dissTech[0]);*/

    //create a local list of unique projects and tech
    const prj = new Set(tech.map((d) => d.projects));
    const prj_node = Array.from(prj).map((id) => ({ id, type: "project" }));

    //prepare nodes for simulation
    const nodes = allTech.map((t) => {
      const info = tech.find((d) => d.tech === t);
      return {
        id: t,
        type: info.type,
        frequency: techFreq.get(t),
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

    const type_edges = allTech.map((t) => {
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
    const triad = drawTriad(CENTRAL_HOLE_RADIUS, TECHNOLOGY_RADIUS);
    //calculate mid-points and boundaries
    defineBoundaries(donut);

    //create a map of the inner anchor point
    const inner_anchors = new Map(
      donut.data.map((d) => [
        d.data.type,
        { angle: d.angle, radius: d.inner_radius },
      ])
    );
    //console.log("1. Verifying Inner Anchors Map:", inner_anchors);

    //prepare and calculate edge connection
    const edges = drawSkilltoProjectEdges(inner_anchors);
    //draw lines
    drawLines(edges);

    //call simulations
    runSimSkills(donut.data);
    positionTechNodes(triad);
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
    node_height = round(8 * SF);
    node_width = round(6 * SF);
    //draw svg rhombus
    const rhombus = `M 0 ${-node_height / 2} L ${node_width / 2} 0 L 0 ${
      node_height / 2
    } L ${-node_width / 2} 0 Z`;

    //calculate positions
    const positions = projects.map((p, i) => {
      angle = (i / projects.length) * TAU - PI / 2; //distribute evenly
      return {
        id: p,
        x: radius * cos(angle),
        y: radius * sin(angle),
        angle: angle,
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

    project_ring
      .attr("class", "project-node")
      .attr("d", rhombus)
      .attr("fill", "green")
      .attr("transform", (d) => {
        const rotation = (d.angle * 180) / PI;
        return `translate(${d.x}, ${d.y}) rotate(${rotation})`;
      });

    //-> to do: rotate the vertices towards the center
    //make the positions public
    proj_pos = positions;
  } //drawProjects()

  function drawDonut(radius) {
    //define thickness of the donut ring
    const thickness = PADDING * SF;

    //define arc
    const arc = d3
      .arc()
      .cornerRadius(5)
      .innerRadius(radius - thickness / 2)
      .outerRadius(radius + thickness / 2);

    const pie = d3
      .pie()
      .value((d) => d.frequency)
      .sort((a, b) => b.frequency - a.frequency) //longest first
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

  function drawTriad(radius, hole) {
    //define the arc for the technology area
    const arc = d3.arc().cornerRadius(5).innerRadius(hole).outerRadius(radius);

    //define pie
    const pie = d3.pie().sort(null).padAngle(0.02); //increase for more space
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

    return { slices };
  } //drawTriad()

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

      d.angle = angle; //store angle
      d.inner_radius = inner; //store radius

      d.innerX = inner * cos(angle); //I don't think we need this anymore
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
  ////// Force-layouts sims ////////
  /////////////////////////////////

  //skill simulation
  function runSimSkills(s) {
    //create flat node array
    const nodes = s.flatMap((t) => {
      const type = t.data.type;
      const freq = t.data.frequency;
      const skill = skills_in_skillType.get(type);

      return skill.map((sk) => ({
        id: sk.skill,
        type: type,
        frequency: sk.projects.length, //frequency of skill
        anchorX: t.outerX, //assign anchors
        anchorY: t.outerY,
        radius: skill_radius_scale(sk.projects.length),
        boundary: boundary_scale(freq),
      }));
    });

    //draw skill nodes
    const node = g
      .append("g")
      .attr("class", "skill-nodes")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", COLORS.proj);

    //define behavior of nodes when in boundaries
    function boundForce() {
      for (const node of nodes) {
        const dx = node.x - node.anchorX;
        const dy = node.y - node.anchorY;
        const distance = sqrt(dx * dx + dy * dy);
        const maxDistance = node.boundary - node.radius;

        if (distance > maxDistance) {
          angle = atan2(dy, dx);
          node.x = node.anchorX + maxDistance * cos(angle);
          node.y = node.anchorY + maxDistance * sin(angle);
        }
      }
    }

    //create and run simulation
    simulation = d3
      .forceSimulation(nodes)
      .force("x", d3.forceX((d) => d.anchorX).strength(0.1))
      .force("y", d3.forceY((d) => d.anchorY).strength(0.1))
      .force(
        "collide",
        d3.forceCollide((d) => d.radius + 1)
      )
      .force("bound", boundForce);

    simulation.on("tick", () => {
      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    });
  } //runSimSkills()

  //define the phyllotaxis algoritm
  function phyllotaxis(i, rMax, rMin, points) {
    const theta = PI * (3 - sqrt(5)); //Golden angle
    //Use a square root scale for a more even distribution
    const r = sqrt(i / points) * (rMax - rMin) + rMin;
    const a = theta * i;

    return [r * cos(a), r * sin(a)];
  } //phyllotaxis();

  function positionTechNodes({ slices }) {
    //define the nodes and divide by type
    const all = tech_in_techType.filter((d) => d.type !== "tech_type");
    const required = all.length;
    const generated = required + 6;

    //build the grid generatively
    const master = [];
    let i = 0;

    while (master.length < generated) {
      const [x, y] = phyllotaxis(
        i,
        TECHNOLOGY_RADIUS - PADDING / 2,
        CENTRAL_HOLE_RADIUS - PADDING / 3,
        generated * 1.2 //more is generated to cover empty spaces
      );
      const point = { x, y };

      angle = atan2(point.x, -point.y);
      if (angle < 0) {
        angle += TAU;
      }

      const isInSector = slices.some((sector) => {
        const radiuses = sqrt(pow(point.x, 2) + pow(point.y, 2));
        const angularPadding = (12 * SF) / radiuses;
        return (
          angle >= sector.startAngle + angularPadding &&
          angle < sector.endAngle - angularPadding
        );
      });

      if (isInSector) {
        master.push(point);
      }

      i++;
    }

    //Let's filter the first 6 points for consistency
    const filtered_grid = master.slice(6);

    //draw the visual debug master
    g.append("g")
      .attr("class", "phyllo-grid")
      .selectAll("circle")
      .data(filtered_grid)
      .join("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 1.5)
      .attr("fill", "black")
      .attr("visibility", DEBUG);

    const techNodes = tech_in_techType.filter((d) => d.type !== "tech_type");
    //get tech nodes and calculate their visual radius
    techNodes.forEach((node) => {
      node.radius = skill_tech_scale(node.frequency);
    });
    //sort nodes by frequency
    techNodes.sort((a, b) => b.frequency - a.frequency);

    //sort grid point
    filtered_grid.sort((a, b) => {
      const dA = sqrt(pow(a.x, 2) + pow(a.y, 2));
      const dB = sqrt(pow(b.x, 2) + pow(b.y, 2));
      return dA - dB;
    });

    techNodes.forEach((node, index) => {
      if (filtered_grid[index]) {
        node.x = filtered_grid[index].x;
        node.y = filtered_grid[index].y;
      }
    });

    //create and animate the nodes
    //JOIN THEM TO THE DOM - PRAISE THE DOM
    const nodes = g
      .append("g")
      .attr("class", "tech-nodes")
      .selectAll("circle")
      .data(techNodes)
      .join("circle");

    //set initial state
    nodes
      .attr("r", (d) => d.radius)
      .attr("fill", COLORS.ui)
      .attr("cx", 0)
      .attr("cy", 0);

    //animate
    nodes
      .transition()
      .duration(800)
      .delay((d, i) => i * 2.5)
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y);
  } //positionTechNodes()

  //////////////////////////////////
  ////// Edges & Connections //////
  ////////////////////////////////

  //let's calculate the edge directions and curvature
  //adapted by this https://ich.unesco.org/dive/domain/?language=en visualisation
  //by Nadie Bremer & UNESCO
  function addEdgeSettings(d, source_a, target_a) {
    if (target_a - source_a < -PI) {
      d.rotation = "cw"; //clockwise
      d.total_angle = 2 + (target_a - source_a) / PI;
      d.angle_sign = 1;
    } else if (target_a - source_a < 0) {
      d.rotation = "ccw"; //counter-clockwise
      d.total_angle = (source_a - target_a) / PI;
      d.angle_sign = -1;
    } else if (target_a - source_a < PI) {
      d.rotation = "cw";
      d.total_angle = (target_a - source_a) / PI;
      d.angle_sign = 1;
    } else {
      d.rotation = "ccw";
      d.total_angle = 2 - (target_a - source_a) / PI;
      d.angle_sign = -1;
    }
  } //addEdgeSettings()

  //draw edges between nodes and projects
  function drawSkilltoProjectEdges(anchors) {
    //create map of coordinates
    const xy_proj = new Map(proj_pos.map((p) => [p.id, p]));
    const skillToType = new Map(
      nodes_skillToproj.map((s) => [s.skill, s.type])
    );

    const aggregate = new Map();

    //prepare the data for each edge calculating its start and end points
    edges_skillToproj.map((edge) => {
      const project = xy_proj.get(edge.target);
      const skillType = skillToType.get(edge.source);
      const anchor = anchors.get(skillType);

      //Ensure we found all the necessary point
      if (!project || !anchor) return null;

      //create an unique key
      const key = `${skillType}, ${edge.target}`;

      if (!aggregate.has(key)) {
        const newEdge = {
          source_id: skillType,
          source_angle: anchor.angle,
          source_radius: anchor.radius,
          target_angle: project.angle,
          target_radius: PROJECTS_RADIUS,
          skills: [],
        };

        //Add rotation properties (cw/ccw)
        addEdgeSettings(newEdge, newEdge.source_angle, newEdge.target_angle);
        aggregate.set(key, newEdge);
      }

      // console.log(newEdge.source);
      aggregate.get(key).skills.push(edge.source);
    });

    const unique = Array.from(aggregate.values());

    unique.sort((a, b) => {
      //sort by the source id
      if (a.source_id < b.source_id) return -1;
      if (a.source_id > b.source_id) return 1;
      //sort by rotation
      if (a.rotation < b.rotation) return -1;
      if (a.rotation > b.rotation) return 1;
      //sort by angular distance
      if (a.rotation === "ccw") {
        return b.total_angle - a.total_angle;
      } else {
        return a.total_angle - b.total_angle;
      }
    });

    //group data by rotation
    const grouped = d3.group(unique, (d) => d.source_id);
    const nested = [];
    grouped.forEach((source) => {
      const groupByRotation = d3.group(source, (d) => d.rotation);
      groupByRotation.forEach((rotationEdges, rotation) => {
        nested.push({
          rotation: rotation,
          values: rotationEdges,
          edges_count: rotationEdges.length,
        });
      });
    });

    return nested;
  }

  //Debug points to see if coordinates are correct
  function drawDebugPoint(angle, radius, color = "red") {
    g.append("circle")
      .attr("class", "debug-point")
      .attr("cx", radius * cos(angle))
      .attr("cy", radius * sin(angle))
      .attr("r", 5) // Make it nice and big
      .attr("fill", color)
      .style("pointer-events", "none")
      .attr("visibility", DEBUG);
  }

  /**
   * @param {Array} edges - the array of esge objects
   */
  function drawLines(edges) {
    scale_curve_depth
      .domain([0, 2])
      .range([DONUT_RADIUS * 0.85, DONUT_RADIUS * 0.65]);

    scale_fan_width.domain([1, 25]).range([PADDING * 0.5, PADDING * 3]);

    const flatEdges = edges.flatMap((group) => {
      //get angular distance
      const total_angle = group.values[0].total_angle;

      //calculate central radius
      const center_radius = scale_curve_depth(total_angle);

      //calculate dynamic spacing
      const fan_width = scale_fan_width(group.edges_count);

      //Set the domain for our fanning scale
      scale_rad_curve.domain([-1, group.edges_count]);

      //Define the channel where the curves will be drawn
      const range_start = center_radius - fan_width / 2;
      const range_end = center_radius + fan_width / 2; //corresponding as a little
      scale_rad_curve.range([range_start, range_end]);

      //Calculate the berry of the radius
      group.values.forEach((edge, i) => {
        edge.rad_curve_line = scale_rad_curve(i);
      });

      return group.values;
    });

    const angleDebugData = [];
    let hasDebugged = false;

    g.append("g")
      .attr("class", "skill-project-edges")
      .selectAll("path")
      .data(flatEdges)
      .join("path")
      .attr("d", (d) => {
        const line_data = [];

        //get source and target coordinates in polar form
        /* const source_r = sqrt(d.source.x ** 2 + d.source.y ** 2);
        const target_r = sqrt(d.target.x ** 2 + d.target.y ** 2);*/

        const source_r = d.source_radius;
        const target_r = d.target_radius;

        const startOffset =
          d.angle_sign * scale_angle_start_offset(d.total_angle) * PI;
        const endOffset =
          d.angle_sign * scale_angle_end_offset(d.total_angle) * PI;
        const final_start_angle = d.source_angle + startOffset;
        const final_end_angle = d.target_angle - endOffset;

        angleDebugData.push({
          source_base_rad: d.source_angle,
          target_base_rad: d.target_angle,
          total_angle_for_scale: d.total_angle,
          start_offset_rad: startOffset,
          end_offset_rad: endOffset,
          final_start_angle_rad: final_start_angle,
          final_end_angle_rad: final_end_angle,
        });

        const rad_curve_line = d.rad_curve_line; //use pre-calculated radiuses

        //calculate offset angles
        const start_angle =
          d.source_angle +
          d.angle_sign * scale_angle_start_offset(d.total_angle) * PI;
        const end_angle =
          d.target_angle -
          d.angle_sign * scale_angle_end_offset(d.total_angle) * PI;

        if (!hasDebugged) {
          console.log("First edge:");
          console.log("Source Data (Cartesian):", d.source);
          console.log("Source Data (Polar):", {
            angle: d.source_angle,
            radius: source_r,
          });
          console.log("Target Data (Cartesian):", d.target);
          console.log("Target Data (Polar):", {
            angle: d.target_angle,
            radius: target_r,
          });

          // Draw a RED circle where the line STARTS
          drawDebugPoint(d.source_angle, source_r, "red");

          // Draw a BLUE circle where the line ENDS
          drawDebugPoint(d.target_angle, target_r, "blue");

          drawDebugPoint(start_angle, source_r, "black");
          drawDebugPoint(end_angle, target_r, "black");

          hasDebugged = true;
        }

        ///// Construct points for radial line generator

        //actual starting point
        line_data.push({ angle: d.source_angle, radius: source_r });

        //start of belly
        line_data.push({ angle: start_angle, radius: rad_curve_line });

        //intermidiate points
        let da_inner;
        if (d.target_angle - d.source_angle < -PI)
          da_inner = TAU + (end_angle - start_angle);
        else if (d.target_angle - d.source_angle < 0)
          da_inner = start_angle - end_angle;
        else if (d.target_angle - d.source_angle < PI)
          da_inner = end_angle - start_angle;
        else da_inner = TAU - (end_angle - start_angle);

        const step = 0.07;
        const n = abs(floor(da_inner / step)) - 1;
        let curve_angle = start_angle;
        let sign = d.rotation === "cw" ? 1 : -1;
        if (n >= 1) {
          for (let j = 0; j < n; j++) {
            curve_angle += sign * step;
            line_data.push({ angle: curve_angle, radius: rad_curve_line });
          }
        }

        //end of curve belly
        line_data.push({ angle: end_angle, radius: rad_curve_line });

        //actual end point (project node)
        line_data.push({ angle: d.target_angle, radius: target_r });

        //Generate the SVG path
        return radialLine(line_data);
      })
      .attr("fill", "none")
      .attr("stroke", COLORS.label)
      .attr("stroke-width", 1.5 * SF)
      .attr("opacity", 0.5);

    console.log("--- Angle Calculation Debug for ALL Edges ---");
    console.table(angleDebugData);
  }
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
    TECHNOLOGY_RADIUS = round(PROJECTS_RADIUS * 0.67); //Tech circles domains

    //constructor circles
    CENTRAL_HOLE_RADIUS = round(BOUNDARY_RADIUS * 0.1); //empty central space
    SKILL_BOUNDARY_RADIUS = round(
      (BOUNDARY_RADIUS - DONUT_RADIUS - PADDING) / 2
    );

    //check if everythins is correct
    console.log("Widht:" + w + ", Height:" + h);
    console.log("SF:" + SF);
    console.log("Donut widht:" + DONUT_WIDTH);
    console.log("Donut radius:" + DONUT_RADIUS);
    console.log("Boundary radius:" + BOUNDARY_RADIUS);
    console.log("Projects radius:" + PROJECTS_RADIUS);
    console.log("Technology radius:" + TECHNOLOGY_RADIUS);
    console.log("central hole radius:" + CENTRAL_HOLE_RADIUS);
    console.log("Boundary circle for skill radius:" + SKILL_BOUNDARY_RADIUS);
  } //handleSizes()

  //to update all the scales following the handlesize()
  function handleScales() {
    //update the range for the skill node radius
    skill_radius_scale.range([(MAX_SKILL_NODE / 2) * SF, MAX_SKILL_NODE * SF]);
    //update the range for the technology radius
    skill_tech_scale.range([(MAX_TECH_NODE / 2) * SF, MAX_TECH_NODE * SF]);
    //update the range for link stroke widths
    scale_link_width.exponent(0.75 * SF).range([1 * SF, 2 * SF, 40 * SF]); //maybe need to change exponent
  } //handleScale()

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

  return chart;
};
