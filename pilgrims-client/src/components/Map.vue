<template>
<v-container fluid fill-height id="Map">
    <span v-if="gameID" id=gameID>Tell your friends to join this game at: <b>{{gameID}}</b></span>
    <v-alert id="error" dismissible :value="error" type="error"> {{error}}</v-alert> 
</v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { defineGrid, extendHex } from 'honeycomb-grid';
import {
  Graphics,
  Sprite,
  Application,
  Point,
  Texture,
  Container,
} from 'pixi.js';
import Viewport from 'pixi-viewport';
import {
  World,
  Tile,
  Player,
  House,
  MatrixCoordinate,
  getMatrixCoordCorner,
} from '../../../pilgrims-shared/dist/Shared';
import { BuildHouseAction } from '../../../pilgrims-shared/dist/Action';

@Component
export default class Map extends Vue {
  private height: number;
  private width: number;
  private hexSize: number = 200;
  private tileHeight: number = 348;
  private tileWidth: number = 400;
  private app: Application;
  private viewport: Viewport;
  private tileGraphics: Graphics = new Graphics();
  private pieceGraphics: Graphics = new Graphics();
  private lineGraphics: Graphics = new Graphics();
  private cursorGraphics: Graphics = new Graphics();
  private sprites: { [s: string]: () => Sprite } = this.generateSprites();
  private grid;

  private async mounted() {
    await this.$store.dispatch('game/bindToWorld');
    this.height = this.$el.clientHeight;
    this.width = this.$el.clientWidth;
    this.SetupCanvas();
    const that = this;
    addEventListener('resize', () => {
      that.app.renderer.resize(this.$el.clientWidth, this.$el.clientHeight);
      that.viewport.resize(this.$el.clientWidth, this.$el.clientHeight);
    });
    that.viewport.on('mousemove', this.handleMove);
    that.viewport.on('pointerup', this.handleClick);
  }

  get isBuildingHouse() {
    return this.$store.state.ui.isBuildingHouse;
  }

  get world() {
    return this.$store.state.game.world as World;
  }

  get gameID() {
    return this.$store.state.game.gameId;
  }

  get error() {
    return this.$store.getters['game/getError'];
  }

  private findTile(hex) {
    const map = this.world.map;
    return map.find((tile) => tile.coord.x === hex.x && tile.coord.y === hex.y);
  }

  private getClosestPoint(point: Point) {
    const distanceFunc = (from, to) => {
      return Math.sqrt(
        Math.pow(Math.abs(from.x - to.x), 2) +
          Math.pow(Math.abs(from.y - to.y), 2),
      );
    };
    const hexToFind = this.grid.pointToHex(point);
    const hexOrigin = hexToFind.toPoint();
    const centerOfHex = {
      x: hexOrigin.x + hexToFind.width() / 2,
      y: hexOrigin.y + hexToFind.height() / 2,
    };

    const distance = distanceFunc(point, centerOfHex);
    let closestPoint;
    const corners = hexToFind.corners();
    for (let i = 0; i < corners.length; i++) {
      const corner = corners[i];
      corner.x += hexOrigin.x;
      corner.y += hexOrigin.y;
      const cornerDist = distanceFunc(point, corner);
      if (distance >= cornerDist) {
        closestPoint = { point: corner, index: i, distance: cornerDist };
      }
    }
    return closestPoint;
  }

  private handleClick(event) {
    if (!this.isBuildingHouse) {
      return;
    }
    const inWorld = this.viewport.toWorld(event.data.global);
    const closest = this.getClosestPoint(inWorld);

    this.cursorGraphics.clear();
    this.cursorGraphics.removeChildren();
    this.$store.dispatch(
      'game/sendAction',
      new BuildHouseAction(this.$store.state.game.playerName, closest.point),
    );
    this.$store.commit('ui/setIsBuildingHouse', false);
  }

  private handleMove(event) {
    if (!this.isBuildingHouse) {
      return;
    }
    const inWorld = this.viewport.toWorld(event.data.global);
    const closest = this.getClosestPoint(inWorld);
    if (closest) {
      this.cursorGraphics.clear();
      this.cursorGraphics.removeChildren();
      const s = Sprite.fromImage(`./img/pieces/house.png`);
      s.tint = 0xff0000;
      s.alpha = 0.6;
      s.anchor.x = 0.5;
      s.anchor.y = 0.5;
      s.height = 100;
      s.width = 100;
      s.x = closest.point.x;
      s.y = closest.point.y;
      this.cursorGraphics.addChild(s);
    }
  }

  private generateSprites(): { [s: string]: () => Sprite } {
    const tilePath = './img/tilesets/';
    const tileFiletype = '.gif';
    const tileStyle = 'watercolor';

    const sprites = {
      Clay: () =>
        Sprite.fromImage(`${tilePath}${tileStyle}/clay${tileFiletype}`),
      Desert: () =>
        Sprite.fromImage(`${tilePath}${tileStyle}/desert${tileFiletype}`),
      Grain: () =>
        Sprite.fromImage(`${tilePath}${tileStyle}/grain${tileFiletype}`),
      Wood: () =>
        Sprite.fromImage(`${tilePath}${tileStyle}/wood${tileFiletype}`),
      Stone: () =>
        Sprite.fromImage(`${tilePath}${tileStyle}/stone${tileFiletype}`),
      Wool: () =>
        Sprite.fromImage(`${tilePath}${tileStyle}/wool${tileFiletype}`),
      Ocean: () =>
        Sprite.fromImage(`${tilePath}${tileStyle}/ocean${tileFiletype}`),
      House: () => Sprite.fromImage(`./img/pieces/house.png`),
      City: () => Sprite.fromImage(`./img/pieces/city.png`),
    };
    return sprites;
  }

