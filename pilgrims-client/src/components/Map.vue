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

  // Generally not the way to go - we want to load these.
  private getTileImg(tileRand: number, draw: SVG.Doc): SVG.Image {
    switch (Math.floor(tileRand)) {
      case 0:
        return draw.image('./img/tilesets/modern/brick.gif', 400, 346);
      case 1:
        return draw.image('./img/tilesets/modern/desert.gif', 400, 346);
      case 2:
        return draw.image('./img/tilesets/modern/grain.gif', 400, 346);
      case 3:
        return draw.image('./img/tilesets/modern/lumber.gif', 400, 346);
      case 4:
        return draw.image('./img/tilesets/modern/ore.gif', 400, 346);
      case 5:
        return draw.image('./img/tilesets/modern/sea.gif', 400, 346);
      case 5:
        return draw.image('./img/tilesets/modern/wool.gif', 400, 346);
    }
    return draw.image();
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

    // an SVG symbol can be reused
    const points: SVG.PointArrayAlias = corners.map(({ x, y }) => [x, y]);
    const hexSymbol = draw.polygon(points).stroke({ width: 1, color: '#999' });

    // render 10,000 hexes
    Grid.rectangle({ width: 12, height: 10 }).forEach((hex) => {
      const { x, y } = hex.toPoint();
      // use hexSymbol and set its position for each hex
      draw
        .use(hexSymbol.clone().fill(this.getTileImg(Math.random() * 6, draw)))
        .translate(x, y);
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
