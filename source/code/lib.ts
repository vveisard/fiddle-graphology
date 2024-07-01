import { type SetStoreFunction, type Store } from "solid-js/store";
import { default as Graph } from "graphology";
import type { GraphOptions } from "graphology-types";

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

interface GraphWorldEntitiesState {
  readonly vertexEntityCollectionState: EntityCollectionState<VertexEntityState>;
  readonly edgeEntityCollectionState: EntityCollectionState<EdgeEntityState>;
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
  type GraphWorldEntitiesState,
  type GraphWorld,
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