  private SetupCanvas(): void {
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
      screenHeight: this.height,
      interaction: this.app.renderer!.plugins.interaction,
    });

    this.app.stage.addChild(this.viewport);
    this.viewport
      .drag()
      .pinch()
      .wheel()
      .decelerate();
    this.$el.appendChild(this.app.view);
    this.viewport.addChild(this.tileGraphics);
    this.viewport.addChild(this.lineGraphics);
    this.viewport.addChild(this.pieceGraphics);
    this.viewport.addChild(this.cursorGraphics);
  }

  private compareWorlds(oldWorld: World, newWorld: World) {
    if (oldWorld === undefined) {
      return [true, true];
    }
    const tiles = oldWorld.map !== newWorld.map;
    const pieces =
      !oldWorld.thief ||
      oldWorld.thief !== newWorld.thief ||
      oldWorld.players !== newWorld.players;

    return [tiles, pieces];
  }

  private createPiece(
    spriteType: string,
    dimensions: { x: number; y: number },
    tint: number,
    coord: MatrixCoordinate,
  ) {
    const generator = this.sprites[spriteType];
    const piece = generator();
    piece.width = dimensions.x;
    piece.height = dimensions.y;
    piece.tint = tint;
    piece.position.x = coord.x;
    piece.position.y = coord.y;
    return piece;
  }

  private addPiecesToContainer(p: Player, container: Container) {
    const color = p.color;
    p.roads.forEach((r) => {
      this.pieceGraphics.lineStyle(24, color);
      const startScreenX = r.start.x;
      const startScreenY = r.start.y;
      const endScreenX = r.end.x;
      const endScreenY = r.end.y;
      this.pieceGraphics.moveTo(startScreenX, startScreenY);
      this.pieceGraphics.lineTo(endScreenX, endScreenY);
    });
    p.houses.forEach((h) => {
      const piece = this.createPiece(
        'House',
        { x: 80, y: 80 },
        p.color,
        h.position,
      );
      container.addChild(piece);
    });
    p.cities.forEach((c) => {
      const piece = this.createPiece(
        'City',
        { x: 124, y: 124 },
        p.color,
        c.position,
      );
      container.addChild(piece);
    });
  }

  private generateTile(tile: Tile, corner, lineWidth) {
    const generator = this.sprites[tile.type.toString()];
    const s = generator();
    s.width = this.tileWidth;
    s.height = this.tileHeight;
    s.position.x = corner.x - this.tileWidth - lineWidth / 2;
    s.position.y = corner.y - this.tileHeight / 2;
    return s;
  }

  @Watch('world')
  private DrawMap(newWorld: World, oldWorld: World): void {
    if (!newWorld) {
      return;
    }
    const compare = this.compareWorlds(oldWorld, newWorld);
    const redrawTiles = compare[0];
    const redrawPieces = compare[1];
    let tileContainer: Container;
    let pieceContainer: Container;

    if (redrawTiles) {
      tileContainer = new PIXI.Container();
      const map: Tile[] = !newWorld || !newWorld.map ? [] : newWorld.map;
      const lineWidth = 24;
      const Hex = extendHex({
        size: this.hexSize,
        orientation: 'flat',
      });
      this.grid = defineGrid(Hex);
      const center = Hex(0, 0);

      this.lineGraphics.removeChildren();
      this.lineGraphics.clear();
      map.forEach((tile) => {
        const hex = Hex(tile.coord.x, tile.coord.y);
        const point = hex.toPoint();
        const corners = hex.corners().map((corner) => corner.add(point));
        const [firstCorner, ...otherCorners] = corners;
        // Tiles
        const tileSprite = this.generateTile(tile, firstCorner, lineWidth);
        tileContainer.addChild(tileSprite);
        // Hex lines
        this.lineGraphics.lineStyle(lineWidth, 0xffffff);
        this.lineGraphics.moveTo(firstCorner.x, firstCorner.y);
        otherCorners.forEach(({ x, y }) => this.lineGraphics.lineTo(x, y));
        this.lineGraphics.lineTo(firstCorner.x, firstCorner.y);
      });
    }

    // Game pieces
    if (redrawPieces) {
      pieceContainer = new PIXI.Container();
      newWorld.players.forEach((p) => {
        this.addPiecesToContainer(p, pieceContainer);
      });
    }

    if (redrawTiles) {
      this.tileGraphics.removeChildren();
      this.tileGraphics.clear();
      this.tileGraphics.addChild(tileContainer);
    }
    if (redrawPieces) {
      this.pieceGraphics.removeChildren();
      this.pieceGraphics.clear();
      this.pieceGraphics.addChild(pieceContainer);
    }
  }
}
</script>

<style lang="scss" scoped>
#Map {
  background-color: #e4e4e4;
  padding: 0px;
}

#error {
  position: absolute;
  top: 2%;
}

#gameID {
  position: absolute;
  top: 0;
  background-color: rgba(255, 255, 255, 0.4);
  text-align: left;
  width: 100%;
  padding-left: 6px;
  font-size: 12px;
}
</style>
