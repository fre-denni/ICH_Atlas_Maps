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

  //set data variables

  //set sizes
  const MIN_WIDTH = 660;
  let width = max(MIN_WIDTH, container.clientWidth);
  let height = container.clientHeight;

  //set default

  //set properties
  let projects, properties, shared_prop, unshared_prop;
  let central_node, central_nodes;
  let shared_edges = [];

  //headers
  const PROPERTY = {
    //add list of property
  };

  //specific property dataset
  let techGroup, dataGroup, ichGroup;
  let clusterGroups, filteredClusters;

  //calculation variables
  let frequency, filter;

  //simulations
  let cluster_sim, shared_sim, unshared_sim;

  //set colors
  const COLORS = {
    background: "#f7f7f7",
    //add others
  };

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
  //to see later

  const g = svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  /************
   *
   * Spacchettamento data
   * - riunire technologies, ich elements, datagroup per type
   * - filtrare dati non necessari
   * - calcolare frequencies per proprietà (numero di progetti) (1-> 50)
   *
   * - UI (cluster by, filter/property selected, max/min, radial/dendogram)
   * - dynamic "plus" button
   * - display projects as nodes fluctuating
   *   - click, projects in the middle, add properties button, other projects around
   * - CLUSTER
   *    - choose one property
   *    - display properties in line with clustered projects (by number of) - order by min/max
   *    - vertical labels
   * - FILTER (click property/projects)
   *   - filter one property, fix projects around in circle, display buttons (collapsable)
   *   - if project -> project in middle selected property around (shared in different colors(collapsable with other projects))
   * - ADD PROPERTY
   *   - projects in circle, shared properties in the center, unshared as a cloud
   *   - distinguish by type
   * - MODAL (projects)
   *    - name, link, and type of property
   * - RADIAL VIEW (default, see above)
   * - DENDOGRAM VIEW
   *   - put projects in the middle
   *   - properties on the sides
   * - animations
   *
   *
   ************/
};
