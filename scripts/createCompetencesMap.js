/*** *****************************************

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
                                                                             
 ********************************************* ***/

// Thanks to Visual Cinnamon, Observable and Shirley Wu for inspiration
// This tool is built upon d3.js and bboxCollide libraries, and visualises
// the mapping of competences and technologies required to different fruitions output of projects

//working variable
const DEBUG = "hidden";

const createCompetencesMap = (container) => {
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
  let ceil = Math.ceil;
  let floor = Math.floor;
  let atan2 = Math.atan2;

  /////////set sizes
  let width, height;
  let angle;

  const MIN_WIDTH = 660;
  const MAX_HEIGHT = 1250; //increase if you want really large viz on tall screens
  const PADDING = 24; //in scale of eights
  const MAX_TECH_NODE = 6;
  const MAX_SKILL_NODE = 8;
  const PROJ_NODE = 4;

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

  /////////////////////HOVER & CLICK VARIABLES ///////////////////////

  // global scope variables
  let sk_edges_curves_global;
  let tc_edges_curves_global;
  let donutData;

  //Hover states
  let hover_debounce_active = false;

  //SVG hover elements for projects
  let hover_project_paths = null;

  //lookup maps
  let skill_node_by_id;
  let project_node_by_id;
  let tech_node_by_id;
  let donut_arc_by_type;

  //Delaunay diagrams for efficient hover detection
  let delaunay_skills;
  let delaunay_techs;

  // Delaunay hover settings
  const HOVER_THRESHOLD_SKILL = 5; // pixels beyond node radius
  const HOVER_THRESHOLD_PROJECT = 10;
  const HOVER_THRESHOLD_TECH = 8; // pixels beyond node radius
  const PROJECT_ARC_PADDING = 6;

  //cache d3 selections
  let cache = null;

  //hover manager tool (manage all the hovering!)
  const HoverManager = {
    active: false,
    node: null,
    type: null, //types of node
    debounce: false,
    constants: {
      donut_inner_radius: 0,
      donut_outer_radiuse: 0, //donut
      proj_inner_r: 0,
      proj_outer_r: 0,
      num_projects: 0,
      padding_angle: 0,
      arc_width: 0,
      half_arc: 0,
    },
    //initialize hover detection
    setup() {
      // Clear previous listeners
      svg.on("mousemove.hover", null);
      svg.on("mouseleave", null);

      // Pre-calculate donut constants (computed once)
      this.constants.donut_inner_radius = donutData.inner;
      this.constants.donut_outer_radius =
        DONUT_RADIUS + donutData.thickness / 2;

      // Pre-calculate project hover constants (computed once)
      this.constants.proj_inner_r =
        PROJECTS_RADIUS - PROJ_NODE * SF - HOVER_THRESHOLD_PROJECT;
      this.constants.proj_outer_r =
        PROJECTS_RADIUS + PROJ_NODE * SF + HOVER_THRESHOLD_PROJECT;
      this.constants.num_projects = proj_pos.length;
      this.constants.padding_angle = PROJECT_ARC_PADDING / PROJECTS_RADIUS;
      this.constants.available_angle =
        TAU - this.constants.padding_angle * this.constants.num_projects;
      this.constants.arc_width =
        this.constants.available_angle / this.constants.num_projects;
      this.constants.half_arc = this.constants.arc_width / 2;

      // Setup event listeners
      svg.on("mousemove.hover", (event) => this.handleMouseMove(event));
      svg.on("mouseleave", () => this.handleMouseLeave());
    },
    //mouse handlers
    handleMouseMove(event) {
      const [mx, my] = d3.pointer(event);
      const adjusted_x = mx - width / 2;
      const adjusted_y = my - height / 2;

      const mouse_angle_raw = atan2(adjusted_y, adjusted_x);
      const mouse_radius = sqrt(adjusted_x ** 2 + adjusted_y ** 2);

      let mouse_angle = (mouse_angle_raw + PI / 2) % TAU;
      if (mouse_angle < 0) mouse_angle += TAU;

      // PRIORITY 1: Check donut (skill types)
      if (
        mouse_radius >= this.constants.donut_inner_radius &&
        mouse_radius <= this.constants.donut_outer_radius
      ) {
        const hoveredArc = donutData.data.find((d) => {
          let startAngle = d.startAngle;
          let endAngle = d.endAngle;

          if (endAngle < startAngle) {
            return mouse_angle >= startAngle || mouse_angle <= endAngle;
          } else {
            return mouse_angle >= startAngle && mouse_angle <= endAngle;
          }
        });

        if (hoveredArc) {
          this.onEnter(hoveredArc, "skill_type");
          return;
        }
      }

      // PRIORITY 2: Check projects
      if (
        mouse_radius >= this.constants.proj_inner_r &&
        mouse_radius <= this.constants.proj_outer_r
      ) {
        const hoveredProject = proj_pos.find((p) => {
          const startAngle = p.d3_angle - this.constants.half_arc;
          const endAngle = p.d3_angle + this.constants.half_arc;

          // Handle angle wrap-around
          if (startAngle < 0) {
            return mouse_angle >= startAngle + TAU || mouse_angle <= endAngle;
          } else if (endAngle > TAU) {
            return mouse_angle >= startAngle || mouse_angle <= endAngle - TAU;
          } else {
            return mouse_angle >= startAngle && mouse_angle <= endAngle;
          }
        });

        if (hoveredProject) {
          if (
            !this.active ||
            this.node?.id !== hoveredProject.id ||
            this.type !== "project"
          ) {
            this.onEnter(hoveredProject, "project");
          }
          return;
        }
      }

      // PRIORITY 3: Check skills and techs using Delaunay
      const found = findClosestNode(adjusted_x, adjusted_y);

      if (found) {
        if (
          !this.active ||
          this.node !== found.node ||
          this.type !== found.type
        ) {
          this.onEnter(found.node, found.type);
        }
      } else if (this.active) {
        this.onExit();
      }
    },
    //handle mouseleaves events
    handleMouseLeave() {
      if (this.active) {
        this.onExit();
      }
    },
    //hover enter/exit
    onEnter(node, type) {
      if (this.debounce) return;
      if (this.active && this.node === node && this.type === type) {
        return;
      }

      this.active = true;
      this.node = node;
      this.type = type;

      console.log(`Hover enter: ${type}`, node);

      if (ClickManager.active) {
        //check if hovered nodes is connected to clicked node
        const is_connected = ClickManager.isConnected(node, type);
        if (is_connected) {
          //hover on connected node
          ClickManager.onHoverConnected(node, type);
        } else {
          //show only tooltip
          if (type !== "skill_type") {
            let node_x, node_y;
            switch (type) {
              case "skill":
                node_x = node.x;
                node_y = node.y;
                break;
              case "project":
                const proj_node = project_node_by_id.get(node.id);
                node_x = proj_node.x;
                node_y = proj_node.y;
                break;
              case "tech":
                node_x = node.x;
                node_y = node.y;
                break;
            }

            showTooltip(node, type, node_x, node_y);
          }
        }

        return;
      }

      //update visual state
      this.updateVisuals(type, node);
      if (type !== "skill_type") {
        //change later to show other than the tooltip
        let node_x, node_y;

        switch (type) {
          case "skill":
            node_x = node.x;
            node_y = node.y;
            break;
          case "project":
            const proj_node = project_node_by_id.get(node.id);
            node_x = proj_node.x;
            node_y = proj_node.y;
            break;
          case "tech":
            node_x = node.x;
            node_y = node.y;
            break;
        }

        showTooltip(node, type, node_x, node_y);
      }
    },

    //called when exiting hover state
    onExit() {
      if (!this.active || this.debounce) return;
      this.debounce = true;

      //console.log("Hover exit");

      //Reset state BEFORE calling reset functions
      this.active = false;
      const prev_node = this.node;
      const prev_type = this.type;
      this.node = null;
      this.type = null;

      if (ClickManager.active) {
        ClickManager.onHoverExit();
      } else {
        // Reset visual state
        this.resetVisuals();
        hideTooltip();
      }

      // Release debounce after 50ms
      setTimeout(() => {
        this.debounce = false;
      }, 50);
    },
    //visual updates
    updateVisuals(type, node) {
      // Get edges and connected nodes based on type
      let edges_to_show = [];
      let connected_nodes = {};

      switch (type) {
        case "skill":
          edges_to_show = getEdgesFromSkill(node.id);
          connected_nodes = getConnectedToSkill(node);
          highlightSkillHover(node, connected_nodes);
          break;

        case "skill_type":
          const skill_type = node.data.type;
          edges_to_show = getEdgesFromSkillType(skill_type);
          connected_nodes = getConnectedToSkillType(skill_type);
          highlightSkillTypeHover(node, connected_nodes);
          break;

        case "project":
          connected_nodes = getConnectedToProject(node);
          const skill_ids = connected_nodes.skill_nodes.map((s) => s.id);
          const tech_ids = connected_nodes.tech_nodes.map((t) => t.id);
          const edges_from_skills = getEdgesBetweenSkillsAndProject(
            node.id,
            skill_ids
          );
          const edges_to_techs = getEdgesBetweenProjectAndTechs(
            node.id,
            tech_ids
          );
          edges_to_show = [...edges_from_skills, ...edges_to_techs];
          highlightProjectHover(node, connected_nodes);
          break;

        case "tech":
          connected_nodes = getConnectedToTech(node);
          const project_ids = connected_nodes.projects.map((p) => p.id);
          edges_to_show = getEdgesBetweenProjectsAndTech(node.id, project_ids);
          highlightTechHover(node, connected_nodes);
          break;
      }

      // Show edges
      this.showEdges(edges_to_show, type, node);
    },
    //reset visual state after hover
    resetVisuals() {
      this.hideAllEdges();
      resetAllNodesOpacity();
    },
    //edge visibility
    showEdges(edges, hoverType, hoverNode = null) {
      const edgeSet = new Set(edges);
      const edgeColor = getEdgeColorForHoverType(hoverType, hoverNode);

      // Update skill-project edges using cached selection
      cache.skill_edges
        .attr("opacity", (d) => (edgeSet.has(d) ? 0.8 : 0))
        .attr("stroke-width", (d) => (edgeSet.has(d) ? 2 * SF : 1.5 * SF))
        .attr("stroke", (d) => (edgeSet.has(d) ? edgeColor : COLORS.label));

      // Update project-tech edges using cached selection
      cache.tech_edges
        .attr("opacity", (d) => (edgeSet.has(d) ? 0.8 : 0))
        .attr("stroke-width", (d) => (edgeSet.has(d) ? 2 * SF : 1.5 * SF))
        .attr("stroke", (d) => (edgeSet.has(d) ? edgeColor : COLORS.label));
    },
    //hide all edges
    hideAllEdges() {
      cache.skill_edges.attr("opacity", 0).attr("stroke-width", 1.5 * SF);
      cache.tech_edges.attr("opacity", 0).attr("stroke-width", 1.5 * SF);
    },
  }; //HoverManager

  const ClickManager = {
    active: false,
    node: null,
    type: null,
    locked_edges: [],
    locked_connected: {},
    onClick(node, type) {
      //stop event propagation
      if (d3.event) d3.event.stopPropagation();
      if (this.active && this.node === node && this.type === type) {
        this.reset();
        return;
      }
      //console.log(`Click on: ${type}`, node);
      //set click state
      this.active = true;
      this.node = node;
      this.type = type;
      //store edges
      this.calculatedLockedState(node, type);
      //update visuals
      this.updateLockedVisuals();
    },
    calculatedLockedState(node, type) {
      let edges_to_show = [];
      let connected_nodes = {};
      switch (type) {
        case "skill":
          edges_to_show = getEdgesFromSkill(node.id);
          connected_nodes = getConnectedToSkill(node);
          break;

        case "skill_type":
          const skill_type = node.data.type;
          edges_to_show = getEdgesFromSkillType(skill_type);
          connected_nodes = getConnectedToSkillType(skill_type);
          break;

        case "project":
          connected_nodes = getConnectedToProject(node);
          const skill_ids = connected_nodes.skill_nodes.map((s) => s.id);
          const tech_ids = connected_nodes.tech_nodes.map((t) => t.id);
          const edges_from_skills = getEdgesBetweenSkillsAndProject(
            node.id,
            skill_ids
          );
          const edges_to_techs = getEdgesBetweenProjectAndTechs(
            node.id,
            tech_ids
          );
          edges_to_show = [...edges_from_skills, ...edges_to_techs];
          break;

        case "tech":
          connected_nodes = getConnectedToTech(node);
          const project_ids = connected_nodes.projects.map((p) => p.id);
          edges_to_show = getEdgesBetweenProjectsAndTech(node.id, project_ids);
          break;
      }
      this.locked_edges = edges_to_show;
      this.locked_connected = connected_nodes;
    },
    //update visuals
    updateLockedVisuals() {
      const { node, type, locked_connected } = this;
      // Use highlightNodes to set the visual state
      switch (type) {
        case "skill":
          highlightSkillHover(node, locked_connected);
          break;

        case "skill_type":
          highlightSkillTypeHover(node, locked_connected);
          break;

        case "project":
          highlightProjectHover(node, locked_connected);
          break;

        case "tech":
          highlightTechHover(node, locked_connected);
          break;
      }
      //show locked edges
      this.showLockedEdges();
      //show locked tooltip
      this.showLockedTooltip();
    },
    //show edges
    showLockedEdges() {
      const edgeSet = new Set(this.locked_edges);
      // Tutti gli edges locked hanno il COLORE DEL NODO CLICCATO
      const edgeColor = getEdgeColorForHoverType(this.type, this.node);

      // Update skill-project edges
      cache.skill_edges
        .attr("opacity", (d) => (edgeSet.has(d) ? 0.8 : 0))
        .attr("stroke-width", (d) => (edgeSet.has(d) ? 2 * SF : 1.5 * SF))
        .attr("stroke", (d) => {
          if (!edgeSet.has(d)) return COLORS.label;
          // TUTTI gli edges locked hanno lo stesso colore del nodo cliccato
          return edgeColor;
        });

      // Update project-tech edges
      cache.tech_edges
        .attr("opacity", (d) => (edgeSet.has(d) ? 0.8 : 0))
        .attr("stroke-width", (d) => (edgeSet.has(d) ? 2 * SF : 1.5 * SF))
        .attr("stroke", (d) => {
          if (!edgeSet.has(d)) return COLORS.label;
          // TUTTI gli edges locked hanno lo stesso colore del nodo cliccato
          return edgeColor;
        });
    },
    //show tooltip for locked node
    showLockedTooltip() {
      const { node, type } = this;
      let node_x, node_y;
      switch (type) {
        case "skill":
          node_x = node.x;
          node_y = node.y;
          break;
        case "project":
          const proj_node = project_node_by_id.get(node.id);
          node_x = proj_node.x;
          node_y = proj_node.y;
          break;
        case "tech":
          node_x = node.x;
          node_y = node.y;
          break;
      }

      showTooltip(node, type, node_x, node_y);
    },
    //reset click status
    reset() {
      //console.log("click reset");
      this.active = false;
      this.node = null;
      this.type = null;
      this.locked_edges = [];
      this.locked_connected = {};
      //Reset visuals
      resetAllNodesOpacity();
      this.hideAllEdges();
      hideTooltip();
    },
    //hide all edges
    hideAllEdges() {
      cache.skill_edges.attr("opacity", 0).attr("stroke-width", 1.5 * SF);
      cache.tech_edges.attr("opacity", 0).attr("stroke-width", 1.5 * SF);
    },
    //check if node is connceted to clicked node
    isConnected(node, type) {
      if (!this.active) return false;
      const { locked_connected } = this;
      switch (type) {
        case "skill":
          return locked_connected.skill_nodes?.some((n) => n.id === node.id);
        case "skill_type":
          return locked_connected.skill_type_arcs?.some(
            (arc) => arc.data.type === node.data.type
          );
        case "project":
          return locked_connected.projects?.some((p) => p.id === node.id);
        case "tech":
          return locked_connected.tech_nodes?.some((n) => n.id === node.id);
        default:
          return false;
      }
    },
    //handle hover on click mode
    onHoverConnected(node, type) {
      //console.log(`Hover on connected ${type} during click mode`);
      // Show tooltip for hovered node
      if (type !== "skill_type") {
        let node_x, node_y;
        switch (type) {
          case "skill":
            node_x = node.x;
            node_y = node.y;
            break;
          case "project":
            const proj_node = project_node_by_id.get(node.id);
            node_x = proj_node.x;
            node_y = proj_node.y;
            break;
          case "tech":
            node_x = node.x;
            node_y = node.y;
            break;
        }
        showTooltip(node, type, node_x, node_y);
      }

      this.highlightHoveredNode(node, type);

      if (this.type === "skill" && type === "project") {
        const connected = getConnectedToProject(node);
        const tech_ids_in_project = connected.tech_nodes.map((t) => t.id);
        //aumenta opacità dei nodi connessi
        cache.tech_nodes.attr("opacity", function (d) {
          if (tech_ids_in_project.includes(d.id)) {
            return 0.8;
          }
          const current_opacity = d3.select(this).attr("opacity");
          return current_opacity || 0.4;
        });
      }
      const ghost_edges = this.calculateGhostEdges(node, type);

      if (ghost_edges.length > 0) {
        this.showGhostEdges(ghost_edges, type, node);
      }
      if (this.type === "tech" && type === "project") {
        // Trova gli skill nodes connessi al project hoverato
        const connected = getConnectedToProject(node);
        const skill_ids_in_project = connected.skill_nodes.map((s) => s.id);

        // Aumenta opacità degli skill connessi a 0.6 per migliore leggibilità
        cache.skill_nodes.attr("opacity", function (d) {
          // Se è uno skill connesso al project hoverato
          if (skill_ids_in_project.includes(d.id)) {
            return 0.8; // Opacità aumentata
          }
          // Altrimenti mantieni l'opacità attuale
          const current_opacity = d3.select(this).attr("opacity");
          return current_opacity || 0.4;
        });
      }
    },

    //highlight hovered nodes
    highlightHoveredNode(node, type) {
      switch (type) {
        case "skill":
          cache.skill_nodes
            .filter((d) => d.id === node.id)
            .attr("opacity", 1.0);
          break;
        case "project":
          cache.project_nodes
            .filter((d) => d.id === node.id)
            .attr("opacity", 1.0)
            .attr("stroke", COLORS.background)
            .attr("stroke-width", 2 * SF);
          break;
        case "tech":
          cache.tech_nodes
            .filter((d) => d.id === node.id)
            .attr("opacity", 1.0)
            .attr("stroke", "gray") //change with the color tech
            .attr("stroke-width", 2 * SF);
          break;
      }
    },
    //calculate ghost edges
    calculateGhostEdges(hovered_node, hovered_type) {
      const { node: clicked_node, type: clicked_type } = this;
      let ghost_edges = [];

      if (clicked_type === "skill" && hovered_type === "project") {
        // Show tech edges from this project
        const connected = getConnectedToProject(hovered_node);
        const tech_ids = connected.tech_nodes.map((t) => t.id);
        ghost_edges = getEdgesBetweenProjectAndTechs(hovered_node.id, tech_ids);
      } else if (clicked_type === "tech" && hovered_type === "project") {
        // Show skill edges to this project
        const connected = getConnectedToProject(hovered_node);
        const skill_ids = connected.skill_nodes.map((s) => s.id);
        ghost_edges = getEdgesBetweenSkillsAndProject(
          hovered_node.id,
          skill_ids
        );
      } else if (clicked_type === "project" && hovered_type === "skill") {
        // Show edges to other projects from this skill
        const all_edges = getEdgesFromSkill(hovered_node.id);
        // Filter out edges to the clicked project
        ghost_edges = all_edges.filter((e) => e.target_id !== clicked_node.id);
      } else if (clicked_type === "project" && hovered_type === "tech") {
        // Show edges from other projects to this tech
        const connected = getConnectedToTech(hovered_node);
        const project_ids = connected.projects
          .map((p) => p.id)
          .filter((id) => id !== clicked_node.id);
        ghost_edges = getEdgesBetweenProjectsAndTech(
          hovered_node.id,
          project_ids
        );
      } else if (clicked_type === "project" && hovered_type === "skill_type") {
        // Do nothing - no ghost edges for skill_type
        ghost_edges = [];
      } else if (clicked_type === "skill" && hovered_type === "tech") {
        // Non mostrare ghost edges - mantieni solo locked edges visibili
        ghost_edges = [];
      } else if (clicked_type === "skill_type" && hovered_type === "project") {
        const connected = getConnectedToProject(hovered_node);
        const tech_ids = connected.tech_nodes.map((t) => t.id);
        ghost_edges = getEdgesBetweenProjectAndTechs(hovered_node.id, tech_ids);
      } else if (clicked_type === "skill" && hovered_type === "tech") {
        // Non mostrare ghost edges - mantieni solo locked edges visibili
        ghost_edges = [];
      } else if (clicked_type === "skill" && hovered_type === "skill_type") {
        // Non mostrare ghost edges - mantieni solo locked edges visibili
        ghost_edges = [];
      }

      return ghost_edges;
    },
    //show ghost edges
    showGhostEdges(ghost_edges, hover_type, hovered_node) {
      const edgeSet = new Set(ghost_edges);
      const { type: clicked_type } = this;

      // Combine locked edges (full opacity) and ghost edges (0.4 opacity)
      const locked_set = new Set(this.locked_edges);

      // Colore per gli edges locked (del nodo cliccato)
      const locked_color = getEdgeColorForHoverType(this.type, this.node);

      cache.skill_edges
        .attr("opacity", (d) => {
          if (locked_set.has(d)) return 0.8; // Locked edges
          if (edgeSet.has(d)) return 0.4; // Ghost edges
          return 0; // Hidden
        })
        .attr("stroke", (d) => {
          if (locked_set.has(d)) {
            // Locked edges: SEMPRE colore del nodo cliccato
            return locked_color;
          }
          if (edgeSet.has(d)) {
            // Ghost edges: SCENARIO 3: Click tech + hover project → verde
            if (clicked_type === "tech" && hover_type === "project") {
              return COLORS.proj;
            }
            // Default per ghost: COLORS.skill
            return COLORS.skill;
          }
          return COLORS.label;
        });

      cache.tech_edges
        .attr("opacity", (d) => {
          if (locked_set.has(d)) return 0.8; // Locked edges
          if (edgeSet.has(d)) return 0.4; // Ghost edges
          return 0; // Hidden
        })
        .attr("stroke", (d) => {
          if (locked_set.has(d)) {
            // Locked edges: SEMPRE colore del nodo cliccato
            return locked_color;
          }

          if (edgeSet.has(d)) {
            // Ghost edges: SCENARIO 1: Click skill + hover project → verde
            if (clicked_type === "skill" && hover_type === "project") {
              return COLORS.proj;
            }
            // Ghost edges: SCENARIO 1b: Click skill_type + hover project → verde
            if (clicked_type === "skill_type" && hover_type === "project") {
              return COLORS.proj;
            }
            // Ghost edges: SCENARIO 2: Click project + hover tech → colore del tech hoverato
            if (hover_type === "tech" && hovered_node) {
              return getEdgeColorForHoverType("tech", hovered_node);
            }
            // Fallback per ghost edges
            return COLORS.label;
          }

          return COLORS.label;
        });
    },
    //hover exit
    onHoverExit() {
      this.showLockedEdges();
      this.showLockedTooltip();

      // Reset nodes opacity to locked state
      const { locked_connected } = this;

      // Create Sets of locked node IDs for efficient lookup
      const locked_skill_ids = new Set(
        (locked_connected.skill_nodes || []).map((s) => s.id)
      );
      const locked_tech_ids = new Set(
        (locked_connected.tech_nodes || []).map((t) => t.id)
      );
      const locked_project_ids = new Set(
        (locked_connected.projects || []).map((p) => p.id)
      );

      // Reset ALL skill nodes: locked to 1.0, others to 0.4
      cache.skill_nodes.attr("opacity", (d) =>
        locked_skill_ids.has(d.id) ? 1.0 : 0.4
      );

      // Reset ALL tech nodes: locked to 1.0, others to 0.4
      cache.tech_nodes.each(function (d) {
        const is_clicked =
          d.id === ClickManager.node.id && ClickManager.type === "tech";

        if (!is_clicked) {
          d3.select(this)
            .attr("opacity", locked_tech_ids.has(d.id) ? 1.0 : 0.4)
            .attr("stroke", "none");
        }
      });

      // Reset ALL project nodes: locked to 1.0, others to 0.4
      cache.project_nodes.each(function (d) {
        const is_clicked =
          d.id === ClickManager.node.id && ClickManager.type === "project";

        if (!is_clicked) {
          d3.select(this)
            .attr("opacity", locked_project_ids.has(d.id) ? 1.0 : 0.4)
            .attr("stroke", handleStrokes(COLORS.proj))
            .attr("stroke-width", 1.5);
        }
      });
    },
  }; //ClickManager

  //Node lookups and labels
  let vizProj;

  //tooltips
  let tooltip;
  let tooltip_content;
  let header, label;
  let cta;

  //Tooltip dimensions (SF = 1)
  const TOOLTIP_BASE = {
    width: 80, // max width
    padding_v: 8, // Vertical padding
    padding_h: 10, // Horizontal padding
    label_size: 7, // Label font size
    header_size: 10, // Header font size
    label_margin: 2, // Space between label and header
    cta_size: 18, // CTA button size
    cta_offset: 40, // CTA vertical offset from bottom
    offset_y: 18, // Distance from node
  };

  //modals
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
    skill: "#8F8AEB",
    proj: "green",
    capt_tech: "#FFC107",
    rep_tech: "#F44336",
    diss_tech: "#12446dff",
    label: "#A3A3A3",
    text: "#121212",
  };

  const tech_colors = d3
    .scaleOrdinal()
    .domain(["capt_tech", "rep_tech", "diss_tech"])
    .range([COLORS.capt_tech, COLORS.rep_tech, COLORS.diss_tech]); // Yellow, Red, Blue

  const techTypeToSector = {
    //map tech sector to tech type
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

  //prepare data main function
  function prepareData(s, t, p) {
    //call handle functions
    handleSkillsdata(s);
    handleTechdata(t);
    handleProjdata(p);
  } //prepareData()

  //parse and clean projects string format
  function parseProjectsString(p) {
    if (!p) {
      return [];
    }
    try {
      const list = JSON.parse(p);
      return Array.isArray(list) ? list : [];
    } catch (e) {
      console.error("Failed to parse projects string: ", list, e);
      return [];
    }
  } //parseProjectsString()

  //manage data connection from dataset 1
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

    typeToSkill = new Map(nodes_skillToproj.map((s) => [s.skill, s.type]));
  } //handleSkillsdata()

  //parse and clean tech string format
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
  } //parseTechString()

  //manage data connection from dataset 2
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

  //manage data connection from dataset 3
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
  /////// Calculate positions //////
  /////////////////////////////////

  /***
   * Calculate all project node positions
   * @param {number} radius - at which projects are located
   * @returns {Array} - project object with x, y, angle
   */
  function calculateProjectPositions(radius) {
    const positions = projects.map((p, i) => {
      const angle = (i / projects.length) * TAU - PI / 2;
      let d3_angle = (angle + PI / 2) % TAU; // angle for hover
      if (d3_angle < 0) d3_angle += TAU;

      return {
        id: p,
        x: radius * cos(angle),
        y: radius * sin(angle),
        angle: angle,
        d3_angle: d3_angle,
        radius: PROJ_NODE * SF,
      };
    });

    return positions;
  } //calculateProjectPositions()

  /***
   * Calculate donut arc positions and boundaries
   * @param {number} radius - donut radius
   * @returns {Object} Donut data with arc positions
   */
  function calculateDonutPositions(radius) {
    const thickness = PADDING * SF; //capire il dimensionamento
    // Create arc generator (for calculations only)
    const arc = d3
      .arc()
      .cornerRadius(5)
      .innerRadius(radius - thickness / 2)
      .outerRadius(radius + thickness / 2);

    const pie = d3
      .pie()
      .value(() => 1) //(d) => d.frequency)
      .sort((a, b) => abs(a.frequency - 15) - abs(b.frequency - 75))
      .padAngle(0.03);

    const data = pie(skillType);

    // Calculate boundary positions
    const inner = radius - (thickness - thickness / 4);
    const outer = radius + thickness * 1.5 + SKILL_BOUNDARY_RADIUS;
    const frequency = d3.extent(data, (d) => d.data.frequency);

    // Update scale
    boundary_scale
      .domain(frequency)
      .range([SKILL_BOUNDARY_RADIUS / 2, SKILL_BOUNDARY_RADIUS * 2]);

    // Calculate all anchor positions
    data.forEach((d) => {
      const centroid = arc.centroid(d);
      const angle = atan2(centroid[1], centroid[0]);

      d.angle = angle;
      d.inner_radius = inner;
      d.innerX = inner * cos(angle);
      d.innerY = inner * sin(angle);
      d.outerX = outer * cos(angle);
      d.outerY = outer * sin(angle);
    });

    return { thickness, data, arc, inner, outer };
  } //calculateDonutPositions()

  /***
   * Calculate central triad of technologies
   * @param {number} radius - tech radius
   * @param {number} holde - central hole radius
   * @returns {Object} Triad data with slice positions
   */
  function calcTriad(radius, hole) {
    const pie = d3
      .pie()
      .sort(null)
      .padAngle(0.02)
      .startAngle(-PI / 2)
      .endAngle((3 * PI) / 2);

    const frequencies = [capTech.length, repTech.length, dissTech.length];
    const slices = pie(frequencies); //dimensions depending on number of tech

    return { slices, innerRadius: hole, outerRadius: radius };
  } //calcTriad()

  //define the phyllotaxis algoritm
  function phyllotaxis(i, rMax, rMin, points) {
    const theta = PI * (3 - sqrt(5)); //Golden angle
    //Use a square root scale for a more even distribution
    const r = sqrt(i / points) * (rMax - rMin) + rMin;
    const a = theta * i;

    return [r * cos(a), r * sin(a)];
  } //phyllotaxis()

  /***
   * Calculate technology node positions using the phyllotaxis
   * IMPORTANT: the angles for the phyllo grid are different from the pie()
   * @param {Object} triadData - triad sector data (slcies)
   * @returns {Array} Array of positioned tech nodes
   */
  function calcTechNodePosition(triadData) {
    const { slices } = triadData;
    // Get all tech nodes
    const all = tech_in_techType.filter((d) => d.type !== "tech_type");
    const required = all.length;
    const total = round(required * 1.3);

    // Generate phyllotaxis master grid
    const master = [];
    for (let i = 0; master.length < total; i++) {
      const [x, y] = phyllotaxis(
        i,
        TECHNOLOGY_RADIUS - PADDING / 2.5,
        CENTRAL_HOLE_RADIUS,
        total * 1.1
      );
      master.push({ x, y });
    }

    // Filter points that are within sectors
    const filtered_grid = master.filter((p) => {
      let angle = atan2(p.x, -p.y);

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

    // Organize into three sectors
    const sectors = { 0: [], 1: [], 2: [] };

    filtered_grid.forEach((p) => {
      let angle = atan2(p.x, -p.y);
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

    // Sort by distance from center
    for (const k in sectors) {
      sectors[k].sort((a, b) => b.x ** 2 + b.y ** 2 - (a.x ** 2 + a.y ** 2));
    }

    // Assign radius based on frequency
    all.forEach((n) => {
      n.radius = skill_tech_scale(n.frequency);
    });

    // Position nodes in sectors
    const grouped = d3.group(all, (d) => d.type);
    const positionedNodes = [];

    ["capt_tech", "rep_tech", "diss_tech"].forEach((type) => {
      const types = grouped.get(type) || [];
      types.sort((a, b) => b.frequency - a.frequency);

      const sectorIndex = techTypeToSector[type];
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

    return positionedNodes;
  } //calcTechNodePosition()

  /***
   * Calculate skillnode position
   * @param {Array} donutData - donut arc data
   * @returns {Array} Array of skill nodes
   */
  function calcSimSkills(donutData) {
    // Create flat node array
    const nodes = donutData.flatMap((t) => {
      const type = t.data.type;
      const freq = t.data.frequency;
      const skill = skills_in_skillType.get(type);

      return skill.map((sk) => ({
        id: sk.skill,
        type: type,
        frequency: sk.projects.length,
        anchorX: t.outerX,
        anchorY: t.outerY,
        radius: skill_radius_scale(sk.projects.length),
        boundary: boundary_scale(freq),
      }));
    });

    // Define boundary force
    function boundForce() {
      for (const node of nodes) {
        const dx = node.x - node.anchorX;
        const dy = node.y - node.anchorY;
        const distance = sqrt(dx * dx + dy * dy);
        const maxDistance = node.boundary - node.radius;

        if (distance > maxDistance) {
          const angle = atan2(dy, dx);
          node.x = node.anchorX + maxDistance * cos(angle);
          node.y = node.anchorY + maxDistance * sin(angle);
        }
      }
    }

    // Create and run simulation
    const sim = d3
      .forceSimulation(nodes)
      .force("x", d3.forceX((d) => d.anchorX).strength(0.1))
      .force("y", d3.forceY((d) => d.anchorY).strength(0.1))
      .force(
        "collide",
        d3.forceCollide((d) => d.radius + 1)
      )
      .force("bound", boundForce);

    // Run simulation synchronously to completion
    for (let i = 0; i < 300; ++i) sim.tick();
    sim.stop();

    return nodes;
  } //calcSimSkills()

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

    ///////// CALCULATE ALL POSITIONS
    proj_pos = calculateProjectPositions(PROJECTS_RADIUS);
    donutData = calculateDonutPositions(DONUT_RADIUS);
    const triadData = calcTriad(CENTRAL_HOLE_RADIUS, TECHNOLOGY_RADIUS);
    const technodes = calcTechNodePosition(triadData);
    const skillnodes = calcSimSkills(donutData.data);

    // Create anchor map
    const inner_anchors = new Map(
      donutData.data.map((d) => [
        d.data.type,
        { angle: d.angle, radius: d.inner_radius },
      ])
    );

    // Calculate edges
    const sk_edges = calcSkilltoProjectEdges(inner_anchors);
    const tc_edges = calcProjToTechEdges(proj_pos, technodes);

    // Calculate curve positions
    const sk_edges_curves = bellyCurve(sk_edges.forward, "outer");
    const tc_edges_curves = bellyCurve(tc_edges.forward, "inner");

    //Store references globally for hover
    sk_edges_curves_global = sk_edges_curves;
    tc_edges_curves_global = tc_edges_curves;

    //Build lookup maps for quick access
    buildNodeLookups(skillnodes, proj_pos, technodes);

    //Render in desired order
    drawTriad(triadData);
    drawDonut(donutData);

    // draw default state
    renderEdges(sk_edges_curves, "skill-project-edges", 1.5, 0);
    renderEdges(tc_edges_curves, "proj-tech-edges", 1.5, 0);

    //draw in order
    defineBoundaries(donutData);
    drawProjects(proj_pos);
    drawTechNodes(technodes);
    renderSkillNodes(skillnodes, true);

    //////// HOVER LOGIC
    buildDelaunayDiagrams(skillnodes, proj_pos, technodes);
    cache = {
      skill_nodes: g.selectAll(".skill-nodes circle"),
      project_nodes: g.selectAll(".project-ring circle"),
      tech_nodes: g.selectAll(".tech-nodes circle"),
      donut_arcs: g.selectAll(".donut-skill path"),
      skill_edges: g.selectAll(".skill-project-edges path"),
      tech_edges: g.selectAll(".proj-tech-edges path"),
    };

    //Setup hover
    HoverManager.setup();
    setupClickHandlers();
  } //draw()

  function chart(skillData, techData, projData) {
    // Initialize tooltip
    initTooltip();
    //data logic
    prepareData(skillData, techData, projData);
    //call resizing (first draw)
    chart.resize();
  } //chart())

  //////////////////////////////////
  ////// Drawing functions ////////
  /////////////////////////////////

  /***
   * Render projects nodes as SVG
   * @param {Array} positions
   */
  function drawProjects(positions) {
    let project_ring = g
      .append("g")
      .attr("class", "project-ring")
      .selectAll("circle")
      .data(positions)
      .join("circle");

    project_ring
      .attr("class", "project-node")
      .attr("r", (d) => d.radius)
      .attr("fill", COLORS.proj)
      .attr("stroke", handleStrokes(COLORS.proj)) // Dark green outline
      .attr("stroke-width", 1.5) // Outline thickness
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y);
  } //drawProjects()

  /***
   * Render donut arcs and boundaries
   * @param {Object} - precalculated donut positions
   */
  function drawDonut(donutData) {
    const { data, arc } = donutData;

    // Draw donut arcs
    g.append("g")
      .attr("class", "donut-skill")
      .selectAll("path")
      .data(data)
      .join("path")
      .attr("class", "slice-type")
      .attr("d", arc)
      .attr("fill", COLORS.ui)
      .attr("stroke", handleStrokes(COLORS.ui))
      .attr("stroke-width", 1.5);
  } //drawDonut()

  /***
   * Calculate and draw triad slices
   * @param {Object} - precalcualted data
   */
  function drawTriad(triadData) {
    const { slices, innerRadius, outerRadius } = triadData;

    const arc = d3
      .arc()
      .cornerRadius(5)
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    g.append("g")
      .attr("class", "technology-areas")
      .selectAll("path")
      .data(slices)
      .join("path")
      .attr("class", "tech-area")
      .attr("d", arc)
      .attr("fill", "gray")
      .attr("stroke", handleStrokes("gray"))
      .attr("stroke-width", 1.5);
  } //drawTriad()

  /**
   * @param {Object}  - coordinates of the slice
   * @returns {Object} - x,y and polar coordinates of the nodes
   */
  function drawTechNodes(nodes) {
    g.append("g")
      .attr("class", "tech-nodes")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => tech_colors(d.type))
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("cx", 0)
      //animation
      .attr("cy", 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 2.5)
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y);
  } //positionTechNodes

  /***
   * Render skill nodes with live simulation
   * @param {Array} nodes - precalculated skillnode
   * @param {boolean} animate - wheter to run live simulation
   */
  function renderSkillNodes(nodes, animate = false) {
    const nodeSelection = g
      .append("g")
      .attr("class", "skill-nodes")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", COLORS.skill)
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y);

    // Optional: Run live simulation for interactive movement
    if (animate) {
      // Define boundary force
      function boundForce() {
        for (const node of nodes) {
          const dx = node.x - node.anchorX;
          const dy = node.y - node.anchorY;
          const distance = sqrt(dx * dx + dy * dy);
          const maxDistance = node.boundary - node.radius;

          if (distance > maxDistance) {
            const angle = atan2(dy, dx);
            node.x = node.anchorX + maxDistance * cos(angle);
            node.y = node.anchorY + maxDistance * sin(angle);
          }
        }
      }

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
        nodeSelection.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
        rebuildSkillDelaunay(nodes);
      });
    }
  } //renderSkillNodes()

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

  /***
   * Calculate skill-to-project (by type) edges
   * @param {Map} anchors - skill type anchors
   * @param {Array} proj_pos - project positions
   * @return {Object} {forward: edges[], reverse: edges []}
   */
  function calcSkilltoProjectEdges(anchors) {
    //create map of coordinates
    const xy_proj = new Map(proj_pos.map((p) => [p.id, p]));
    const aggregate = new Map();

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

        //Add rotation properties (cw/ccw)
        addEdgeSettings(newEdge, newEdge.source_angle, newEdge.target_angle);
        aggregate.set(key, newEdge);
      }
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

    ////////// REVERSE SORTING (Project to Skill)

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

    return {
      forward: nested_forward,
      reverse: nested_reverse,
    };
  } //calcSkilltoProjectEdges()

  /**
   * Calculate project-to-tech edges (pure calculation, no rendering)
   * @param {Array} proj_pos - Project positions
   * @param {Array} technodes - Technology node positions
   * @returns {Object} {forward: edges[], reverse: edges[]}
   */
  function calcProjToTechEdges(proj_pos, technodes) {
    //create a map of the rpject and tech positions
    const project_positions = new Map(
      proj_pos.map((p) => {
        const standard_angle = atan2(p.y, p.x);
        return [p.id, { angle: standard_angle, radius: PROJECTS_RADIUS }];
      })
    );

    const tech_positions = new Map(
      technodes.map((t) => {
        const standard_angle = atan2(t.y, t.x);
        const actual_radius = sqrt(t.x * t.x + t.y * t.y);
        return [t.id, { angle: standard_angle, radius: actual_radius }];
      })
    );

    // Create edges
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

    const reverse = edgeData.map((d) => ({ ...d }));

    // FORWARD GROUPING (Projects → Tech)
    // Group by SOURCE (each project)
    const grouped_forward = d3.group(edgeData, (d) => d.source_id);
    const nested_forward = [];

    grouped_forward.forEach((edges) => {
      edges.sort((a, b) => a.target_angle - b.target_angle);
      nested_forward.push({
        values: edges,
        edges_count: edges.length,
      });
    });

    // REVERSE GROUPING (Tech → Projects)
    // Group by TARGET (each tech)
    const grouped_reverse = d3.group(reverse, (d) => d.target_angle);
    const nested_reverse = [];

    grouped_reverse.forEach((edges) => {
      edges.sort((a, b) => b.source_angle - a.source_angle);
      nested_reverse.push({
        values: edges,
        edges_count: edges.length,
      });
    });

    return {
      forward: nested_forward,
      reverse: nested_reverse,
    };
  } //calcProjToTechEdges

  /**
   * Generates the curving belly
   * @param {Object} - edge data object
   * @returns {String} SVG path string
   */
  function generateRadialPath(d) {
    if (!d.rad_curve_line) {
      console.error("Missing rad_curve_line for edge:", d);
      return ""; // Return empty path
    }

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

    const min_points = 16; // Minimum points even for short curves
    const max_points = 40; // Maximum points for very long curves

    // Calculate desired number of points based on angular distance
    let desired_points = ceil(abs(da_inner) * 8); // ~8 points per radian
    desired_points = max(min_points, min(max_points, desired_points));

    const step = abs(da_inner) / desired_points;
    const n = desired_points - 1; // We already have start/end

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

  /***
   * Calculate curve belly positions for edges
   * @param {Array} edges -edge groups
   * @param {string} type - 'outer' or 'inner'
   * @return {Array} Edges with rad_curve_line added
   */
  function bellyCurve(edges, type) {
    // Configure scales based on edge type
    if (type === "outer") {
      scale_curve_depth.domain([0, 2]).range([0.85, 0.65]);
      scale_fan_width.domain([1, 25]).range([0.5, 3.0]);
    } else {
      scale_curve_depth.domain([0, 2]).range([1.05, 1.22]);
      scale_fan_width.domain([1, 10]).range([0.8, 2.0]);
    }

    const flatEdges = edges.flatMap((group) => {
      // Get total_angle from first edge in group
      const total_angle = group.values[0].total_angle;

      // Calculate center radius with multiplier
      let center_radius;
      if (type === "outer") {
        const multiplier = scale_curve_depth(total_angle);
        center_radius = DONUT_RADIUS * multiplier;
      } else {
        const base_radius = PROJECTS_RADIUS * 0.76;
        const multiplier = scale_curve_depth(total_angle);
        center_radius = base_radius * multiplier;
      }

      // Calculate fan width with multiplier
      const fan_width_multiplier = scale_fan_width(group.edges_count);
      const fan_width = PADDING * SF * fan_width_multiplier;

      // Sort by angular distance (shortest first = innermost)
      group.values.sort((a, b) => a.total_angle - b.total_angle);

      // Calculate curve positions
      scale_rad_curve.domain([-1, group.edges_count]);
      const range_start = center_radius - fan_width / 2;
      const range_end = center_radius + fan_width / 2;
      scale_rad_curve.range([range_start, range_end]);

      group.values.forEach((edge, i) => {
        edge.rad_curve_line = scale_rad_curve(i);
      });

      return group.values;
    });

    return flatEdges;
  } //bellyCurve()

  /***
   * Render edges as SVG paths
   * @param {Array} edges - edges with calculated curve positions
   * @param {string} className - CSS class name
   * @param {number} strokeWidth - Line width
   * @param {number} opacity - Line opacity
   */
  function renderEdges(edges, className, strokeWidth, opacity) {
    const validEdges = edges.filter((e) => {
      if (!e.rad_curve_line) {
        console.warn("Edge missing rad_curve_line:", e);
        return false;
      }
      return true;
    });

    g.append("g")
      .attr("class", className)
      .selectAll("path")
      .data(edges)
      .join("path")
      .attr("d", generateRadialPath)
      .attr("fill", "none")
      .attr("stroke", COLORS.label)
      .attr("stroke-width", strokeWidth * SF)
      .attr("opacity", opacity);
  } //renderEdges()

  ///////////////////////////////////
  //////// HOVER AND CLICK //////////
  //////////////////////////////////

  //////////// TOOLTIPS
  function initTooltip() {
    // Select or create container
    const container = d3.select("#tooltips-container");

    // Create single tooltip
    tooltip = container
      .append("div")
      .attr("class", "competences-tooltip")
      .style("position", "fixed")
      .style("pointer-events", "none")
      .style("z-index", "1000")
      .style("opacity", "0")
      .style("display", "none")
      .style("transition", "opacity 0.15s ease");

    // Content wrapper
    tooltip_content = tooltip
      .append("div")
      .attr("class", "tooltip-content")
      .style("position", "relative")
      .style("background", COLORS.background)
      .style("box-shadow", "0px 4px 16px rgba(0, 0, 0, 0.15)");

    // Label (uppercase text)
    label = tooltip_content
      .append("p")
      .attr("class", "tooltip-label")
      .style("margin", "0")
      .style("padding", "0")
      .style("text-align", "center")
      .style("font-family", "'Inter', sans-serif")
      .style("font-weight", "600")
      .style("text-transform", "uppercase")
      .style("letter-spacing", "0.05em")
      .style("line-height", "1");

    // Header (main text)
    header = tooltip_content
      .append("h3")
      .attr("class", "tooltip-header")
      .style("margin", "0")
      .style("padding", "0")
      .style("text-align", "center")
      .style("font-family", "'IBM Plex Serif', serif")
      .style("font-weight", "400")
      .style("line-height", "1.1")
      .style("word-wrap", "break-word")
      .style("overflow-wrap", "break-word");

    // CTA wrapper (only for projects)
    cta = tooltip
      .append("button")
      .attr("class", "tooltip-cta")
      .style("position", "absolute")
      .style("left", "50%")
      .style("transform", "translateX(-50%)")
      .style("display", "none")
      .style("align-items", "center")
      .style("justify-content", "center")
      .style("border-radius", "50%")
      .style("background", "transparent")
      .style("cursor", "pointer")
      .style("transition", "all 0.2s ease")
      .style("padding", "0")
      .style("pointer-events", "all")
      .on("mouseenter", function () {
        const color = d3.select(this).attr("data-color");
        d3.select(this)
          .style("background", color)
          .style("border", `${2 * SF}px solid ${color}`);
        d3.select(this).select("svg").style("color", COLORS.background);
      })
      .on("mouseleave", function () {
        const color = d3.select(this).attr("data-color");
        d3.select(this)
          .style("background", "transparent")
          .style("border", `${2 * SF}px solid ${color}`);
        d3.select(this).select("svg").style("color", color);
      })
      .on("click", function () {
        //per ora niente
      });

    // CTA SVG icon
    const cta_svg = cta
      .append("svg")
      .attr("viewBox", "0 0 20 20")
      .attr("fill", "none")
      .style("pointer-events", "none")
      .style("display", "block");

    cta_svg
      .append("circle")
      .attr("cx", "10")
      .attr("cy", "10")
      .attr("r", "9")
      .attr("stroke", "currentColor")
      .attr("stroke-width", "2")
      .attr("fill", "none");

    cta_svg
      .append("path")
      .attr("d", "M10 6V14M6 10H14")
      .attr("stroke", "currentColor")
      .attr("stroke-width", "2")
      .attr("stroke-linecap", "round");
  } //initTooltip()

  //update tooltips based on SF
  function updateTooltipSizes() {
    if (!tooltip) return;

    // Calculate scaled dimensions
    const width = TOOLTIP_BASE.width * SF;
    const padding_v = TOOLTIP_BASE.padding_v * SF;
    const padding_h = TOOLTIP_BASE.padding_h * SF;
    const label_size = TOOLTIP_BASE.label_size * SF;
    const header_size = TOOLTIP_BASE.header_size * SF;
    const label_margin = TOOLTIP_BASE.label_margin * SF;
    const border_radius = 4 * SF;
    const cta_size = TOOLTIP_BASE.cta_size * SF;

    // Update content padding and border radius
    tooltip_content
      .style("max-width", `${width}px`)
      .style("padding", `${padding_v}px ${padding_h}px`)
      .style("border-radius", `${border_radius}px`);

    // Update label
    label.style("font-size", `${label_size}px`);

    // Update header
    header
      .style("font-size", `${header_size}px`)
      .style("margin-top", `${label_margin}px`);

    // Update CTA
    cta
      .style("width", `${cta_size}px`)
      .style("height", `${cta_size}px`)
      .style("border", `${2 * SF}px solid currentColor`);

    cta
      .select("svg")
      .attr("width", cta_size * 0.65)
      .attr("height", cta_size * 0.65);

    // Add mouse events to tooltip itself to prevent flickering
    tooltip
      .on("mouseenter", function () {
        // Keep tooltip visible when mouse enters it
        if (HoverManager.type === "project") {
          // Only for projects since they have interactive CTA
          d3.select(this).style("opacity", "1");
        }
      })
      .on("mouseleave", function () {
        // Hide when leaving tooltip
        if (HoverManager.type === "project") {
          onNodeHoverExit();
        }
      });
  } //updateTooltipSizes()

  /**
   * Show tooltip for any node type
   * Unified function that handles all cases
   * @param {Object} node - Node data
   * @param {string} type - 'skill' | 'tech' | 'project' | 'skill_type'
   * @param {number} x - SVG x coordinate of node
   * @param {number} y - SVG y coordinate of node
   */
  function showTooltip(node, type, x, y) {
    if (!tooltip) return;

    let label_text = "";
    let header_text = "";
    let header_color = COLORS.text;
    let show_cta = false;
    let cta_color = COLORS.proj;

    // Configure based on node type
    switch (type) {
      case "skill":
        label_text = "SKILL";
        header_text = node.id;
        header_color = COLORS.skill;
        break;

      case "tech":
        const tech_labels = {
          capt_tech: "CAPTURING TECHNOLOGY",
          rep_tech: "REPRESENTATION TECHNOLOGY",
          diss_tech: "DISSEMINATION TECHNOLOGY",
        };
        label_text = tech_labels[node.type] || "TECHNOLOGY";
        header_text = node.id;
        header_color = tech_colors(node.type);
        break;

      case "project":
        label_text = "CASE STUDY";
        const proj_data = vizProj.find((p) => p.title === node.id);
        header_text = proj_data ? proj_data.display : node.id;
        header_color = COLORS.proj;
        show_cta = true;
        cta_color = COLORS.proj;
        break;

      default:
        return;
    }

    // Update content
    label.text(label_text).style("color", COLORS.text);

    header.text(header_text).style("color", header_color);

    // Update background and arrow color
    tooltip_content.style("background", COLORS.background);

    if (show_cta) {
      cta
        .style("display", "flex")
        .style("color", cta_color)
        .style("border-color", cta_color)
        .attr("data-color", cta_color);
      cta.select("svg").style("color", cta_color);
    } else {
      cta.style("display", "none");
    }

    // Make tooltip visible but transparent to measure it
    tooltip
      .style("display", "block")
      .style("visibility", "hidden")
      .style("opacity", "0");

    // Get dimensions after content is set
    const content_rect = tooltip_content.node().getBoundingClientRect();
    const content_height = content_rect.height;
    const content_width = content_rect.width;
    tooltip.style("visibility", "visible");

    // Convert SVG coordinates to page coordinates
    const svg_element = svg.node();
    const svg_rect = svg_element.getBoundingClientRect();
    const svg_center_x = svg_rect.left + svg_rect.width / 2;
    const svg_center_y = svg_rect.top + svg_rect.height / 2;

    const page_x = svg_center_x + x;
    const page_y = svg_center_y + y;

    // Calculate positions
    const offset_y = TOOLTIP_BASE.offset_y * SF;
    const cta_offset = TOOLTIP_BASE.cta_offset * SF;

    // Total height including arrow
    const total_height = content_height;

    // Position tooltip centered horizontally, above node
    const tooltip_x = page_x - content_width / 2;
    const tooltip_y = page_y - total_height - offset_y;

    // Position CTA button if visible
    if (show_cta) {
      const cta_y = content_height + cta_offset;
      cta.style("top", `${cta_y}px`);
    }

    // Allow pointer events only for projects (to click CTA)
    tooltip.style("pointer-events", show_cta ? "all" : "none");

    // Set final position and show
    tooltip
      .style("left", `${tooltip_x}px`)
      .style("top", `${tooltip_y}px`)
      .transition()
      .duration(150)
      .style("opacity", "1");
  } //showTooltip()

  /**
   * Hide tooltip
   */
  function hideTooltip() {
    if (!tooltip) return;

    tooltip
      .style("pointer-events", "none")
      .transition()
      .duration(150)
      .style("opacity", "0")
      .on("end", function () {
        d3.select(this).style("display", "none");
      });
  } //hideTooltip()

  /***
   * Build node lookups for quick node access during hover
   * Called once after all nodes are calculated
   * @param {Array} sc - Array of skill nodes objects
   * @param {Array} pr - Array of project positions
   * @param {Array} tc - array of tech node objects
   */
  function buildNodeLookups(sk, pr, tc) {
    //create Maps for lookup by id
    skill_node_by_id = new Map(sk.map((n) => [n.id, n]));
    project_node_by_id = new Map(pr.map((p) => [p.id, p]));
    tech_node_by_id = new Map(tc.map((t) => [t.id, t]));

    //create map for donut arc
    donut_arc_by_type = new Map(donutData.data.map((d) => [d.data.type, d]));
  } //buildNodeLookups()

  /////////// DELAUNEY
  /**
   * Build Delaunay diagrams for efficient hover detection
   * Creates spatial indices for O(log n) nearest-neighbor lookup
   * Called once after all nodes are calculated in draw()
   * @param {Array} sk - Array of skill nodes
   * @param {Array} pr - Array of project positions
   * @param {Array} tc - Array of tech nodes
   */
  function buildDelaunayDiagrams(sk, pr, tc) {
    // Create Delaunay diagram for skills using their x,y positions
    delaunay_skills = d3.Delaunay.from(
      sk,
      (d) => d.x,
      (d) => d.y
    );

    // Create Delaunay diagram for techs using their x,y positions
    delaunay_techs = d3.Delaunay.from(
      tc,
      (d) => d.x,
      (d) => d.y
    );

    //create projects paths
    createProjectHoverPaths(pr);
  } //buildDelaunayDiagrams()

  //create svg invisble paths for projects
  function createProjectHoverPaths(projects) {
    // Remove existing paths if any
    if (hover_project_paths) {
      hover_project_paths.remove();
    }

    // Calculate arc width for each project
    // Distribute 360° evenly, accounting for padding
    const num_projects = projects.length;
    const padding_angle = PROJECT_ARC_PADDING / PROJECTS_RADIUS; // Convert padding to radians
    const available_angle = TAU - padding_angle * num_projects;
    const arc_width = available_angle / num_projects;

    //normalise angles
    projects.forEach((p) => {
      let d3_angle = (p.angle + PI / 2) % TAU;
      if (d3_angle < 0) d3_angle += TAU;
      p.d3_angle = d3_angle;
    });

    // Create arc generator for hover areas
    const arc_hover = d3
      .arc()
      .startAngle((d) => d.d3_angle - arc_width / 2)
      .endAngle((d) => d.d3_angle + arc_width / 2)
      .innerRadius((d) => PROJECTS_RADIUS - d.radius - HOVER_THRESHOLD_PROJECT)
      .outerRadius((d) => PROJECTS_RADIUS + d.radius + HOVER_THRESHOLD_PROJECT);

    // Create invisible SVG paths for each project
    hover_project_paths = g
      .append("g")
      .attr("class", "project-hover-paths")
      .selectAll("path")
      .data(projects)
      .join("path")
      .attr("class", "project-hover-path")
      .attr("d", arc_hover)
      .style("fill", "none")
      .style("stroke", "none")
      .style("pointer-events", "none");
  } //createProjectHoverPaths()

  //for simulation
  function rebuildSkillDelaunay(skillnodes) {
    if (!skillnodes || skillnodes.length === 0) return;

    delaunay_skills = d3.Delaunay.from(
      skillnodes,
      (d) => d.x,
      (d) => d.y
    );
  } //rebuildSkillDelaunay()

  /**
   * Find the closest node to mouse position across all node types
   * Uses Delaunay diagrams for O(log n) lookup performance
   * @param {number} mx - Mouse x position (adjusted for SVG transform)
   * @param {number} my - Mouse y position (adjusted for SVG transform)
   * @returns {Object|null} { node, type, distance } or null if no node within threshold
   */
  function findClosestNode(mx, my) {
    let closestNode = null;
    let closestDist = Infinity;
    let closestType = null;

    // Check skills
    if (delaunay_skills) {
      const skillIdx = delaunay_skills.find(mx, my);
      const skillNodes = [...skill_node_by_id.values()];

      if (skillIdx >= 0 && skillIdx < skillNodes.length) {
        const skillNode = skillNodes[skillIdx];
        const skillDist = sqrt(
          (skillNode.x - mx) ** 2 + (skillNode.y - my) ** 2
        );

        // Check if within hover threshold (node radius + extra padding)
        const threshold = skillNode.radius + HOVER_THRESHOLD_SKILL;

        if (skillDist < threshold && skillDist < closestDist) {
          closestNode = skillNode;
          closestDist = skillDist;
          closestType = "skill";
        }
      }
    }

    // Check techs
    if (delaunay_techs) {
      const techIdx = delaunay_techs.find(mx, my);
      const techNodes = [...tech_node_by_id.values()];

      if (techIdx >= 0 && techIdx < techNodes.length) {
        const techNode = techNodes[techIdx];
        const techDist = sqrt((techNode.x - mx) ** 2 + (techNode.y - my) ** 2);

        // Check if within hover threshold
        const threshold = techNode.radius + HOVER_THRESHOLD_TECH;

        if (techDist < threshold && techDist < closestDist) {
          closestNode = techNode;
          closestDist = techDist;
          closestType = "tech";
        }
      }
    }

    // Return closest node if found, otherwise null
    return closestNode
      ? { node: closestNode, type: closestType, distance: closestDist }
      : null;
  } //findClosestNode()

  //Visualize donut arc boundaries and angles
  function showDonutArcs() {
    // Remove existing
    g.selectAll(".donut-debug-layer").remove();

    const debug_layer = g
      .append("g")
      .attr("class", "donut-debug-layer")
      .style("pointer-events", "none");

    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"];

    donutData.data.forEach((d, i) => {
      const color = colors[i % colors.length];

      // Draw line for start angle
      const startX = DONUT_RADIUS * 1.3 * cos(d.startAngle);
      const startY = DONUT_RADIUS * 1.3 * sin(d.startAngle);

      debug_layer
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", startX)
        .attr("y2", startY)
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("opacity", 0.8);

      // Draw line for end angle
      const endX = DONUT_RADIUS * 1.3 * cos(d.endAngle);
      const endY = DONUT_RADIUS * 1.3 * sin(d.endAngle);

      debug_layer
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", endX)
        .attr("y2", endY)
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0.8);

      // Add label at middle of arc
      const midAngle = (d.startAngle + d.endAngle) / 2;
      const labelRadius = DONUT_RADIUS * 1.5;
      const labelX = labelRadius * cos(midAngle);
      const labelY = labelRadius * sin(midAngle);

      debug_layer
        .append("text")
        .attr("x", labelX)
        .attr("y", labelY)
        .attr("text-anchor", "middle")
        .attr("font-size", 10)
        .attr("font-weight", "bold")
        .attr("fill", color)
        .text(
          `${d.data.type}\n${((d.startAngle * 180) / PI).toFixed(0)}° - ${(
            (d.endAngle * 180) /
            PI
          ).toFixed(0)}°`
        );
    });
  } // showDonutArcs()

  function hideDonutArcs() {
    g.selectAll(".donut-debug-layer").remove();
  } //hideDonutArcs()

  /////////// EDGE FILTERING HELPERS

  //Get edges originating from a specific skill node (FORWARD)
  function getEdgesFromSkill(skill_id) {
    // Get skill type for this skill
    const skill_type = typeToSkill.get(skill_id);
    if (!skill_type) return [];

    // Filter edges that include this specific skill
    return sk_edges_curves_global.filter(
      (edge) => edge.skills && edge.skills.includes(skill_id)
    );
  } //getEdgesFromSkill()

  //Get edges originating from a skill type (FORWARD)
  function getEdgesFromSkillType(skill_type) {
    return sk_edges_curves_global.filter(
      (edge) => edge.source_id === skill_type
    );
  } //getEdgesFromSkillType()

  //Get edges pointing TO a project from skills (for REVERSE display)
  function getEdgesToProject(project_id) {
    // Find which skills connect to this project
    const project_skills = edges_skillToproj
      .filter((e) => e.target === project_id)
      .map((e) => e.source);

    if (project_skills.length === 0) return [];

    // Filter edges that include any of these skills
    return sk_edges_curves_global.filter(
      (edge) =>
        edge.skills &&
        edge.skills.some((skill) => project_skills.includes(skill))
    );
  } //getEdgesToProject()

  //Get edges FROM a project to techs (FORWARD)
  function getEdgesFromProject(project_id) {
    return tc_edges_curves_global.filter(
      (edge) => edge.source_id === project_id
    );
  } //getEdgesFromProject()

  //Get edges pointing TO a tech from projects (for REVERSE display)
  function getEdgesToTech(tech_id) {
    // Find which projects use this tech
    const projects_with_tech = edges_projTotech
      .filter((e) => e.target === tech_id)
      .map((e) => e.source);

    if (projects_with_tech.length === 0) return [];

    // Filter edges from those projects to this tech
    return tc_edges_curves_global.filter((edge) =>
      projects_with_tech.includes(edge.source_id)
    );
  } //getEdgesToTech()

  //Get ONLY edges between specific skills and a specific project
  function getEdgesBetweenSkillsAndProject(project_id, skill_ids) {
    const project_node = project_node_by_id.get(project_id);
    if (!project_node) return [];

    const project_angle = atan2(project_node.y, project_node.x);
    const ANGLE_TOLERANCE = 0.001;

    return sk_edges_curves_global.filter((edge) => {
      // Check if this edge's target_angle matches our project's angle
      const angle_diff = abs(edge.target_angle - project_angle);

      // Account for angle wrapping (2π = 0)
      const angle_diff_wrapped = min(
        angle_diff,
        abs(angle_diff - TAU),
        abs(angle_diff + TAU)
      );

      // Only include if target angle matches our project
      return angle_diff_wrapped < ANGLE_TOLERANCE;
    });
  } //getEdgesBetweenSkillsAndProject()

  //Get ONLY edges between a specific project and specific techs
  function getEdgesBetweenProjectAndTechs(project_id, tech_ids) {
    const tech_ids_set = new Set(tech_ids);

    return tc_edges_curves_global.filter((edge) => {
      return (
        edge.source_id === project_id &&
        // Check if this edge goes to one of the connected techs
        edges_projTotech.some(
          (e) => e.source === project_id && tech_ids_set.has(e.target)
        )
      );
    });
  } //getEdgesBetweenProjectAndTechs()

  //Get ONLY edges between specific projects and a specific tech
  function getEdgesBetweenProjectsAndTech(tech_id, project_ids) {
    const tech_node = tech_node_by_id.get(tech_id);
    if (!tech_node) return [];

    // Calculate the tech's angle
    const tech_angle = atan2(tech_node.y, tech_node.x);

    // Filter edges that have this tech as their target
    // We need to match by angle because multiple edges might go to same position
    const ANGLE_TOLERANCE = 0.01; // Slightly larger tolerance for tech nodes

    return tc_edges_curves_global.filter((edge) => {
      // Check if this edge's target_angle matches our tech's angle
      const angle_diff = abs(edge.target_angle - tech_angle);

      // Account for angle wrapping (2π = 0)
      const angle_diff_wrapped = min(
        angle_diff,
        abs(angle_diff - TAU),
        abs(angle_diff + TAU)
      );

      // Only include if target angle matches our tech
      if (angle_diff_wrapped >= ANGLE_TOLERANCE) return false;

      // Additional check: verify this edge comes from one of our connected projects
      // This ensures we only show edges from projects that actually use THIS tech
      return project_ids.includes(edge.source_id);
    });
  } //getEdgesBetweenProjectsAndTech()

  /////// CONNECT NODES HELPERS

  //Get all nodes connected to a skill node
  function getConnectedToSkill(skill_node) {
    // Get projects using this skill
    const project_ids = edges_skillToproj
      .filter((e) => e.source === skill_node.id)
      .map((e) => e.target);

    const projects = project_ids
      .map((id) => project_node_by_id.get(id))
      .filter(Boolean); // Remove any undefined

    // Get the skill type arc
    const skill_type_arc = donut_arc_by_type.get(skill_node.type);

    return { projects, skill_type_arc };
  } //getConnectedToSkill()

  //Get all nodes connected to a skill type (donut arc)
  function getConnectedToSkillType(skill_type) {
    // Get all skill nodes of this type
    const skill_nodes = Array.from(skill_node_by_id.values()).filter(
      (n) => n.type === skill_type
    );

    // Get all skills in this type
    const skills_data = skills_in_skillType.get(skill_type) || [];
    const skill_names = skills_data.map((s) => s.skill);

    // Get all projects connected to ANY skill in this type
    const project_ids = new Set();
    edges_skillToproj
      .filter((e) => skill_names.includes(e.source))
      .forEach((e) => project_ids.add(e.target));

    const projects = Array.from(project_ids)
      .map((id) => project_node_by_id.get(id))
      .filter(Boolean);

    return { skill_nodes, projects };
  } //getConnectedToSkillType()

  //Get all nodes connected to a project
  function getConnectedToProject(project_node) {
    // Get skills used by this project
    const skill_names = edges_skillToproj
      .filter((e) => e.target === project_node.id)
      .map((e) => e.source);

    const skill_nodes = skill_names
      .map((name) => skill_node_by_id.get(name))
      .filter(Boolean);

    // Get skill types for these skills
    const skill_types = new Set(
      skill_names.map((name) => typeToSkill.get(name))
    );

    const skill_type_arcs = Array.from(skill_types)
      .map((type) => donut_arc_by_type.get(type))
      .filter(Boolean);

    // Get techs used by this project
    const tech_names = edges_projTotech
      .filter((e) => e.source === project_node.id)
      .map((e) => e.target);

    const tech_nodes = tech_names
      .map((name) => tech_node_by_id.get(name))
      .filter(Boolean);

    return { skill_nodes, skill_type_arcs, tech_nodes };
  } //getConnectedToProject()

  //Get all nodes connected to a tech node
  function getConnectedToTech(tech_node) {
    // Get projects using this tech
    const project_ids = edges_projTotech
      .filter((e) => e.target === tech_node.id)
      .map((e) => e.source);

    const projects = project_ids
      .map((id) => project_node_by_id.get(id))
      .filter(Boolean);

    return { projects };
  } //getConnectedToTech()

  ///////// HELPERS

  //Get edge color based on hovered node type
  function getEdgeColorForHoverType(type, node = null) {
    switch (type) {
      case "skill":
        return COLORS.skill; // Purple/lilac for skills
      case "skill_type":
        return COLORS.ui; // Deep purple for skill types
      case "project":
        return COLORS.proj; // Green for projects
      case "tech":
        // Get the tech node color from tech_colors scale
        // Tech nodes have their type in node.type (capt_tech, rep_tech, diss_tech)
        if (node && node.type) {
          return tech_colors(node.type);
        }
        // Fallback color if node type is not found
        return "#FFA726";
      default:
        return COLORS.label; // Default grey
    }
  } //getEdgeColorForHoverType()

  //Highlight nodes for skill hover
  function highlightSkillHover(skill_node, connected) {
    highlightNodes({
      fade_all: true,
      skill_ids: [skill_node.id],
      skill_types: connected.skill_type_arc ? [skill_node.type] : [],
      project_ids: connected.projects.map((p) => p.id),
      highlight_target: skill_node,
      target_type: "skill",
      filter_mode: true, // Use filter for skill type arc
    });
  } //highlightSkillHover()

  //Highlight nodes for skill type hover
  function highlightSkillTypeHover(donut_arc, connected) {
    highlightNodes({
      fade_all: true,
      skill_types: [donut_arc.data.type],
      project_ids: connected.projects.map((p) => p.id),
      highlight_target: donut_arc,
      target_type: "skill_type",
      filter_mode: true, // Use filter for both donut and skills
    });
  } //highlightSkillTypeHover()

  //Highlight nodes for project hover
  function highlightProjectHover(project_node, connected) {
    highlightNodes({
      fade_all: true,
      skill_ids: connected.skill_nodes.map((s) => s.id),
      skill_types: connected.skill_type_arcs.map((arc) => arc.data.type),
      project_ids: [project_node.id],
      tech_ids: connected.tech_nodes.map((t) => t.id),
      highlight_target: project_node,
      target_type: "project",
    });
  } //highlightProjectHover()

  // Highlight nodes for tech hover
  function highlightTechHover(tech_node, connected) {
    highlightNodes({
      fade_all: true,
      project_ids: connected.projects.map((p) => p.id),
      tech_ids: [tech_node.id],
      highlight_target: tech_node,
      target_type: "tech",
    });
  } //highlightTechHover()

  //Fade all nodes to low opacity
  function fadeAllNodes() {
    cache.skill_nodes.attr("opacity", 0.4);
    cache.project_nodes.attr("opacity", 0.4);
    cache.tech_nodes.attr("opacity", 0.4);
    cache.donut_arcs.attr("opacity", 0.4);
  } //fadeAllNodes()

  //manage highlights
  function highlightNodes(config) {
    const {
      fade_all = true,
      skill_ids = [],
      skill_types = [],
      project_ids = [],
      tech_ids = [],
      highlight_target = null,
      target_type = null,
      filter_mode = false,
    } = config;

    //fade all nodes first if requested
    if (fade_all) {
      fadeAllNodes();
    }

    // Highlight skills
    if (skill_ids.length > 0) {
      const ids_set = new Set(skill_ids);
      // Imposta SOLO i nodi nella lista a 1.0, lascia gli altri invariati
      cache.skill_nodes.filter((d) => ids_set.has(d.id)).attr("opacity", 1.0);
    }

    // Highlight skill types in donut
    if (skill_types.length > 0) {
      if (filter_mode) {
        // For skill_type hover: highlight only matching types
        const types_set = new Set(skill_types);
        g.selectAll(".donut-skill path")
          .filter((d) => types_set.has(d.data.type))
          .attr("opacity", 1.0);
      } else {
        // For other hovers: set opacity for all
        const types_set = new Set(skill_types);
        cache.donut_arcs.attr("opacity", (d) =>
          types_set.has(d.data.type) ? 1.0 : 0.4
        );
      }
    }

    // Highlight projects
    if (project_ids.length > 0) {
      const ids_set = new Set(project_ids);
      // Imposta SOLO i nodi nella lista a 1.0, lascia gli altri invariati
      cache.project_nodes.filter((d) => ids_set.has(d.id)).attr("opacity", 1.0);
    }

    // Highlight techs
    if (tech_ids.length > 0) {
      const ids_set = new Set(tech_ids);
      // Imposta SOLO i nodi nella lista a 1.0, lascia gli altri invariati
      cache.tech_nodes.filter((d) => ids_set.has(d.id)).attr("opacity", 1.0);
    }

    // Apply special styling to the hovered target node
    if (highlight_target && target_type === "project") {
      // Highlight the project with special stroke
      cache.project_nodes
        .filter((d) => d.id === highlight_target.id)
        .attr("opacity", 1.0)
        .attr("stroke", COLORS.background)
        .attr("stroke-width", 2 * SF);

      // Reset stroke for other projects
      cache.project_nodes
        .filter((d) => d.id !== highlight_target.id)
        .attr("stroke", handleStrokes(COLORS.proj))
        .attr("stroke-width", 1.5);
    } else if (highlight_target && target_type === "tech") {
      // Highlight the tech with special stroke
      cache.tech_nodes
        .filter((d) => d.id === highlight_target.id)
        .attr("opacity", 1.0)
        .attr("stroke", "gray")
        .attr("stroke-width", 2 * SF);

      // Reset stroke for other techs
      cache.tech_nodes
        .filter((d) => d.id !== highlight_target.id)
        .attr("stroke", "none");
    } else if (highlight_target && target_type === "skill") {
      // For skill hover, just make sure it's highlighted
      cache.skill_nodes
        .filter((d) => d.id === highlight_target.id)
        .attr("opacity", 1.0);
    } else if (highlight_target && target_type === "skill_type") {
      // For skill_type hover, filter skills of that type
      cache.skill_nodes
        .filter((d) => d.type === highlight_target.data.type)
        .attr("opacity", 1.0);
    }
  } //highlightNodes()

  // Reset all nodes to full opacity
  function resetAllNodesOpacity() {
    cache.skill_nodes.attr("opacity", 1.0);
    cache.project_nodes
      .attr("opacity", 1.0)
      .attr("stroke", handleStrokes(COLORS.proj))
      .attr("stroke-width", 1.5);
    cache.tech_nodes.attr("opacity", 1.0).attr("stroke", "none");

    cache.donut_arcs.attr("opacity", 1.0);
  } //resetAllNodesOpacity()

  /**
   * Setup click handlers for all interactive nodes
   * Called once after rendering
   */
  function setupClickHandlers() {
    // Click on skill nodes
    cache.skill_nodes.on("click", function (event, d) {
      ClickManager.onClick(d, "skill");
    });

    // Click on project nodes
    cache.project_nodes.on("click", function (event, d) {
      ClickManager.onClick(d, "project");
    });

    // Click on tech nodes
    cache.tech_nodes.on("click", function (event, d) {
      ClickManager.onClick(d, "tech");
    });

    // Click on donut arcs (skill types) - optional
    cache.donut_arcs.on("click", function (event, d) {
      ClickManager.onClick(d, "skill_type");
    });

    // Click on SVG background to reset
    svg.on("click", function (event) {
      // Only reset if clicking on background (not on nodes)
      if (event.target === this || event.target.tagName === "svg") {
        if (ClickManager.active) {
          ClickManager.reset();
        }
      }
    });
  } //setupClickHandlers()

  //////////////////////////////////
  ////// Sizing functions /////////
  /////////////////////////////////

  //Calculate sizes
  function handleSizes(w, h) {
    //set ideal
    const diameter = min(w, h) - PADDING * 6; //sweet spot
    BOUNDARY_RADIUS = diameter / 2; //building block variable

    //define donut sizes
    DONUT_RADIUS = round(BOUNDARY_RADIUS / 1.24); //max dimension of the skill donut
    DONUT_WIDTH = DONUT_RADIUS * 2;

    //Calculate main scale factor
    SF = DONUT_WIDTH / (DEFAULT_SIZE * 0.56);

    PROJECTS_RADIUS = round(DONUT_RADIUS * 0.67); //round(DONUT_RADIUS - (DONUT_RADIUS / 4 + 2 * PADDING)); //Project ring dimension
    TECHNOLOGY_RADIUS = round(PROJECTS_RADIUS * 0.67); //Tech circles domains

    //constructor circles
    CENTRAL_HOLE_RADIUS = round(BOUNDARY_RADIUS * 0.2); //empty central space
    SKILL_BOUNDARY_RADIUS = round(
      (BOUNDARY_RADIUS - DONUT_RADIUS - PADDING) / 2
    );
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

  //handle stroke colors
  function handleStrokes(color) {
    //Calculate stroke based on fill color
    let STROKE_COLOR = d3.color(color).darker(0.3);
    return STROKE_COLOR;
  } //handleStrokes

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
    // Update tooltip sizes
    updateTooltipSizes();
    draw();
  }; //handle resizes

  ////// DEBUGS (Eliminate in production)

  //Render boundary circles and anchor points
  function defineBoundaries(donutData) {
    const { data } = donutData;

    // Draw anchor points
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

    // Draw boundary circles
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
  } //renderBoundaries()

  //Visualize Delaunay triangulation for debugging
  function showDelaunayMesh() {
    // Remove existing mesh if any
    g.selectAll(".delaunay-mesh").remove();

    // Draw skills Delaunay
    if (delaunay_skills) {
      g.append("path")
        .attr("class", "delaunay-mesh")
        .attr("d", delaunay_skills.render())
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("opacity", 0.3);
    }

    //draw project delaunay
    if (delaunay_techs) {
      g.append("path")
        .attr("class", "delaunay-mesh")
        .attr("d", delaunay_techs.render())
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("opacity", 0.3);
    }
  } //showDelaunayMesh()

  //Show live mouse position and angle
  function showMouseDebug() {
    // Remove existing
    g.selectAll(".mouse-debug-layer").remove();

    const debug_layer = g
      .append("g")
      .attr("class", "mouse-debug-layer")
      .style("pointer-events", "none");

    // Crosshair lines
    const crosshair_v = debug_layer
      .append("line")
      .attr("stroke", "red")
      .attr("stroke-width", 1)
      .attr("opacity", 0.5);

    const crosshair_h = debug_layer
      .append("line")
      .attr("stroke", "red")
      .attr("stroke-width", 1)
      .attr("opacity", 0.5);

    // Mouse circle
    const mouse_circle = debug_layer
      .append("circle")
      .attr("r", 5)
      .attr("fill", "red")
      .attr("opacity", 0.7);

    // Info text
    const info_text = debug_layer
      .append("text")
      .attr("font-size", 11)
      .attr("font-family", "monospace")
      .attr("fill", "red")
      .attr("font-weight", "bold");

    // Add real-time update
    svg.on("mousemove.debug", function (event) {
      const [mx, my] = d3.pointer(event);
      const adjusted_x = mx - width / 2;
      const adjusted_y = my - height / 2;

      const mouse_angle_raw = atan2(adjusted_y, adjusted_x);
      let mouse_angle = mouse_angle_raw;
      if (mouse_angle < 0) mouse_angle += TAU;

      const mouse_radius = sqrt(adjusted_x ** 2 + adjusted_y ** 2);

      // Update crosshair
      crosshair_v
        .attr("x1", adjusted_x)
        .attr("y1", -height / 2)
        .attr("x2", adjusted_x)
        .attr("y2", height / 2);

      crosshair_h
        .attr("x1", -width / 2)
        .attr("y1", adjusted_y)
        .attr("x2", width / 2)
        .attr("y2", adjusted_y);

      // Update circle
      mouse_circle.attr("cx", adjusted_x).attr("cy", adjusted_y);

      // Update text
      const angle_deg = ((mouse_angle * 180) / PI).toFixed(1);
      info_text
        .attr("x", adjusted_x + 15)
        .attr("y", adjusted_y - 10)
        .text(`r: ${mouse_radius.toFixed(1)}px | θ: ${angle_deg}°`);
    });
  } // showMouseDebug()

  function hideMouseDebug() {
    g.selectAll(".mouse-debug-layer").remove();
    svg.on("mousemove.debug", null);
  } //hideMouseDebug()s

  //Visualize hover detection areas for debugging
  function showHoverAreas() {
    // Remove existing debug layer
    g.selectAll(".hover-debug-layer").remove();

    // Create debug layer
    const debug_layer = g
      .append("g")
      .attr("class", "hover-debug-layer")
      .style("pointer-events", "none");

    //Donut
    const donut_thickness = donutData.thickness;
    const donut_inner = DONUT_RADIUS - donut_thickness / 2;
    const donut_outer = DONUT_RADIUS + donut_thickness / 2;

    debug_layer
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", donut_inner)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.7);

    debug_layer
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", donut_outer)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.7);

    // Add label
    debug_layer
      .append("text")
      .attr("x", donut_outer + 10)
      .attr("y", 0)
      .text("Donut Hover Area")
      .attr("fill", "red")
      .attr("font-size", 12)
      .attr("font-weight", "bold");

    // Skill
    const skillNodes = [...skill_node_by_id.values()];
    skillNodes.forEach((node) => {
      const threshold = node.radius + HOVER_THRESHOLD_SKILL;

      debug_layer
        .append("circle")
        .attr("cx", node.x)
        .attr("cy", node.y)
        .attr("r", threshold)
        .attr("fill", "purple")
        .attr("opacity", 0.15)
        .attr("stroke", "purple")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3");
    });

    // Tech
    const techNodes = [...tech_node_by_id.values()];
    techNodes.forEach((node) => {
      const threshold = node.radius + HOVER_THRESHOLD_TECH;

      debug_layer
        .append("circle")
        .attr("cx", node.x)
        .attr("cy", node.y)
        .attr("r", threshold)
        .attr("fill", "orange")
        .attr("opacity", 0.15)
        .attr("stroke", "orange")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3");
    });

    if (hover_project_paths) {
      hover_project_paths
        .style("fill", "rgba(0, 255, 0, 0.15)")
        .style("stroke", COLORS.proj)
        .style("stroke-width", 2)
        .style("stroke-dasharray", "4,4");
    }
  } //showHoverAreas()

  //Hide hover area visualization
  function hideHoverAreas() {
    g.selectAll(".hover-debug-layer").remove();
    if (hover_project_paths) {
      hover_project_paths.style("fill", "none").style("stroke", "none");
    }
  } //hideHoverAreas()

  //Toggle hover areas visibility
  function toggleHoverAreas() {
    const exists = !g.select(".hover-debug-layer").empty();
    if (exists) {
      hideHoverAreas();
    } else {
      showHoverAreas();
    }
  } //toggleHoverAreas()

  // Expose to window
  if (typeof window !== "undefined") {
    window.showDelaunayMesh = showDelaunayMesh;
  }

  if (typeof window !== "undefined") {
    window.showHoverAreas = showHoverAreas;
    window.hideHoverAreas = hideHoverAreas;
    window.toggleHoverAreas = toggleHoverAreas;
    window.showDonutArcs = showDonutArcs;
    window.hideDonutArcs = hideDonutArcs;
    window.showMouseDebug = showMouseDebug;
    window.hideMouseDebug = hideMouseDebug;

    // Debug flags
    window.DEBUG_HOVER = false;
    window.DEBUG_DONUT = false;
  }

  return chart;
};
