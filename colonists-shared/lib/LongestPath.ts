import { HexCoordinate, MatrixCoordinate, Road } from './Shared';

const calculateLongestPath = (roads: Road[]): number => {
  const graph: MatrixCoordinate[][][] = [];
  const distance: number[][] = [];

  for (let index = 0; index < roads.length; index++) {
    const element = roads[index];
    if (!graph[element.start.x]) graph[element.start.x] = [];
    if (!graph[element.start.x][element.start.y]) graph[element.start.x][element.start.y] = [];
    if (!distance[element.start.x]) distance[element.start.x] = [];
    if (!distance[element.start.x][element.start.y]) distance[element.start.x][element.start.y] = 0;
    if (!distance[element.end.x]) distance[element.end.x] = [];
    if (!distance[element.end.x][element.end.y]) distance[element.end.x][element.end.y] = 0;
    graph[element.start.x][element.start.y].push(element.end);
  }

  for (let i = 0; i < graph.length; i++) {
    if (graph[i]) {
      for (let j = 0; j < graph[i].length; j++) {
        const branches = graph[i][j];
        if (branches) {
          for (let k = 0; k < branches.length; k++) {
            const path = branches[k];
            const from: HexCoordinate = { x: i, y: j };
            distance[path.x][path.y] = distance[from.x][from.y] + 1;
          }
        }
      }
    }
  }

  const flatten: any = (arr:any[]) => [].concat(...arr);
  const flattened = flatten(distance).filter((e: number[]) => e);
  const max = Math.max(...flattened);
  return max;
};
