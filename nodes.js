-/* 
 * Animated floating graph nodes
 * 
 * Copyright (c) 2015 Project Nayuki
 * All rights reserved. Contact Nayuki for licensing.
 * https://www.nayuki.io/page/animated-floating-graph-nodes
 */

"use strict";


/*---- Configurable constants ----*/

var idealNumNodes;
var maxExtraEdges;
var radiiWeightPower;
var driftSpeed;
var repulsionForce;
var BORDER_FADE = -40;
var FADE_IN_RATE  = 0.005;  // In the range (0.0, 1.0]
var FADE_OUT_RATE = 0.01;  // In the range (0.0, 1.0]


/*---- Major functions ----*/


// Performs one-time initialization of the SVG image, the graph, and miscellaneous matters.
// Also responsible for holding the "global" state in the closure of the function,
// which are the 3 variables {nodes, edges, svgElem}.
function initializeNodes() {
	var container = document.getElementById('nodes');
	var canvas = container.children[0];
	var boundRect = container.getBoundingClientRect();
	var relWidth  = boundRect.width;
	var relHeight = boundRect.height;
	var normalizer = (boundRect.width < 600) ? 0.05 : 0.015;

    setCanvasSize(canvas, relWidth, relHeight);
    var ctx = canvas.getContext('2d');
    
    document.addEventListener('throttled_resize', function(event){
        relWidth = window.innerWidth;
        initInputHandlers();
        setCanvasSize(canvas, relWidth, relHeight);
    }, false);

	initInputHandlers();
	
	// Polyfill
	if (!("hypot" in Math)) {
		Math.hypot = function(x, y) {
			return Math.sqrt(x * x + y * y);
		};
	}
	
	// State of graph nodes - each object has these properties:
	// - posX: Horizontal position in relative coordinates, typically in the range [0.0, relWidth], where relWidth <= 1.0
	// - posY: Vertical position in relative coordinates, typically in the range [0.0, relHeight], where relHeight <= 1.0
	// - velX: Horizontal velocity in relative units (not pixels)
	// - velY: Vertical velocity in relative units (not pixels)
	// - radius: Radius of the node, a positive real number
	// - opacity: A number in the range [0.0, 1.0] representing the strength of the node
	var nodes = [];
	// State of graph edges - each object has these properties:
	// - nodeA: A reference to the node object representing one side of the undirected edge
	// - nodeB: A reference to the node object representing another side of the undirected edge (must be distinct from NodeA)
	// - opacity: A number in the range [0.0, 1.0] representing the strength of the edge
	var edges = [];
	
	// This important top-level function updates the arrays of nodes and edges, then redraws the SVG image.
	// We define it within the closure to give it access to key variables that persist across iterations.
	function stepFrame() {
		nodes = updateNodes(normalizer, relWidth, relHeight, nodes);
		edges = updateEdges(nodes, edges);
		redrawOutput(ctx, nodes, edges);
        window.requestAnimationFrame(stepFrame);
	}
	
	// Populate initial nodes and edges, then improve on them
	stepFrame();  // Generate nodes
	for (var i = 0; i < 300; i++)  // Spread out nodes to avoid ugly clumping
		doForceField(nodes);
	edges = [];
	
	// Make everything render immediately instead of fading in
	nodes.concat(edges).forEach(function(item) {  // Duck typing
	});
	redrawOutput(ctx, nodes, edges);
	
	// Periodically execute stepFrame() to create animation
    window.requestAnimationFrame(stepFrame);
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const mouse = {
  x: innerWidth / 2,
  y: innerHeight / 2,
};

const colors = [
  "#ffffff",
  "#3454da",
  "#edd8f7",
  "#4dd4ff",
  "#fff49e",
  "#ff9e43",
];

let mouseMove = false;
addEventListener("mousemove", () => {
  mouseMove = true;
});

addEventListener("mouseout", () => {
  mouseMove = false;
});

addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  init();
});

class Particle {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.shadowColor = this.color;
    c.shadowBlur = 12;
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
  }

  update() {
    this.draw();
  }
}

