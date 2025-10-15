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
  let pow = Math.pow;
  let atan2 = Math.atan2;

  /////////set sizes
  let width, height;
  let angle;

  const MIN_WIDTH = 660;
  const MAX_HEIGHT = 1250; //increase if you want really large viz on screens
  const PADDING = 24; //in scale of 8th
  const MAX_TECH_NODE = 12;
  const MAX_SKILL_NODE = 8;

  //variables for scaling
  const DEFAULT_SIZE = 1000;
  let SF;

  //working variables
  const DEBUG = "visible"; //hidden;

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
    if (!projects) {
      return [];
    }

    return projects
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  } //parseProjectsString()

  function handleSkillsdata(data) {
    //Clean receveing data
    const cleaned = data.map((d) => ({
      skill: d.Skills,
      type: d["Skill Type"],
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

    //console.log(skills[5]);

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
    const triad = drawTech(CENTRAL_HOLE_RADIUS, TECHNOLOGY_RADIUS);
    //calculate mid-points and boundaries
    defineBoundaries(donut);

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

    project_ring
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
      .attr("fill", "gray")
      .attr("visibility", DEBUG);

    return { slices, arc };
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
    skill_sim = d3
      .forceSimulation(nodes)
      .force("x", d3.forceX((d) => d.anchorX).strength(0.1))
      .force("y", d3.forceY((d) => d.anchorY).strength(0.1))
      .force(
        "collide",
        d3.forceCollide((d) => d.radius + 1)
      )
      .force("bound", boundForce);

    skill_sim.on("tick", () => {
      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    });
  } //runSimSkills()

  //define the phyllotaxis grid
  function createPhyllotaxisGrid(points, rmax, rmin) {
    //collect points
    const grid = [];
    const theta = PI * (3 - sqrt(5)); //golden angle

    for (let i = 0; i < points; i++) {
      const r = sqrt(i / points) * (rmax - rmin) + rmin;
      const a = theta * i;

      grid.push({
        x: r * cos(a),
        y: r * sin(a),
        occupied: false,
      });
    }
    return grid;
  }

  function occupyNearestGridPoints(nodes, points) {
    //larger nodes first
    const sorted = nodes.sort((a, b) => b.frequency - a.frequency);

    sorted.forEach((node) => {
      let closest = null;
      let minDistance = Infinity;

      //find the nearest unoccupied grid point
      points.forEach((point) => {
        if (!point.occupied) {
          const dx = node.anchorX - point.x;
          const dy = node.anchorY - point.y;
          const distance = dx * dx + dy * dy;
          if (distance < minDistance) {
            minDistance = distance;
            closest = point;
          }
        }
      });

      //Assign the node to the closest point
      if (closest) {
        node.x = closest.x;
        node.y = closest.y;
        closest.occupied = true;
      }
    });
  }

  /*function runSimTech({ slices, arc }) {
    //get the technology nodes
    const nodes = tech_in_techType.filter((d) => d.type !== "tech_type");

    //map center of the tech slices
    const anchors = new Map();
    const types = ["capt_tech", "rep_tech", "diss_tech"];
    slices.forEach((d, i) => {
      const centroid = arc.centroid(d);
      anchors.set(types[i], { x: centroid[0], y: centroid[1] });
    });

    //add anchor info and radius to technology nodes
    nodes.forEach((node) => {
      const anchor = anchors.get(node.type);
      node.anchorX = anchor.x;
      node.anchorY = anchor.y;
      node.radius = skill_tech_scale(node.frequency);
    });

    // draw the technology nodes
    const tech_node = g
      .append("g")
      .attr("class", "tech-nodes")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", "blue");

    //create a custom force to keep nodes within the boundaries
    function boundForce() {
      for (const node of nodes) {
        const distance = sqrt(node.x * node.x + node.y * node.y);
        const maxR = TECHNOLOGY_RADIUS - node.radius;
        const minR = CENTRAL_HOLE_RADIUS + node.radius;

        //if node is outside pull it back in
        if (distance > maxR) {
          angle = atan2(node.y, node.x);
          node.x = maxR * cos(angle);
          node.y = maxR * sin(angle);
        }

        //if node is inside pull it back in
        if (distance < minR) {
          angle = atan2(node.y, node.x);
          node.x = minR * cos(angle);
          node.y = minR * sin(angle);
        }
      }
    }

    //create and run simulation
    tech_sim = d3
      .forceSimulation(nodes)
      .force("x", d3.forceX((d) => d.anchorX).strength(0.05))
      .force("y", d3.forceY((d) => d.anchorY).strength(0.05))
      .force(
        "collide",
        d3.forceCollide((d) => d.radius + 1)
      )
      .force("bound", boundForce);

    tech_sim.on("tick", () => {
      tech_node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    });
  } */

  function positionTechNodes({ slices, arc }) {
    //define the nodes and divide by type
    const all = tech_in_techType.filter((d) => d.type !== "tech_type");
    const captNodes = all.filter((d) => d.type === "capt_tech");
    const repNodes = all.filter((d) => d.type === "rep_tech");
    const disNodes = all.filter((d) => d.type === "diss_tech");

    //generate the grid
    const total = all.length;
    const points = createPhyllotaxisGrid(
      total * 1.5,
      TECHNOLOGY_RADIUS,
      CENTRAL_HOLE_RADIUS
    );

    //define sectors of the arcs
    const sectors = {
      capturing: {
        startAngle: slices[0].startAngle,
        endAngle: slices[0].endAngle,
      },
      represent: {
        startAngle: slices[1].startAngle,
        endAngle: slices[1].endAngle,
      },
      disseminate: {
        startAngle: slices[2].startAngle,
        endAngle: slices[2].endAngle,
      },
    };

    //filter the grid point in three sub-grids
    const captGrid = points.filter((p) => {
      angle = (atan2(p.y, p.x) + TAU) % TAU;
      return (
        angle >= sectors.capturing.startAngle &&
        angle < sectors.capturing.endAngle
      );
    });
    const repGrid = points.filter((p) => {
      angle = (atan2(p.y, p.x) + TAU) % TAU;
      return (
        angle >= sectors.represent.startAngle &&
        angle < sectors.represent.endAngle
      );
    });
    const disGrid = points.filter((p) => {
      angle = (atan2(p.y, p.x) + TAU) % TAU;
      return (
        angle >= sectors.disseminate.startAngle &&
        angle < sectors.disseminate.endAngle
      );
    });

    //assing anchor points and then position the nodes
    [captNodes, repNodes, disNodes].forEach((n, i) => {
      const centroid = arc.centroid(slices[i]);
      n.forEach((node) => {
        node.anchorX = centroid[0];
        node.anchorY = centroid[1];
      });
    });

    occupyNearestGridPoints(captNodes, captGrid);
    occupyNearestGridPoints(repNodes, repGrid);
    occupyNearestGridPoints(disNodes, disGrid);

    //append the node at their final calculated positions
    g.append("g")
      .attr("class", "tech-nodes")
      .selectAll("circle")
      .data(all)
      .join("circle")
      .attr("r", (d) => skill_tech_scale(d.frequency))
      .attr("fill", COLORS.ui)
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y);
  }

  /* function positionTechNodes({ slices, arc }) {
    //define technology nodes
    const all = tech_in_techType.filter((d) => d.type !== "tech_type");
    const captNodes = all.filter((d) => d.type === "capt_tech");
    const repNodes = all.filter((d) => d.type === "rep_tech");
    const disNodes = all.filter((d) => d.type === "diss_tech");

    //generate the dynamic layout
    generatePhyllotaxis(captNodes, TECHNOLOGY_RADIUS, CENTRAL_HOLE_RADIUS);
    generatePhyllotaxis(repNodes, TECHNOLOGY_RADIUS, CENTRAL_HOLE_RADIUS);
    generatePhyllotaxis(disNodes, TECHNOLOGY_RADIUS, CENTRAL_HOLE_RADIUS);

    //find the center of each arc sector
    const sectorCenters = {
      capt_tech: arc.centroid(slices[0]),
      rep_tech: arc.centroid(slices[1]),
      diss_tech: arc.centroid(slices[2]),
    };

    //position the nodes by offsetting
    all.forEach((node) => {
      const [cx, cy] = sectorCenters[node.type];

      //position at the center, then rotate
      node.x += cx;
      node.y += cy;
    });

    //append the nodes to their final calculated position
    g.append("g")
      .attr("class", "tech-nodes")
      .selectAll("circle")
      .data(all)
      .join("circle")
      .attr("r", (d) => skill_tech_scale(d.frequency))
      .attr("fill", COLORS.ui)
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y);
  }*/

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

  //to update all the scales following the handlesize()
  function handleScales() {
    //update the range for the skill node radius
    skill_radius_scale.range([(MAX_SKILL_NODE / 2) * SF, MAX_SKILL_NODE * SF]);
    //update the range for the technology radius
    skill_tech_scale.range([(MAX_TECH_NODE / 2) * SF, MAX_TECH_NODE * SF]);
    //update the range for link stroke widths
    scale_link_width.exponent(0.75 * SF).range([1 * SF, 2 * SF, 40 * SF]); //maybe need to change exponent
  }

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
