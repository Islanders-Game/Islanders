<template>
    <div id="Map">
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { defineGrid, extendHex } from 'honeycomb-grid';
import * as SVG from 'svg.js';
import * as svgPanZoom from 'svg-pan-zoom';

@Component
export default class Map extends Vue {
  constructor() {
    super();

    window.addEventListener('load', (event) => {
      this.DrawMap();
    });
  }

  private DrawMap() {
    const draw = new SVG.Doc(this.$el).size('100%', '100%');
    draw.id('drawingMap');

    const Hex = extendHex({ size: 50 });
    const Grid = defineGrid(Hex);
    const corners = Hex().corners();

    // an SVG symbol can be reused
    const points: SVG.PointArrayAlias = corners.map(({ x, y }) => [x, y]);
    const hexSymbol = draw
      .polygon(points)
      .fill('#ffffff')
      .stroke({ width: 1, color: '#999' });

    // render 10,000 hexes
    Grid.rectangle({ width: 12, height: 10 }).forEach((hex) => {
      const { x, y } = hex.toPoint();
      // use hexSymbol and set its position for each hex
      draw.use(hexSymbol).translate(x, y);
    });

    svgPanZoom.default('#drawingMap');
  }
}
</script>

<style lang="scss" scoped>
#Map {
  order: 0;
  flex: 3 1 auto;
  align-self: auto;
  background-color: #b3e5fc;
}
</style>
