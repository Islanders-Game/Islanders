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
    const lineWidth = 24;
    const Hex = extendHex({
      size: 200,
      orientation: 'flat',
    });
    const Grid = defineGrid(Hex);
    this.app = new Application({
      autoResize: true,
      resolution: 2,
      transparent: true,
      antialias: true,
      height: this.height,
      width: this.width,
    });
    
    this.viewport = new Viewport({
      screenWidth: this.width,
      screenHeight: this.width,
      interaction: this.app.renderer!.plugins.interaction,
    });

    this.app.stage.addChild(this.viewport);
    this.viewport
      .drag()
      .pinch()
      .wheel()
      .decelerate();
    this.$el.appendChild(this.app.view);

    const center = Hex(0, 0);
    const lineGraphics = new Graphics();
    const tileContainer = new PIXI.Container;
    const pieceContainer = new PIXI.Container;
    Grid.hexagon({ radius: 12 }).forEach((hex) => {
      const point = hex.toPoint();
      const corners = hex.corners().map((corner) => corner.add(point));
      const [firstCorner, ...otherCorners] = corners;
      
      //Tiles
      const ss = this.getSprites();
      let i = Math.floor(Math.random() * (ss.length - 1));
      if (hex.distance(center) >= 18) { i = ss.length - 1; }
      const s = ss[i];
      s.position.x = firstCorner.x - this.tileWidth - lineWidth / 2;
      s.position.y = firstCorner.y - this.tileHeight / 2;
      tileContainer.addChild(s);
      //

      //Game pieces
      if (Math.random() <= 0.2) {
        const piece = Math.random() >= 0.5 ? Sprite.fromImage(`./img/pieces/house.png`) : Sprite.fromImage(`./img/pieces/city.png`);
        piece.tint = Math.random() * 0xFFFFFF;
        piece.width = 128;
        piece.height = 128;
        piece.position.x = firstCorner.x - (piece.width/2);
        piece.position.y = firstCorner.y - (piece.height/2);
        pieceContainer.addChild(piece);
      }
      //

      //Hex lines
      lineGraphics.lineStyle(lineWidth, 0xffffff);
      lineGraphics.moveTo(firstCorner.x, firstCorner.y);
      otherCorners.forEach(({ x, y }) => lineGraphics.lineTo(x, y));
      lineGraphics.lineTo(firstCorner.x, firstCorner.y);
      //
    });

    const tileGraphics = new Graphics();
    const pieceGraphics = new Graphics();
    tileGraphics.addChild(tileContainer);
    pieceGraphics.addChild(pieceContainer);
    this.viewport.addChild(tileGraphics);
    this.viewport.addChild(lineGraphics);
    this.viewport.addChild(pieceGraphics);
  }
}
</script>

<style lang="scss" scoped>
#Map {
  background-color: #fff3d3;
  padding: 0px;
}
</style>
