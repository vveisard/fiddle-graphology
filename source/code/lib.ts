import { unwrap, type SetStoreFunction, type Store } from "solid-js/store";
import { default as Graph } from "graphology";
import type {
  GraphOptions,
  NodeIterationCallback,
  NodeMapper,
} from "graphology-types";

type Float64 = number;

namespace Float64 {
  export function getRandomArbitrary(min: Float64, max: Float64): Float64 {
    return Math.random() * (max - min) + min;
  }
}

export { Float64 };

interface VertexEntityState {
  x: number;
  y: number;
}

interface EdgeEntityState {
  readonly sourceNodeEntityId: string;
  readonly targetNodeEntityId: string;
}

interface EntityCollectionState<TEntityState> {
  readonly ids: ReadonlyArray<string>;
  readonly states: Record<string, TEntityState>;
}

namespace EntityCollectionState {
  export function create<TEntityState>(
    entries: ReadonlyArray<readonly [string, TEntityState]>
  ): EntityCollectionState<TEntityState> {
    return {
      ids: entries.map((i) => i[0]),
      states: Object.fromEntries(entries),
    };
  }
}

interface GraphWorldEntitiesState {
  readonly vertexEntityCollectionState: EntityCollectionState<VertexEntityState>;
  readonly edgeEntityCollectionState: EntityCollectionState<EdgeEntityState>;
}

namespace GraphWorldEntitiesState {
  export function createWithRandom(
    vertexAmount: number,
    vertexPositionSpreadRangeXMinimum: number,
    vertexPositionSpreadRangeXMaximum: number,
    vertexPositionSpreadRangeYMinimum: number,
    vertexPositionSpreadRangeYMaximum: number
  ): GraphWorldEntitiesState {
    const vertexPositions: Array<[number, number]> = Array.from(
      { length: vertexAmount },
      () => {
        const iVertexPositionX = Float64.getRandomArbitrary(
          vertexPositionSpreadRangeXMinimum,
          vertexPositionSpreadRangeXMaximum
        );

        const iVertexPositionY = Float64.getRandomArbitrary(
          vertexPositionSpreadRangeYMinimum,
          vertexPositionSpreadRangeYMaximum
        );

        return [iVertexPositionX, iVertexPositionY] as const;
      }
    );

    const edges: Array<readonly [number, number]> = [];
    for (let i = 0; i < vertexPositions.length; i++) {
      for (let j = 0; j < vertexPositions.length; j++) {
        if (i === j) {
          continue;
        }

        const doCreateEdge = Math.random() > 0.9;
        if (!doCreateEdge) {
          continue;
        }

        edges.push([i, j]);
      }
    }

    const vertexEntityEntries: ReadonlyArray<
      readonly [string, VertexEntityState]
    > = vertexPositions.map(
      (e, i) =>
        [
          i.toString(),
          {
            x: e[0],
            y: e[1],
          },
        ] as const
    );

    const edgeEntityEntries: ReadonlyArray<readonly [string, EdgeEntityState]> =
      edges.map((i) => [
        `${i[0]}, ${i[1]}`,
        {
          sourceNodeEntityId: i[0].toString(),
          targetNodeEntityId: i[1].toString(),
        },
      ]);

    const vertexEntityCollection: EntityCollectionState<VertexEntityState> =
      EntityCollectionState.create(vertexEntityEntries);

    const edgeEntityCollectionState: EntityCollectionState<EdgeEntityState> =
      EntityCollectionState.create<EdgeEntityState>(edgeEntityEntries);

    return {
      edgeEntityCollectionState: edgeEntityCollectionState,
      vertexEntityCollectionState: vertexEntityCollection,
    };
  }
}

interface GraphWorld {
  readonly store: {
    entities: Store<GraphWorldEntitiesState>;
    setEntities: SetStoreFunction<GraphWorldEntitiesState>;
  };
}

export {
  type VertexEntityState,
  type EntityCollectionState,
  type GraphWorld,
  GraphWorldEntitiesState,
};

/**
 * Implementation of graphology graph.
 * Bridge for an underlying {@link GraphWorld}.
 */
class GraphWorldGraph extends Graph<VertexEntityState> {
  #graphWorld: GraphWorld;

  nodes(): Array<string> {
    return this.#graphWorld.store.entities.vertexEntityCollectionState
      .ids as Array<string>;
  }

  edges(): Array<string> {
    return this.#graphWorld.store.entities.edgeEntityCollectionState
      .ids as Array<string>;
  }

  source(edge: unknown): string {
    return this.#graphWorld.store.entities.edgeEntityCollectionState.states[
      edge as string
    ].sourceNodeEntityId;
  }

  target(edge: unknown): string {
    return this.#graphWorld.store.entities.edgeEntityCollectionState.states[
      edge as string
    ].targetNodeEntityId;
  }

  updateEachNodeAttributes(
    updater: NodeMapper<VertexEntityState, VertexEntityState>,
    hints?: { attributes?: (keyof VertexEntityState)[] | undefined } | undefined
  ): void {
    for (const iNodeId of this.#graphWorld.store.entities
      .vertexEntityCollectionState.ids) {
      const iBaseNodeState =
        this.#graphWorld.store.entities.vertexEntityCollectionState.states[
          iNodeId
        ];

      const iNextNodeState = updater(iNodeId, unwrap(iBaseNodeState));

      this.#graphWorld.store.setEntities(
        "vertexEntityCollectionState",
        "states",
        iNodeId,
        iNextNodeState
      );
    }
  }

  forEachNode(callback: NodeIterationCallback<VertexEntityState>): void {
    for (const iNodeId of this.#graphWorld.store.entities
      .vertexEntityCollectionState.ids) {
      callback(
        iNodeId,
        this.#graphWorld.store.entities.vertexEntityCollectionState.states[
          iNodeId
        ]
      );
    }
  }

  getNodeAttribute<AttributeName extends keyof VertexEntityState>(
    node: unknown,
    name: AttributeName
  ): VertexEntityState[AttributeName] {
    switch (name) {
      case "x": {
        return this.#graphWorld.store.entities.vertexEntityCollectionState
          .states[node as string].x;
      }
      case "y": {
        return this.#graphWorld.store.entities.vertexEntityCollectionState
          .states[node as string].y;
      }
      default: {
        throw new Error(`Not implemented!`);
      }
    }
  }

  constructor(graphOptions: GraphOptions, graphWorld: GraphWorld) {
    super(graphOptions);
    this.#graphWorld = graphWorld;
  }
}

export { GraphWorldGraph };
