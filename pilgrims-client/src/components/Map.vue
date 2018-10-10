<template>
<v-container fluid fill-height id="Map">
</v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { defineGrid, extendHex } from 'honeycomb-grid';
import * as SVG from 'svg.js';
import * as svgPanZoom from 'svg-pan-zoom';

@Component
export default class Map extends Vue {
  private tileHeight: number = 400;
  private tileWidth: number = 346;
  private tiles: string[] = [
    './img/tilesets/watercolor/brick.gif',
    './img/tilesets/watercolor/desert.gif',
    './img/tilesets/watercolor/grain.gif',
    './img/tilesets/watercolor/lumber.gif',
    './img/tilesets/watercolor/ore.gif',
    './img/tilesets/watercolor/sea.gif',
    './img/tilesets/watercolor/wool.gif',
  ];

  constructor() {
    super();

    window.addEventListener('load', (event) => {
      this.DrawMap();
      // Make the map drag+zoomable
      svgPanZoom.default('#drawingMap');
    });
  }

  private DrawMap(): void {
    const draw = new SVG.Doc(this.$el).size('100%', '100%');
    draw.id('drawingMap');

    const Hex = extendHex({
      size: 200,
      orientation: 'flat',
    });
    const Grid = defineGrid(Hex);
    const corners = Hex().corners();

    const points: SVG.PointArrayAlias = corners.map(({ x, y }) => [x, y]);
    const hexSymbols: SVG.Polygon[] = [
      draw
        .polygon(points)
        .stroke({ width: 20, color: '#D6D6D6' })
        .fill(
          new SVG.Image()
            .load(this.tiles[0])
            .size(this.tileHeight, this.tileWidth),
        ),
      draw
        .polygon(points)
        .stroke({ width: 20, color: '#D6D6D6' })
        .fill(
          new SVG.Image()
            .load(this.tiles[1])
            .size(this.tileHeight, this.tileWidth),
        ),
      draw
        .polygon(points)
        .stroke({ width: 20, color: '#D6D6D6' })
        .fill(
          new SVG.Image()
            .load(this.tiles[2])
            .size(this.tileHeight, this.tileWidth),
        ),
      draw
        .polygon(points)
        .stroke({ width: 20, color: '#D6D6D6' })
        .fill(
          new SVG.Image()
            .load(this.tiles[3])
            .size(this.tileHeight, this.tileWidth),
        ),
      draw
        .polygon(points)
        .stroke({ width: 20, color: '#D6D6D6' })
        .fill(
          new SVG.Image()
            .load(this.tiles[4])
            .size(this.tileHeight, this.tileWidth),
        ),
      draw
        .polygon(points)
        .stroke({ width: 20, color: '#D6D6D6' })
        .fill(
          new SVG.Image()
            .load(this.tiles[5])
            .size(this.tileHeight, this.tileWidth),
        ),
      draw
        .polygon(points)
        .stroke({ width: 20, color: '#D6D6D6' })
        .fill(
          new SVG.Image()
            .load(this.tiles[6])
            .size(this.tileHeight, this.tileWidth),
        ),
    ];

    Grid.rectangle({ width: 12, height: 10 }).forEach((hex) => {
      const { x, y } = hex.toPoint();
      // use hexSymbol and set its position for each hex
      draw
        .use(hexSymbols[Math.floor(Math.random() * this.tiles.length)])
        .translate(x, y);
    });
  }
}
</script>

<style lang="scss" scoped>
#Map {
  background-color: #fff3d3;
  padding: 0px;
}
</style>
