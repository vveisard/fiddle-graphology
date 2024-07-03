import { createStore } from "solid-js/store";
import { random } from "graphology-layout";
import { assignLayout } from "graphology-layout/utils";

//
import {
  Float64,
  GraphWorldEntitiesState,
  GraphWorldGraph,
  type GraphWorld,
} from "./lib.ts";

const recalculateLayoutRandomButton: HTMLElement | null =
  document.getElementById("recalculate-layout-random");

if (recalculateLayoutRandomButton === null) {
  throw new Error(`Invalid state!`);
}

const targetCanvas = document.getElementById("target");
if (targetCanvas === null) {
  throw new Error(`Invalid state!`);
}
if (!(targetCanvas instanceof HTMLCanvasElement)) {
  throw new Error(`Invalid state!`);
}

const targetCanvasRenderingContext2d: CanvasRenderingContext2D | null =
  targetCanvas.getContext("2d");

if (targetCanvasRenderingContext2d === null) {
  throw new Error(`Invalid state!`);
}

let animationFrameTimer: number | null = null;

function renderCanvas(): undefined {
  if (targetCanvasRenderingContext2d === null) {
    throw new Error(`Invalid state!`);
  }

  for (const iNodeId of graph.nodes()) {
    const iNodePosition = [
      graph.getNodeAttribute(iNodeId, "x"),
      graph.getNodeAttribute(iNodeId, "y"),
    ] as const;

    targetCanvasRenderingContext2d.fillStyle = "red";
    targetCanvasRenderingContext2d.beginPath();
    targetCanvasRenderingContext2d.arc(...iNodePosition, 5, 0, 2 * Math.PI);
    targetCanvasRenderingContext2d.fill();
  }

  for (const iEdgeId of graph.edges()) {
    const iEdgeSourceNode = graph.source(iEdgeId);
    const iEdgeTargetNode = graph.target(iEdgeId);

    const iEdgeSourceNodePosition = [
      graph.getNodeAttribute(iEdgeSourceNode, "x"),
      graph.getNodeAttribute(iEdgeSourceNode, "y"),
    ] as const;

    const iEdgeTargetNodePosition = [
      graph.getNodeAttribute(iEdgeTargetNode, "x"),
      graph.getNodeAttribute(iEdgeTargetNode, "y"),
    ] as const;

    targetCanvasRenderingContext2d.strokeStyle = "black";
    targetCanvasRenderingContext2d.beginPath();
    targetCanvasRenderingContext2d.moveTo(
      iEdgeSourceNodePosition[0],
      iEdgeSourceNodePosition[1]
    );
    targetCanvasRenderingContext2d.lineTo(
      iEdgeTargetNodePosition[0],
      iEdgeTargetNodePosition[1]
    );
    targetCanvasRenderingContext2d.stroke();
  }

  return undefined;
}

function clearCanvas() {
  if (targetCanvasRenderingContext2d === null) {
    throw new Error(`Invalid state!`);
  }

  targetCanvasRenderingContext2d.clearRect(
    0,
    0,
    targetCanvasRenderingContext2d.canvas.width,
    targetCanvasRenderingContext2d.canvas.height
  );
}

function handleAnimationFrame() {
  animationFrameTimer = requestAnimationFrame(handleAnimationFrame);

  clearCanvas();
  renderCanvas();
}

const firstGraphWorldEntitiesState = GraphWorldEntitiesState.createWithRandom(
  25,
  0,
  512,
  0,
  512
);

console.log(JSON.stringify(firstGraphWorldEntitiesState, undefined, 2));

const [entities, setEntities] = createStore<GraphWorldEntitiesState>(
  firstGraphWorldEntitiesState
);
const graphWorld = {
  store: {
    entities: entities,
    setEntities: setEntities,
  },
} satisfies GraphWorld;

const graph = new GraphWorldGraph({}, graphWorld);

function handleRecalculateRandomButtonClick() {
  // @ts-ignore // TODO fix typing
  const randomLayout = random(graph, {
    rng() {
      return Float64.getRandomArbitrary(0, 512);
    },
  });

  // @ts-ignore // TODO fix typing
  assignLayout(graph, randomLayout);
}

recalculateLayoutRandomButton.addEventListener(
  "click",
  handleRecalculateRandomButtonClick
);

requestAnimationFrame(handleAnimationFrame);
