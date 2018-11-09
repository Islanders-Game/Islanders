<template>
<v-container fluid fill-height id="Map">
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
  matrixCoordToWorldCoord,
} from '../../../pilgrims-shared/dist/Shared';
import {
  BuildHouseAction,
  Action,
  BuildCityAction,
  BuildRoadAction,
} from '../../../pilgrims-shared/dist/Action';
import { Player as PlayerState } from '../../../pilgrims-shared/dist/Shared';
import { buildingType } from '../store/modules/ui';
import {
  generateSprites,
  generateTile,
  generateTileNumber,
} from './SpriteGenerators';

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
  private sprites = generateSprites();
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
    that.viewport.on('pointerup', this.handleBuildClick);
  }

  get player(): PlayerState {
    return this.$store.getters['game/getPlayer'](
      this.$store.state.game.playerName,
    );
  }

  get isBuilding(): buildingType {
    return this.$store.state.ui.isBuilding;
  }

  get world() {
    return this.$store.state.game.world as World;
  }

  private findTile(hex) {
    const map = this.world.map;
    return map.find((tile) => tile.coord.x === hex.x && tile.coord.y === hex.y);
  }

  private getClosestPoint(
    point: Point,
  ): { point: { x: number; y: number }; index: number; dist: number } {
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
    let closestPoint = { point: centerOfHex, index: -1, dist: distance };
    const corners = hexToFind.corners();
    for (let i = 0; i < corners.length; i++) {
      const corner = corners[i];
      corner.x += hexOrigin.x;
      corner.y += hexOrigin.y;
      const cornerDist = distanceFunc(point, corner);
      if (closestPoint.dist >= cornerDist) {
        closestPoint = { point: corners[i], index: i, dist: cornerDist };
      }
    }
    return closestPoint;
  }

  private getTwoClosestPoints(
    point: Point,
  ): Array<{ point: { x: number; y: number }; index: number; dist: number }> {
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

    let closestPoint = {
      point: centerOfHex,
      index: -1,
      dist: distanceFunc(point, centerOfHex) * distanceFunc(point, centerOfHex),
    };
    let secondClosestPoint = closestPoint;
    const corners = hexToFind.corners();
    for (let i = 0; i < corners.length; i++) {
      const corner = corners[i];
      corner.x += hexOrigin.x;
      corner.y += hexOrigin.y;
      const cornerDist = distanceFunc(point, corner);
      if (closestPoint.dist >= cornerDist) {
        secondClosestPoint = closestPoint;
        closestPoint = { point: corners[i], index: i, dist: cornerDist };
      } else if (secondClosestPoint.dist >= cornerDist) {
        secondClosestPoint = { point: corners[i], index: i, dist: cornerDist };
      }
    }
    return [closestPoint, secondClosestPoint];
  }

  private dispatchBuildAction(event, action: Action) {
    this.cursorGraphics.clear();
    this.cursorGraphics.removeChildren();
    this.$store.dispatch('game/sendAction', action);
  }

  private handleBuildClick(event) {
    const inWorld = this.viewport.toWorld(event.data.global);
    const closestPoints = this.getTwoClosestPoints(inWorld);
    if (closestPoints[0].index === -1) {
      return;
    }

    const hexToFind = this.grid.pointToHex(inWorld);
    const coord = getMatrixCoordCorner(hexToFind, closestPoints[0].index);
    if (this.isBuilding === 'House') {
      this.dispatchBuildAction(
        event,
        new BuildHouseAction(this.$store.state.game.playerName, coord),
      );
      this.$store.commit('ui/setIsBuilding', 'None');
    }
    if (this.isBuilding === 'City') {
      this.dispatchBuildAction(
        event,
        new BuildCityAction(this.$store.state.game.playerName, coord),
      );
      this.$store.commit('ui/setIsBuilding', 'None');
    }
    if (this.isBuilding === 'Road' && closestPoints[1].index !== -1) {
      const coord2 = getMatrixCoordCorner(hexToFind, closestPoints[1].index);
      this.dispatchBuildAction(
        event,
        new BuildRoadAction(this.$store.state.game.playerName, coord, coord2),
      );
      this.$store.commit('ui/setIsBuilding', 'None');
    }
  }

  private cursorForSprite(event, type: string) {
    const inWorld = this.viewport.toWorld(event.data.global);
    const closest = this.getClosestPoint(inWorld);
    if (closest.index !== -1) {
      this.cursorGraphics.clear();
      this.cursorGraphics.removeChildren();
      const piece = this.createPiece(
        type,
        { x: 100, y: 100 },
        this.player.color,
        closest.point,
      );
      piece.alpha = 0.6;
      this.cursorGraphics.addChild(piece);
    }
  }

  private cursorForRoad(event) {
    const inWorld = this.viewport.toWorld(event.data.global);
    const closestPoints = this.getTwoClosestPoints(inWorld);

    this.cursorGraphics.clear();
    this.cursorGraphics.removeChildren();
    if (closestPoints[0].index !== -1 && closestPoints[1].index !== -1) {
      this.cursorGraphics.lineStyle(30, 0xffff00);
      this.cursorGraphics.moveTo(
        closestPoints[0].point.x,
        closestPoints[0].point.y,
      );
      this.cursorGraphics.lineTo(
        closestPoints[1].point.x,
        closestPoints[1].point.y,
      );
    }
  }

  private handleMove(event) {
    if (this.isBuilding === 'House') {
      this.cursorForSprite(event, 'House');
      return;
    }
    if (this.isBuilding === 'City') {
      this.cursorForSprite(event, 'City');
      return;
    }
    if (this.isBuilding === 'Road') {
      this.cursorForRoad(event);
      return;
    }
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
      worldHeight: 1000,
      worldWidth: 1000,
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
    debugger;
    const generator = this.sprites[spriteType];
    const piece = generator();
    piece.width = dimensions.x;
    piece.height = dimensions.y;
    piece.tint = tint;
    piece.position.x = coord.x;
    piece.position.y = coord.y;
    piece.anchor.x = 0.5;
    piece.anchor.y = 0.5;
    return piece;
  }

  private addPiecesToContainer(p: Player, container: Container) {
    const color = p.color;
    const roadGraphics = new Graphics();
    p.roads.forEach((r) => {
      roadGraphics.lineStyle(24, color);
      const start = matrixCoordToWorldCoord(
        r.start,
        this.grid.Hex().width(),
        this.grid.Hex().height(),
      );
      const end = matrixCoordToWorldCoord(
        r.end,
        this.grid.Hex().width(),
        this.grid.Hex().height(),
      );
      roadGraphics.moveTo(start.x, start.y);
      roadGraphics.lineTo(end.x, end.y);
    });
    container.addChild(roadGraphics);
    p.houses.forEach((h) => {
      const piece = this.createPiece(
        'House',
        { x: 100, y: 100 },
        color,
        matrixCoordToWorldCoord(
          h.position,
          this.grid.Hex().width(),
          this.grid.Hex().height(),
        ),
      );
      container.addChild(piece);
    });
    p.cities.forEach((c) => {
      const piece = this.createPiece(
        'City',
        { x: 124, y: 124 },
        color,
        matrixCoordToWorldCoord(
          c.position,
          this.grid.Hex().width(),
          this.grid.Hex().height(),
        ),
      );
      container.addChild(piece);
    });
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
        hex.center();
        const point = hex.toPoint();
        const corners = hex.corners().map((corner) => corner.add(point));
        const [firstCorner, ...otherCorners] = corners;
        // Tiles
        const tileSprite = generateTile(
          this.tileWidth,
          this.tileHeight,
          tile,
          firstCorner,
          lineWidth,
        );

        tileContainer.addChild(tileSprite);

        if (newWorld.started) {
          const tileNumber = generateTileNumber(
            this.tileWidth,
            hex.center(),
            hex.toPoint(),
            tile,
          );
          if (tileNumber) {
            tileContainer.addChild(tileNumber);
          }
        }
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
</style>
