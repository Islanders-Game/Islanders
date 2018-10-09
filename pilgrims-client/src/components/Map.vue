<template>
    <div id="Map">
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { defineGrid, extendHex } from 'honeycomb-grid';
import * as SVG from 'svg.js';

@Component
export default class Map extends Vue {
  constructor() {
    super();
    this.DrawMap();
  }

  private DrawMap() {
    const width = 450;
    const height = 300;

    const draw = SVG.create('Map');
    //draw.viewbox(0, 0, width, height);
    //draw.rect(width, height).fill('#dde3e1');

    // const Hex = extendHex({ size: 5 });
    // const Grid = defineGrid(Hex);
    // // get the corners of a hex (they're the same for all hexes created with the same Hex factory)
    // const corners = Hex().corners();
    // // an SVG symbol can be reused
    // const points: SVG.PointArrayAlias = corners.map(({ x, y }) => [x, y]);
    // const hexSymbol = draw.data
    //   .polygon(points)
    //   .fill('none')
    //   .stroke({ width: 1, color: '#999' });

    // // render 10,000 hexes
    // Grid.rectangle({ width: 100, height: 100 }).forEach((hex) => {
    //   const { x, y } = hex.toPoint();
    //   // use hexSymbol and set its position for each hex
    //   draw.use(hexSymbol).translate(x, y);
    // });
  }
}
</script>

<style lang="scss" scoped>
#Map {
  order: 0;
  flex: 3 1 auto;
  align-self: auto;
  background-color: #b3e5fc;
  margin-right: 0;
}
</style>
