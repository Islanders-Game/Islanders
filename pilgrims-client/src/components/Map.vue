<template>
<v-container fluid fill-height id="Map">
</v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { defineGrid, extendHex } from 'honeycomb-grid';
import { Graphics, Sprite, Application, Point, Texture } from 'pixi.js';
import Viewport from 'pixi-viewport';


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
  ].map((s) => { s.width = this.tileWidth; s.height = this.tileHeight; return s; });

  constructor() {
    super();
  }

  private mounted() {
    this.DrawMap();
  }

  private gradient(from, to): Texture {
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d");
    const grd = ctx.createLinearGradient(0,0,100,100);
    grd.addColorStop(0, from);
    grd.addColorStop(1, to);
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,100,100);
    return Texture.from(c);
  }

  private DrawMap(): void {
    const Hex = extendHex({
      size: 200,
      orientation: 'flat',
    });
    const Grid = defineGrid(Hex);

    const app = new Application({transparent: true, height: this.$el.clientHeight, width: this.$el.clientWidth});
    const graphics = new Graphics();
    const viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: 100,
      worldHeight: 100,
      interaction: app.renderer!.plugins.interaction,
    });

    graphics.lineStyle(10, 0xFFFFFF);
    app.stage.addChild(viewport);
    viewport.drag().pinch().wheel().decelerate();
    this.$el.appendChild(app.view);

    Grid.hexagon({ radius: 20 }).forEach((hex) => {
      const point = hex.toPoint();
      const corners = hex.corners().map((corner) => corner.add(point));
      const [firstCorner, ...otherCorners] = corners;

      graphics.beginFill(Math.random());
      graphics.moveTo(firstCorner.x, firstCorner.y);
      otherCorners.forEach(({ x, y }) => graphics.lineTo(x, y));
      graphics.lineTo(firstCorner.x, firstCorner.y);
      graphics.endFill();
      viewport.addChild(graphics);
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
