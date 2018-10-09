# Game Rules

## Notes
State, action => state
Maybe dont have x,y coordinates but simply ids - seperate logic from positions, requires changes to road.

## State

### Game
- Players[]
- Thief<Optional<TileID>>
- Map

### Players
- Wood
- Stone,
- Clay,
- Hay,
- Wool
- Houses[]
- Cities[]
- Roads[]

### House
- Position<x,y>

### City
- Position<x,y>

### Road
- Start<x,y>
- End<x,y>

### Map
- Tiles[]

### Tile
- type<Wood, Stone, Clay, Grain, Wool>
- 

## Actions
- Build House
- Build City
- Build Road
- Move thief
- Buy Card
- Play Card
- Trade 

### Build House
- Input: 
    - Position<x,y>
    - Owner
- Validation:
    - Check if next to owned road
    - Check no house within 2 tiles
    - Check if enough resources
- Output:
    - Owner now has a house on position<x,y>

### Build City
- input: 
    - Position<x,y>
    - Owner
- Validation: 
    - Check if position already has owned house
    - Check if enough resources
- Output:
    - Previous house on position<x,y> removed.
    - Owner now has a city on position<x,y>

### Build road
- input:
    - Start<x,y>,
    - End<x,y>,
    - Owner
- Validation:
    - Check if Start or End has a owned city
    - Check if position already has a road
    - Check if Distance(Start,End)==1
- Output
    - Owner now has a road from Start<x,y> to End<x,y>

### Move thief
- Input:
    - Tile
- Validation:
- Output
    - thief is now on Tile.

### Buy Card
- Input
    - Buyer
- Validation:
    - Check if player has resources
- Output
    - Assign random card to buyer

### Play Card
- Input
    - CardType
    - Player
- Validation
- Output
    - Player gets what the card says (pattern match that shit)

### Trade
- Input
    - Player1
    - Player2
    - Resource1[]
    - Resource2[]
- Validation:
    - Check that each player owns the resources they offer
- Output
    - Player1 removes Resources1[] from his/hers resource
    - Player2 removes Resources2[] from his/hers resource
    - Player1 adds Resources2[] to his/hers resource
    - Player2 adds Resources1[] to his/hers resource
