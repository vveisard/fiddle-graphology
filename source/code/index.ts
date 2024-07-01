import { createStore } from "solid-js/store";
//
import {
  GraphWorldGraph,
  type GraphWorld,
  type GraphWorldEntitiesState,
} from "./lib.ts";

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

function handleAnimationFrame() {
  animationFrameTimer = requestAnimationFrame(handleAnimationFrame);

  renderCanvas();
}

const [entities, setEntities] = createStore<GraphWorldEntitiesState>({
  vertexEntityCollectionState: {
    ids: ["a", "b"],
    states: {
      a: {
        x: 10,
        y: 10,
      },
      b: {
        x: 25,
        y: 25,
      },
    },
  },
  edgeEntityCollectionState: {
    ids: ["a, b"],
    states: {
      ["a, b"]: {
        sourceNodeEntityId: "a",
        targetNodeEntityId: "b",
      },
    },
  },
});
const graphWorld = {
  store: {
    entities: entities,
    setEntities: setEntities,
  },
} satisfies GraphWorld;

const graph = new GraphWorldGraph({}, graphWorld);

requestAnimationFrame(handleAnimationFrame);