let particles;
function init() {
  particles = [];

// Sets event handlers for form input elements, and sets global configuration variables.
function initInputHandlers() {
	idealNumNodes = window.innerWidth / 20;
	maxExtraEdges = Math.round(parseFloat(100) / 100 * idealNumNodes);

	radiiWeightPower = parseFloat(0.0);

	driftSpeed = 0.03;
	repulsionForce = 500;
}

  for (let i = 0; i < 1000; i++) {
    const canvasWidth = canvas.width + 300;
    const canvasHeight = canvas.height + 300;
    const x = Math.random() * canvasWidth - canvasWidth / 2;
    const y = Math.random() * canvasHeight - canvasHeight / 2;
    const radius = 2 * Math.random();

// Returns a new array of nodes by updating/adding/removing nodes based on the given array. Although the
// argument array is not modified, the node objects themselves are modified. No other side effects.
// At least one of relWidth or relHeight is exactly 1. The aspect ratio relWidth:relHeight is equal to w:h.
function updateNodes(normalizer, relWidth, relHeight, nodes) {
	
	// Update position, velocity, opacity; prune faded nodes
	var newNodes = [];
	nodes.forEach(function(node, index) {
		// Move based on velocity
		node.posX += node.velX * driftSpeed;
		node.posY += node.velY * driftSpeed;
		// Randomly perturb velocity, with damping
		node.velX = node.velX * 0.99 + (Math.random() - 0.5) * 0.3;
		node.velY = node.velY * 0.99 + (Math.random() - 0.5) * 0.3;
		// Fade out nodes near the borders of the space or exceeding the target number of nodes
		if (index >= idealNumNodes || node.posX < BORDER_FADE || relWidth - node.posX < BORDER_FADE
				|| node.posY < BORDER_FADE || relHeight - node.posY < BORDER_FADE)
			node.opacity = Math.max(node.opacity - FADE_OUT_RATE, 0);
		else  // Fade in ones otherwise
			node.opacity = Math.min(node.opacity + FADE_IN_RATE, 1);
		// Only keep visible nodes
		if (node.opacity > 0)
			newNodes.push(node);
	});
	
	// Add new nodes to fade in
	for (var i = newNodes.length; i < idealNumNodes; i++) {
		newNodes.push({  // Random position and radius, other properties initially zero
			posX: Math.random() * relWidth,
			posY: Math.random() * relHeight,
			radius: 0.25 * normalizer,  // Skew toward smaller values
			velX: 0.0,
			velY: 0.0,
			opacity: 0.0,
		});
	}
	
	// Spread out nodes a bit
	doForceField(newNodes);
	return newNodes;
    const color = colors[Math.floor(Math.random() * colors.length)];
    particles.push(new Particle(x, y, radius, color));
  }
}


// Updates the position of each node in the given array (in place), based on
// their existing positions. Returns nothing. No other side effects.
function doForceField(nodes) {
	var deltas = [];
	for (var i = 0; i < nodes.length * 2; i++)
		deltas.push(0.0);
	
	// For simplicitly, we perturb positions directly, instead of velocities
	for (var i = 0; i < nodes.length; i++) {
		var nodeA = nodes[i];
		for (var j = 0; j < i; j++) {
			var nodeB = nodes[j];
			var dx = nodeA.posX - nodeB.posX;
			var dy = nodeA.posY - nodeB.posY;
			var distSqr = dx * dx + dy * dy;
			// Notes: The factor 1/sqrt(distSqr) is to make (dx, dy) into a unit vector.
			// 1/distSqr is the inverse square law, with a smoothing constant added to prevent singularity.
			var factor = repulsionForce / (Math.sqrt(distSqr) * (distSqr + 0.00001));
			dx *= factor;
			dy *= factor;
			deltas[i * 2 + 0] += dx;
			deltas[i * 2 + 1] += dy;
			deltas[j * 2 + 0] -= dx;
			deltas[j * 2 + 1] -= dy;
		}
	}
	for (var i = 0; i < nodes.length; i++) {
		nodes[i].posX += deltas[i * 2 + 0];
		nodes[i].posY += deltas[i * 2 + 1];
	}
}


// Returns a new array of edges by reading the given array of nodes and by updating/adding/removing edges
// based on the other given array. Although both argument arrays and nodes are unmodified,
// the edge objects themselves are modified. No other side effects.
function updateEdges(nodes, edges) {
	// Calculate array of spanning tree edges, then add some extra low-weight edges
	var allEdges = calcAllEdgeWeights(nodes);
	var idealEdges = calcSpanningTree(allEdges, nodes);
	for (var i = 0; i < allEdges.length && idealEdges.length < nodes.length - 1 + maxExtraEdges; i++) {
		var edge = {nodeA:nodes[allEdges[i][1]], nodeB:nodes[allEdges[i][2]]};  // Convert data formats
		if (!containsEdge(idealEdges, edge))
			idealEdges.push(edge);
	}
	allEdges = null;  // Let this big array become garbage sooner
	
	// Classify each current edge, checking whether it is in the ideal set; prune faded edges
	var newEdges = [];
	edges.forEach(function(edge) {
		if (containsEdge(idealEdges, edge))
			edge.opacity = Math.min(edge.opacity + FADE_IN_RATE, 1);
		else
			edge.opacity = Math.max(edge.opacity - FADE_OUT_RATE, 0);
		if (edge.opacity > 0 && edge.nodeA.opacity > 0 && edge.nodeB.opacity > 0)
			newEdges.push(edge);
	});
	
	// If there is room for new edges, add some missing spanning tree edges (higher priority), then extra edges
	for (var i = 0; i < idealEdges.length && newEdges.length < nodes.length - 1 + maxExtraEdges; i++) {
		var edge = idealEdges[i];
		if (!containsEdge(newEdges, edge)) {
			edge.opacity = 0.0;  // Add missing property
			newEdges.push(edge);
		}
	}
	return newEdges;
}


// Redraws the SVG image based on the given values. No other side effects.
function redrawOutput(ctx, nodes, edges) {
	// Clear movable objects
    ctx.clearRect(0, 0, ctx.width, ctx.height);
	
	// Draw every node
    var radius = 30;
	nodes.forEach(function(node) {
        ctx.fillStyle = "rgba(0,111,187," + node.opacity.toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(node.posX, node.posY, radius, 0, 2 * Math.PI, false);
        ctx.fill();
	});
	
	// Draw every edge
	edges.forEach(function(edge) {
		var nodeA = edge.nodeA;
		var nodeB = edge.nodeB;
		var dx = nodeA.posX - nodeB.posX;
		var dy = nodeA.posY - nodeB.posY;
		var mag = Math.hypot(dx, dy);
        ctx.lineWidth = 2;
		if (mag > nodeA.radius + nodeB.radius) {  // Draw edge only if circles don't intersect
			dx /= mag;  // Make (dx, dy) a unit vector, pointing from B to A
			dy /= mag;
			var opacity = Math.min(Math.min(nodeA.opacity, nodeB.opacity), edge.opacity);

            ctx.strokeStyle = "rgba(988,139,197," + opacity.toFixed(3) + ")";
            ctx.beginPath();
            ctx.stroke();
		}
	});
}


/*---- Minor functions ----*/

// Returns a sorted array of edges with weights, for all unique edge pairs. Pure function, no side effects.
function calcAllEdgeWeights(nodes) {
	// Each entry has the form [weight, nodeAIndex, nodeBIndex], where nodeAIndex < nodeBIndex
	var result = [];
	for (var i = 0; i < nodes.length; i++) {  // Calculate all n * (n - 1) / 2 edges
		var nodeA = nodes[i];
		for (var j = 0; j < i; j++) {
			var nodeB = nodes[j];
			var weight = Math.hypot(nodeA.posX - nodeB.posX, nodeA.posY - nodeB.posY);  // Euclidean distance
			weight /= Math.pow(nodeA.radius * nodeB.radius, radiiWeightPower);  // Give discount based on node radii
			result.push([weight, i, j]);
		}
	}
	
	// Sort array by ascending weight
	result.sort(function(a, b) {
		var x = a[0], y = b[0];
		return x < y ? -1 : (x > y ? 1 : 0);
	});
	return result;
}


// Returns a new array of edge objects that is a minimal spanning tree on the given set
// of nodes, with edges in ascending order of weight. Note that the returned edge objects
// are missing the opacity property. Pure function, no side effects.
function calcSpanningTree(allEdges, nodes) {
	// Kruskal's MST algorithm
	var result = [];
	var ds = new DisjointSet(nodes.length);
	for (var i = 0; i < allEdges.length && result.length < nodes.length - 1; i++) {
		var edge = allEdges[i];
		var j = edge[1];
		var k = edge[2];
		if (ds.mergeSets(j, k))
			result.push({nodeA:nodes[j], nodeB:nodes[k]});
	}
	return result;
}


// Tests whether the given array of edge objects contains an edge with
// the given endpoints (undirected). Pure function, no side effects.
function containsEdge(array, edge) {
	for (var i = 0; i < array.length; i++) {
		var elem = array[i];
		if (elem.nodeA == edge.nodeA && elem.nodeB == edge.nodeB ||
		    elem.nodeA == edge.nodeB && elem.nodeB == edge.nodeA)
			return true;
	}
	return false;
}


// The union-find data structure. A heavily stripped-down version derived from https://www.nayuki.io/page/disjoint-set-data-structure .
function DisjointSet(size) {
	var parents = [];
	var ranks = [];
	for (var i = 0; i < size; i++) {
		parents.push(i);
		ranks.push(0);
	}
	
	function getRepr(i) {
		if (parents[i] != i)
			parents[i] = getRepr(parents[i]);
		return parents[i];
	}
	
	this.mergeSets = function(i, j) {
		var repr0 = getRepr(i);
		var repr1 = getRepr(j);
		if (repr0 == repr1)
			return false;
		var cmp = ranks[repr0] - ranks[repr1];
		if (cmp >= 0) {
			if (cmp == 0)
				ranks[repr0]++;
			parents[repr1] = repr0;
		} else
			parents[repr0] = repr1;
		return true;
	};

	initializeNodes();