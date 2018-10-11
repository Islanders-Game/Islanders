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
  private tileHeight: number = 348;
  private tileWidth: number = 400;

  constructor() {
    super();
  }

  private mounted() {
    this.DrawMap();
  }

  private getSprites(): Sprite[] {
    const tilePath = './img/tilesets/';
    const tileFiletype = '.svg';
    const tileStyle = 'modern-svg';

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
    const height = this.$el.clientHeight;
    const width = this.$el.clientWidth;
    const app = new Application({
      transparent: true,
      antialias: true,
      height,
      width,
    });
    const graphics = new Graphics();
    const viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: width,
      worldHeight: height,
      interaction: app.renderer!.plugins.interaction,
    });

    graphics.lineStyle(lineWidth, 0xffffff);
    app.stage.addChild(viewport);
    viewport
      .drag()
      .pinch()
      .wheel()
      .decelerate();
    this.$el.appendChild(app.view);

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
