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
  let floor = Math.floor;
  let atan2 = Math.atan2;

  /////////set sizes
  let width, height;
  let angle;

  const MIN_WIDTH = 660;
  const MAX_HEIGHT = 1250; //increase if you want really large viz on screens
  const PADDING = 24; //in scale of 8th
  const MAX_TECH_NODE = 7;
  const MAX_SKILL_NODE = 8;
  let maxDiag, minDiag;

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
    .range([0, 0.03]);
  const scale_angle_end_offset = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, 0.02]);
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
  let typeToSkill; //contrary of skills_in_skillType

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

  const tech_colors = d3
    .scaleOrdinal()
    .domain(["capt_tech", "rep_tech", "diss_tech"])
    .range(["#FFC107", "#F44336", "#12446dff"]); // Yellow, Red, Blue

  const techTypeToSector = {
    capt_tech: 0,
    rep_tech: 1,
    diss_tech: 2,
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

    typeToSkill = new Map(nodes_skillToproj.map((s) => [s.skill, s.type]));
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

    console.log(capTech);
    console.log(dissTech);
    console.log(repTech);

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
      source: d.prj,
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

    //Clear any cached anchor data
    if (simulation) {
      simulation.stop();
      simulation = null;
    }

    //call specific drawing and simulation functions;
    drawProjects(PROJECTS_RADIUS);
    const donut = drawDonut(DONUT_RADIUS);
    const triad = drawTriad(CENTRAL_HOLE_RADIUS, TECHNOLOGY_RADIUS);
    //calculate mid-points and boundaries
    defineBoundaries(donut);

    //call simulations
    runSimSkills(donut.data);
    const technodes = positionTechNodes(triad);

    //create a map of the inner anchor point
    const inner_anchors = new Map(
      donut.data.map((d) => [
        d.data.type,
        { angle: d.angle, radius: d.inner_radius },
      ])
    );

    //prepare and calculate edge connection
    const sk_edges = drawSkilltoProjectEdges(inner_anchors);
    const tc_edges = drawProjToTechEdges(technodes);

    // draw default state
    drawOuterLines(sk_edges.forward);
    drawInnerLines(tc_edges.forward);

    // draw reverse state
    //drawOuterLines(sk_edges.reverse);
    //drawInnerLines(tc_edges.reverse);

    //draw
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
    maxDiag = round(8 * SF);
    minDiag = round(6 * SF);
    //draw svg rhombus
    const rhombus = `M 0 ${-maxDiag / 2} L ${minDiag / 2} 0 L 0 ${
      maxDiag / 2
    } L ${-minDiag / 2} 0 Z`;

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
      .value((d) => d.frequency) //() => 1) //
      .sort((a, b) => d3.descending(a.type, b.type))
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
    const pie = d3
      .pie()
      .sort(null)
      .padAngle(0.02) //increase for more space
      .startAngle(-PI / 2)
      .endAngle((3 * PI) / 2);

    const frequencies = [capTech.length, repTech.length, dissTech.length];
    const slices = pie(frequencies);

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

    // Clear any old angle data to force fresh calculation
    data.forEach((d) => {
      delete d.angle;
      delete d.inner_radius;
      delete d.innerX;
      delete d.innerY;
      delete d.outerX;
      delete d.outerY;
    });

    //create scale
    boundary_scale
      .domain(frequency)
      .range([SKILL_BOUNDARY_RADIUS / 2, SKILL_BOUNDARY_RADIUS * 2]);

    //assign coordinates
    //assign coordinates - create fresh objects to avoid stale data
    data.forEach((d) => {
      const centroid = arc.centroid(d);
      angle = atan2(centroid[1], centroid[0]);

      // Force new calculation by creating new properties
      d.angle = angle;
      d.inner_radius = inner;
      d.innerX = inner * cos(angle);
      d.innerY = inner * sin(angle);
      d.outerX = outer * cos(angle);
      d.outerY = outer * sin(angle);
    });

    // DEBUG: Log to verify angles are updating
    /*console.log("=== BOUNDARIES RECALCULATED ===");
    console.log(
      "First slice angle:",
      data[0].angle,
      "Type:",
      data[0].data.type
    );
    console.log(
      "Last slice angle:",
      data[data.length - 1].angle,
      "Type:",
      data[data.length - 1].data.type
    );*/

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

  /**
   * Function to position in a phyllotaxis grid the technology nodes
   * IMPORTANT: the angles for the phyllo grid are different from the pie()
   * and drawRadialLine() function, so for it to work the exact coordinates are stored
   * and then convert it back in drawProjtoTechEdges()
   * @param {Object}  - coordinates of the slice
   * @returns {Object} - x,y and polar coordinates of the nodes
   */
  function positionTechNodes({ slices }) {
    //get the needed technologies and transform them in points
    const all = tech_in_techType.filter((d) => d.type !== "tech_type");
    const required = all.length;
    const total = round(required * 1.3);

    //generate master grid
    const master = [];
    for (let i = 0; master.length < total; i++) {
      const [x, y] = phyllotaxis(
        i,
        TECHNOLOGY_RADIUS - PADDING / 3,
        CENTRAL_HOLE_RADIUS,
        total * 1.25
      );
      master.push({ x, y });
    }

    const filtered_grid = master.filter((p) => {
      angle = atan2(p.x, -p.y);

      if (angle < slices[0].startAngle) {
        angle += TAU;
      }

      const isInSector = slices.some((sector) => {
        const radius = sqrt(p.x ** 2 + p.y ** 2);
        const padding = (12 * SF) / radius;
        return (
          angle > sector.startAngle + padding &&
          angle < sector.endAngle - padding
        );
      });

      return isInSector;
    });

    const boundaryCircles = g
      .append("g")
      .attr("class", "debug-boundary-circles")
      .attr("visibility", DEBUG);

    // Outer boundary circle
    boundaryCircles
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", TECHNOLOGY_RADIUS - PADDING / 2)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4");

    // Inner boundary circle
    boundaryCircles
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", CENTRAL_HOLE_RADIUS + PADDING / 2)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4");

    g.append("g")
      .attr("class", "debug-phyllotaxis-grid")
      .selectAll("circle")
      .data(master)
      .join("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 1.5)
      .attr("fill", "black")
      .attr("opacity", 0.5)
      .attr("visibility", DEBUG);

    //define three sectors
    const sectors = { 0: [], 1: [], 2: [] };

    filtered_grid.forEach((p) => {
      angle = atan2(p.x, -p.y);
      if (angle < slices[0].startAngle) {
        angle += TAU;
      }

      const sectorIndex = slices.findIndex(
        (s) => angle >= s.startAngle && angle < s.endAngle
      );

      if (sectorIndex !== -1) {
        p.angle = atan2(p.x, -p.y);
        sectors[sectorIndex].push(p);
      }
    });

    for (const k in sectors) {
      sectors[k].sort((a, b) => b.x ** 2 + b.y ** 2 - (a.x ** 2 + a.y ** 2));
    }

    all.forEach((n) => {
      n.radius = skill_tech_scale(n.frequency);
    });

    const grouped = d3.group(all, (d) => d.type);
    const positionedNodes = [];

    ["capt_tech", "rep_tech", "diss_tech"].forEach((type) => {
      const types = grouped.get(type) || [];
      types.sort((a, b) => b.frequency - a.frequency);

      sectorIndex = techTypeToSector[type];
      const points = sectors[sectorIndex];

      types.forEach((n, i) => {
        if (points[i]) {
          n.x = points[i].x;
          n.y = points[i].y;
          n.angle = points[i].angle;
          n.radii = sqrt(n.x ** 2 + n.y ** 2);
          positionedNodes.push(n);
        }
      });
    });

    g.append("g")
      .attr("class", "tech-nodes")
      .selectAll("circle")
      .data(positionedNodes)
      .join("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => tech_colors(d.type))
      .attr("cx", 0)
      .attr("cy", 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 2.5)
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y);

    return positionedNodes;
  } //positionTechNodes

  //////////////////////////////////
  ////// Edges & Connections //////
  ////////////////////////////////

  //let's calculate the edge directions and curvature
  //adapted by this https://ich.unesco.org/dive/domain/?language=en visualisation
  //by Nadie Bremer for UNESCO
  function addEdgeSettings(d, source_a, target_a) {
    const angle_diff = target_a - source_a;

    if (angle_diff < -PI) {
      d.rotation = "cw";
      d.angle_sign = 1;
      d.total_angle = (TAU + angle_diff) / PI;
    } else if (angle_diff < 0) {
      d.rotation = "ccw";
      d.angle_sign = -1;
      d.total_angle = -angle_diff / PI;
    } else if (angle_diff < PI) {
      d.rotation = "cw";
      d.angle_sign = 1;
      d.total_angle = angle_diff / PI;
    } else {
      d.rotation = "ccw";
      d.angle_sign = -1;
      d.total_angle = (TAU - angle_diff) / PI;
    }
  } //addEdgeSettings()

  //draw edges between skills and projects
  function drawSkilltoProjectEdges(anchors) {
    console.log("=== ANCHORS RECEIVED IN drawSkilltoProjectEdges ===");
    anchors.forEach((value, key) => {
      console.log(
        `"${key}": angle=${value.angle.toFixed(
          3
        )}, radius=${value.radius.toFixed(2)}`
      );
    });

    //create map of coordinates
    const xy_proj = new Map(proj_pos.map((p) => [p.id, p]));
    const aggregate = new Map();

    /*
    // DEBUG: Check coordinate systems
    if (proj_pos.length > 0 && anchors.size > 0) {
      const sample_proj = proj_pos[0];
      const sample_anchor = Array.from(anchors.values())[0];

      console.log("=== OUTER LINES COORDINATE CHECK ===");
      console.log("Sample Project:", {
        id: sample_proj.id,
        angle_stored: sample_proj.angle,
        angle_from_xy: atan2(sample_proj.y, sample_proj.x),
        diff_deg: (
          ((atan2(sample_proj.y, sample_proj.x) - sample_proj.angle) * 180) /
          PI
        ).toFixed(2),
      });
      console.log("Sample Anchor:", {
        angle: sample_anchor.angle,
        note: "This uses atan2(y,x) from arc.centroid - STANDARD system",
      });
    }*/

    //prepare the data for each edge calculating its start and end points
    edges_skillToproj.map((edge) => {
      const project = xy_proj.get(edge.target);
      const types = typeToSkill.get(edge.source);
      const anchor = anchors.get(types);

      //Ensure we found all the necessary point
      if (!project || !anchor) return null;

      //recalculate project angle
      const project_angle = atan2(project.y, project.x);
      const key = `${types}, ${edge.target}`;

      if (!aggregate.has(key)) {
        const newEdge = {
          source_id: types,
          source_angle: anchor.angle,
          source_radius: anchor.radius,
          target_angle: project_angle,
          target_radius: PROJECTS_RADIUS,
          skills: [],
        };

        /*// DEBUG: Check if we need angle conversion
        if (!window.angleDebugDone) {
          console.log("=== ANGLE SYSTEM CHECK ===");
          console.log(
            "Anchor angle:",
            anchor.angle,
            "rad =",
            ((anchor.angle * 180) / PI).toFixed(1),
            "deg"
          );
          console.log(
            "Project angle:",
            project.angle,
            "rad =",
            ((project.angle * 180) / PI).toFixed(1),
            "deg"
          );
          console.log(
            "Project x,y:",
            project.x.toFixed(2),
            project.y.toFixed(2)
          );
          console.log(
            "Angle from x,y:",
            atan2(project.y, project.x),
            "rad =",
            ((atan2(project.y, project.x) * 180) / PI).toFixed(1),
            "deg"
          );
          window.angleDebugDone = true;
        }*/

        //Add rotation properties (cw/ccw)
        addEdgeSettings(newEdge, newEdge.source_angle, newEdge.target_angle);
        aggregate.set(key, newEdge);
      }

      // console.log(newEdge.source);
      aggregate.get(key).skills.push(edge.source);
    });

    const unique = Array.from(aggregate.values());
    const reverse = unique.map((d) => ({ ...d }));

    ///////// FORWARD (Skill to Project)
    unique.sort((a, b) => {
      // Sort by source angle (visual position in donut)
      // Normalize angles to [0, 2π) for consistent comparison
      const normalizeAngle = (ang) => {
        while (ang < 0) ang += TAU;
        while (ang >= TAU) ang -= TAU;
        return ang;
      };

      const angleA = normalizeAngle(a.source_angle);
      const angleB = normalizeAngle(b.source_angle);
      const angleDiff = angleA - angleB;

      // If angles are significantly different, sort by angle
      if (abs(angleDiff) > 0.01) return angleDiff;

      // If from same source (same angle), sort by rotation direction
      if (a.rotation < b.rotation) return -1;
      if (a.rotation > b.rotation) return 1;

      // If same rotation, sort by angular distance (ASCENDING)
      if (a.rotation === "ccw") {
        return b.total_angle - a.total_angle;
      } else {
        return a.total_angle - b.total_angle;
      }
    });

    /* // DEBUG: Verify edges are sorted by angle
    console.log("=== EDGES AFTER SORTING ===");
    const sortCheck = unique.slice(0, 10).map((e) => ({
      source: e.source_id,
      source_angle: e.source_angle.toFixed(3),
      target_angle: e.target_angle.toFixed(3),
      rotation: e.rotation,
    }));
    console.table(sortCheck);*/

    /*
    // DEBUG: Check if source_ids match anchor angles
    console.log("=== EDGE SORTING DEBUG ===");
    const sourceCheck = unique.slice(0, 5).map((e) => ({
      source_id: e.source_id,
      source_angle: e.source_angle,
      target_angle: e.target_angle,
      rotation: e.rotation,
      total_angle: e.total_angle.toFixed(3),
    }));
    console.table(sourceCheck);

    // Check if all source_ids have corresponding anchors
    const missingAnchors = unique.filter((e) => {
      const anchor = anchors.get(e.source_id);
      return !anchor;
    });
    if (missingAnchors.length > 0) {
      console.error(
        "MISSING ANCHORS:",
        missingAnchors.map((e) => e.source_id)
      );
    }*/

    //////// REVERSE SORTING (Project to Skill)
    reverse.sort((a, b) => {
      const normalizeAngle = (ang) => {
        while (ang < 0) ang += TAU;
        while (ang >= TAU) ang -= TAU;
        return ang;
      };

      //Sort by target
      const angleA = normalizeAngle(a.target_angle);
      const angleB = normalizeAngle(b.target_angle);
      const angleDiff = angleA - angleB;

      if (abs(angleDiff) > 0.01) return angleDiff;
      if (a.rotation < b.rotation) return -1;
      if (a.rotation > b.rotation) return 1;

      // DESCENDING for reverse direction
      if (a.rotation === "ccw") {
        return a.total_angle - b.total_angle; // Flipped!
      } else {
        return b.total_angle - a.total_angle; // Flipped!
      }
    });

    /// GROUP FORWARD EDGES (source)
    // This preserves the visual position ordering
    const angleKey = (angle) => {
      // Normalize to [0, 2π) and round to 3 decimal places
      let normalized = angle;
      while (normalized < 0) normalized += TAU;
      while (normalized >= TAU) normalized -= TAU;
      return round(normalized * 1000) / 1000;
    };

    const groupKey = (d) => {
      const angle = angleKey(d.source_angle);
      return `${angle}_${d.rotation}`;
    };

    const grouped_forward = d3.group(unique, groupKey);
    const nested_forward = [];

    grouped_forward.forEach((edges, key) => {
      const rotation = key.split("_")[1];
      nested_forward.push({
        rotation: rotation,
        values: edges,
        edges_count: edges.length,
      });
    });

    /// GROUP REVERSE EDGES (target)
    const groupKey_reverse = (d) => {
      const angle = angleKey(d.target_angle);
      return `${angle}_${d.rotation}`;
    };

    const grouped_reverse = d3.group(reverse, groupKey_reverse);
    const nested_reverse = [];

    grouped_reverse.forEach((edges, key) => {
      const rotation = key.split("_")[1];
      nested_reverse.push({
        rotation: rotation,
        values: edges,
        edges_count: edges.length,
      });
    });

    /*
    console.log("=== EDGES CREATED ===");
    console.log("Forward edges (Skills→Projects):", nested_forward.length, "groups");
    console.log("Reverse edges (Projects→Skills):", nested_reverse.length, "groups");
    */

    return {
      forward: nested_forward,
      reverse: nested_reverse,
    };
  }

  //draw edges between projects and techs
  function drawProjToTechEdges(nodes) {
    //create lookup maps for project and technology positions
    /*const tech_positions = new Map(
      //convert to polar
      nodes.map((t) => [t.id, { angle: t.angle, radius: t.radii }])
    );*/

    const project_positions = new Map(
      //convert to polar with corrected angle for edge calculations
      proj_pos.map((p) => {
        const standard_angle = atan2(p.y, p.x);
        return [p.id, { angle: standard_angle, radius: PROJECTS_RADIUS }];
      })
    );

    const tech_positions = new Map(
      nodes.map((t) => {
        // Recalculate BOTH angle and radius from actual x,y coordinates
        // This ensures the edge endpoint matches the node position exactly
        const standard_angle = atan2(t.y, t.x);
        const actual_radius = sqrt(t.x * t.x + t.y * t.y);
        return [t.id, { angle: standard_angle, radius: actual_radius }];
      })
    );

    // Debug: Check a few mappings
    /*if (nodes.length > 0) {
      const sample = nodes[0];
      const mapped = tech_positions.get(sample.id);
      console.log("Tech node mapping check:");
      console.log("  Node:", {
        id: sample.id,
        x: sample.x,
        y: sample.y,
        stored_angle: sample.angle,
        stored_radii: sample.radii,
      });
      console.log("  Mapped:", mapped);
      console.log("  Angle diff (radians):", mapped.angle - sample.angle);
      console.log(
        "  Angle diff (degrees):",
        (((mapped.angle - sample.angle) * 180) / PI).toFixed(2)
      );
    }*/

    //prepare data for each edge
    const edgeData = edges_projTotech
      .map((edge) => {
        const source_pos = project_positions.get(edge.source);
        const target_pos = tech_positions.get(edge.target);

        if (!source_pos || !target_pos) return null;

        const newEdge = {
          source_id: edge.source,
          source_angle: source_pos.angle,
          source_radius: source_pos.radius,
          target_angle: target_pos.angle,
          target_radius: target_pos.radius,
        };

        addEdgeSettings(newEdge, newEdge.source_angle, newEdge.target_angle);
        return newEdge;
      })
      .filter(Boolean);

    //copy for reverse
    const reverse = edgeData.map((d) => ({ ...d }));

    ////// FORWARD GROUP (project -> tech)
    const grouped_forward = d3.group(edgeData, (d) => d.source_id);
    const nested_forward = [];

    grouped_forward.forEach((edge) => {
      edge.sort((a, b) => a.target_angle - b.target_angle);
      nested_forward.push({
        values: edge,
        edges_count: edge.length,
      });
    });

    ////// REVERSE GROUP (tech -> project)
    const grouped_reverse = d3.group(reverse, (d) => d.target_angle);
    const nested_reverse = [];

    grouped_reverse.forEach((edge) => {
      edge.sort((a, b) => b.source_angle - a.source_angle); // Descending
      nested_reverse.push({
        values: edge,
        edges_count: edge.length,
      });
    });

    /*
    console.log("=== TECH EDGES CREATED ===");
    console.log(
      "Forward edges (Projects→Tech):",
      nested_forward.length,
      "groups"
    );
    console.log(
      "Reverse edges (Tech→Projects):",
      nested_reverse.length,
      "groups"
    );*/

    return {
      forward: nested_forward, // Projects → Tech (hover on projects)
      reverse: nested_reverse, // Tech → Projects (hover on tech)
    };
  }

  /**
   * Generates the curving belly
   * @params {Object} - edge data object
   * @returns {String} SVG path string
   */
  function generateRadialPath(d) {
    const line_data = [];
    const source_r = d.source_radius;
    const target_r = d.target_radius;
    const rad_curve_line = d.rad_curve_line;

    // Calculate offset angles for the start and end of the curve's belly
    const start_angle =
      d.source_angle +
      d.angle_sign * scale_angle_start_offset(d.total_angle) * PI;
    const end_angle =
      d.target_angle -
      d.angle_sign * scale_angle_end_offset(d.total_angle) * PI;

    //Add actual starting point
    line_data.push({ angle: d.source_angle, radius: source_r });
    //add start of curved belly
    line_data.push({ angle: start_angle, radius: rad_curve_line });

    //calculate intermediate points
    let da_inner;
    if (d.target_angle - d.source_angle < -PI)
      da_inner = TAU + (end_angle - start_angle);
    else if (d.target_angle - d.source_angle < 0)
      da_inner = start_angle - end_angle;
    else if (d.target_angle - d.source_angle < PI)
      da_inner = end_angle - start_angle;
    else da_inner = TAU - (end_angle - start_angle);

    const step = 0.07;
    const n = abs(floor(da_inner / step));

    let curve_angle = start_angle;
    if (n >= 1) {
      for (let j = 0; j < n; j++) {
        curve_angle += d.angle_sign * step;
        line_data.push({ angle: curve_angle, radius: rad_curve_line });
      }
    }

    //add end of curve belly
    line_data.push({ angle: end_angle, radius: rad_curve_line });
    //add the actual end point
    line_data.push({ angle: d.target_angle, radius: target_r });

    //generate the final SVG path string
    return radialLine(line_data);
  } //generateRadialPath();

  /**
   * @param {Array} edges - the array of esge objects
   */
  function drawOuterLines(edges) {
    /*// DEBUG: What structure are we receiving?
    console.log("=== drawOuterLines INPUT ===");
    console.log("Number of edge groups:", edges.length);
    console.log("First group:", {
      rotation: edges[0]?.rotation,
      edges_count: edges[0]?.edges_count,
      first_edge: edges[0]?.values[0],
    });*/

    // Check if grouping makes sense
    const totalEdges = edges.reduce((sum, g) => sum + g.values.length, 0);
    console.log("Total edges across all groups:", totalEdges);

    //determine limits of the edges belly
    scale_curve_depth.domain([0, 2]).range([0.85, 0.65]);

    //determine width
    scale_fan_width.domain([1, 25]).range([PADDING * 0.5, PADDING * 3]);

    const flatEdges = edges.flatMap((group) => {
      //get angular distance
      const total_angle = group.values[0].total_angle;

      //calculate central radius
      const multiplier = scale_curve_depth(total_angle);
      const center_radius = DONUT_RADIUS * multiplier;

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

    /* // DEBUG: Check curve belly calculations
    console.log("=== OUTER LINES CURVE DEBUG ===");
    const curveDebug = flatEdges.slice(0, 5).map((e) => ({
      source_id: e.source_id,
      source_angle: e.source_angle.toFixed(3),
      target_angle: e.target_angle.toFixed(3),
      total_angle: e.total_angle.toFixed(3),
      rad_curve_line: e.rad_curve_line.toFixed(2),
      rotation: e.rotation,
    }));
    console.table(curveDebug);*/

    // Check if any curves have extreme or NaN values
    const badCurves = flatEdges.filter(
      (e) =>
        isNaN(e.rad_curve_line) ||
        e.rad_curve_line < DONUT_RADIUS * 0.5 ||
        e.rad_curve_line > DONUT_RADIUS
    );
    if (badCurves.length > 0) {
      console.error(
        "BAD CURVE VALUES:",
        badCurves.length,
        "edges with invalid rad_curve_line"
      );
    }

    g.append("g")
      .attr("class", "skill-project-edges")
      .selectAll("path")
      .data(flatEdges)
      .join("path")
      .attr("d", generateRadialPath)
      .attr("fill", "none")
      .attr("stroke", COLORS.label)
      .attr("stroke-width", 1.5 * SF)
      .attr("opacity", 0.5);

    //console.log("--- Angle Calculation Debug for ALL Edges ---");
    //console.table(angleDebugData);
  } //drawOuterLines()

  /**
   * @param {Array} edges - the array of esge objects
   */
  function drawInnerLines(edges) {
    // Define the channel for the project-to-tech curves
    scale_curve_depth.domain([0, 2]).range([1.05, 1.22]);

    scale_fan_width.domain([1, 10]).range([PADDING * 0.8, PADDING * 2]);

    const flatEdges = edges.flatMap((group) => {
      const total_angle = group.values[0].total_angle;

      const base_radius = PROJECTS_RADIUS * 0.76; //Adjust as needed
      const multiplier = scale_curve_depth(total_angle);
      const center_radius = base_radius * multiplier;

      const fan_width = scale_fan_width(group.edges_count);

      scale_rad_curve.domain([-1, group.edges_count]);
      const range_start = center_radius - fan_width / 2;
      const range_end = center_radius + fan_width / 2;
      scale_rad_curve.range([range_start, range_end]);

      group.values.forEach((edge, i) => {
        edge.rad_curve_line = scale_rad_curve(i);
      });
      return group.values;
    });

    // This logic is identical to drawLines, just with a different class
    g.append("g")
      .attr("class", "proj-tech-edges")
      .selectAll("path")
      .data(flatEdges)
      .join("path")
      .attr("d", generateRadialPath)
      .attr("fill", "none")
      .attr("stroke", COLORS.label)
      .attr("stroke-width", 1 * SF)
      .attr("opacity", 0.4);

    g.append("g")
      .attr("class", "debug-edge-endpoints")
      .selectAll("circle")
      .data(flatEdges)
      .join("circle")
      .attr("cx", (d) => d.target_radius * cos(d.target_angle))
      .attr("cy", (d) => d.target_radius * sin(d.target_angle))
      .attr("r", 3)
      .attr("fill", "red")
      .attr("opacity", 0.8)
      .attr("visibility", DEBUG);

    // Debug: Draw lines showing the "correct" straight path
    g.append("g")
      .attr("class", "debug-straight-lines")
      .selectAll("line")
      .data(flatEdges)
      .join("line")
      .attr("x1", (d) => d.source_radius * cos(d.source_angle))
      .attr("y1", (d) => d.source_radius * sin(d.source_angle))
      .attr("x2", (d) => d.target_radius * cos(d.target_angle))
      .attr("y2", (d) => d.target_radius * sin(d.target_angle))
      .attr("stroke", "blue")
      .attr("stroke-width", 1)
      .attr("opacity", 0.3)
      .attr("visibility", DEBUG);
  } //drawInnerLines()

  ///////////////////////////////////
  //////// HOVER AND CLICK //////////
  //////////////////////////////////

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
