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
  private height: number;
  private width: number;
  private tileHeight: number = 348;
  private tileWidth: number = 400;
  private app: Application;
  private viewport: Viewport;

  private mounted() {
    this.height = this.$el.clientHeight;
    this.width = this.$el.clientWidth;
    this.DrawMap();
    const that = this;
    addEventListener('resize', () => {
      that.app.renderer.resize(this.$el.clientWidth, this.$el.clientHeight);
      that.viewport.resize(this.$el.clientWidth, this.$el.clientHeight);
    });
  }

  private getSprites(): Sprite[] {
    const tilePath = './img/tilesets/';
    const tileFiletype = '.gif';
    const tileStyle = 'watercolor';

    return [
      Sprite.fromImage(`${tilePath}${tileStyle}/clay${tileFiletype}`),
      Sprite.fromImage(`${tilePath}${tileStyle}/desert${tileFiletype}`),
      Sprite.fromImage(`${tilePath}${tileStyle}/grain${tileFiletype}`),
      Sprite.fromImage(`${tilePath}${tileStyle}/wood${tileFiletype}`),
      Sprite.fromImage(`${tilePath}${tileStyle}/stone${tileFiletype}`),
      Sprite.fromImage(`${tilePath}${tileStyle}/wool${tileFiletype}`),
      Sprite.fromImage(`${tilePath}${tileStyle}/ocean${tileFiletype}`),
    ].map((s) => {
      s.width = this.tileWidth;
      s.height = this.tileHeight;
      return s;
    });
  }

  private DrawMap(): void {
    const lineWidth = 13;
    const Hex = extendHex({
      size: 200 + lineWidth / 2,
      orientation: 'flat',
    });
    const Grid = defineGrid(Hex);
    this.app = new Application({
      autoResize: true,
      transparent: true,
      antialias: true,
      height: this.height,
      width: this.width,
    });
    const graphics = new Graphics();
    this.viewport = new Viewport({
      screenWidth: this.width,
      screenHeight: this.width,
      interaction: this.app.renderer!.plugins.interaction,
    });

    graphics.lineStyle(lineWidth, 0xffffff);
    this.app.stage.addChild(this.viewport);
    this.viewport
      .drag()
      .pinch()
      .wheel()
      .decelerate();
    this.$el.appendChild(this.app.view);

    const center = Hex(0, 0);

    Grid.hexagon({ radius: 20 }).forEach((hex) => {
      const point = hex.toPoint();
      const corners = hex.corners().map((corner) => corner.add(point));
      const [firstCorner, ...otherCorners] = corners;
      const ss = this.getSprites();

      let i = Math.floor(Math.random() * (ss.length - 1));
      if (hex.distance(center) >= 18) {
        i = ss.length - 1;
      }
      const s = ss[i];
      s.position.x = firstCorner.x - this.tileWidth - lineWidth / 2;
      s.position.y = firstCorner.y - this.tileHeight / 2;
      graphics.addChild(s);

      graphics.moveTo(firstCorner.x, firstCorner.y);
      otherCorners.forEach(({ x, y }) => graphics.lineTo(x, y));
      graphics.lineTo(firstCorner.x, firstCorner.y);
      this.viewport.addChild(graphics);
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
