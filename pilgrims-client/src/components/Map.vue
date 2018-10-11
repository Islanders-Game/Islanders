<template>
<v-container fluid fill-height id="Map">
</v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { defineGrid, extendHex } from 'honeycomb-grid';
import { Graphics, Sprite, Application, Point } from 'pixi.js';
import * as svgPanZoom from 'svg-pan-zoom';

@Component
export default class Map extends Vue {
  private tilePath = './img/tilesets/';
  private tileFiletype = '.gif';
  private tileStyle = 'watercolor';
  private tileHeight: number = 400;
  private tileWidth: number = 346;
  private sprites: Sprite[] = [
    Sprite.fromImage(`${this.tilePath}${this.tileStyle}/clay${this.tileFiletype}`),
    Sprite.fromImage(`${this.tilePath}${this.tileStyle}/desert${this.tileFiletype}`),
    Sprite.fromImage(`${this.tilePath}${this.tileStyle}/grain${this.tileFiletype}`),
    Sprite.fromImage(`${this.tilePath}${this.tileStyle}/wood${this.tileFiletype}`),
    Sprite.fromImage(`${this.tilePath}${this.tileStyle}/stone${this.tileFiletype}`),
    Sprite.fromImage(`${this.tilePath}${this.tileStyle}/ocean${this.tileFiletype}`),
    Sprite.fromImage(`${this.tilePath}${this.tileStyle}/wool${this.tileFiletype}`),
  ].map(s => { s.width = this.tileWidth; s.height = this.tileHeight; return s; });

  constructor() {
    super();

    window.addEventListener('load', (event) => {
      this.DrawMap();
    });
  }

  private DrawMap(): void {
    const app = new Application({transparent: true});
    const graphics = new Graphics();
    graphics.lineStyle(1, 0x999999);
    document.getElementById('Map') 
      && document.getElementById('Map')!.appendChild(app.view);

    const Hex = extendHex({
      size: 200,
      orientation: 'flat',
    });
    const Grid = defineGrid(Hex);
    const corners = Hex().corners();

    Grid.rectangle({ width: 12, height: 10 }).forEach((hex) => {
      const point = hex.toPoint();
      const corners = hex.corners().map(corner => corner.add(point));
      const [firstCorner, ...otherCorners] = corners;
      graphics.moveTo(firstCorner.x, firstCorner.y);
      otherCorners.forEach(({ x, y }) => graphics.lineTo(x, y));
      graphics.lineTo(firstCorner.x, firstCorner.y);
      app.stage.addChild(graphics);
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
