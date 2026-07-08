// 10 Level configurations for Angry Birds 2D
// Points: 
// - Wood block: 100, Stone block: 200, Glass block: 50, TNT block: 500
// - Small Pig: 1000, Regular: 1500, Helmet: 2000, Moustache: 3000, King: 5000
// - Bird left: 1000 each

export const Levels = [
  {
    id: 1,
    name: "Level 1 - Làm quen",
    difficulty: "Tutorial",
    width: 1200,
    height: 600,
    sling: { x: 180, y: 440 },
    birds: ["red", "red", "red"],
    blocks: [
      { type: "wood", x: 800, y: 500, w: 20, h: 80 },
      { type: "wood", x: 900, y: 500, w: 20, h: 80 },
      { type: "wood", x: 850, y: 450, w: 120, h: 20 }
    ],
    pigs: [
      { type: "small", x: 850, y: 510 },
      { type: "small", x: 850, y: 420 }
    ],
    starThresholds: {
      one: 1,         // Winning gets 1 star
      two: 2000,      // 60% of average score
      three: 3500     // 85% and bird left
    }
  },
  {
    id: 2,
    name: "Level 2 - Gỗ cao",
    difficulty: "Tutorial",
    width: 1200,
    height: 600,
    sling: { x: 180, y: 440 },
    birds: ["red", "red", "yellow"],
    blocks: [
      { type: "wood", x: 820, y: 490, w: 15, h: 100 },
      { type: "wood", x: 920, y: 490, w: 15, h: 100 },
      { type: "wood", x: 870, y: 430, w: 130, h: 15 },
      { type: "wood", x: 840, y: 380, w: 15, h: 80 },
      { type: "wood", x: 900, y: 380, w: 15, h: 80 },
      { type: "wood", x: 870, y: 330, w: 90, h: 15 }
    ],
    pigs: [
      { type: "regular", x: 870, y: 500 },
      { type: "regular", x: 870, y: 390 },
      { type: "regular", x: 870, y: 300 }
    ],
    starThresholds: {
      one: 1,
      two: 3300,
      three: 5500
    }
  },
  {
    id: 3,
    name: "Level 3 - Kính",
    difficulty: "Easy",
    width: 1200,
    height: 600,
    sling: { x: 180, y: 440 },
    birds: ["blue", "blue", "red"],
    blocks: [
      { type: "glass", x: 800, y: 500, w: 15, h: 80 },
      { type: "glass", x: 870, y: 500, w: 15, h: 80 },
      { type: "glass", x: 940, y: 500, w: 15, h: 80 },
      { type: "glass", x: 870, y: 450, w: 180, h: 15 },
      { type: "glass", x: 830, y: 400, w: 15, h: 80 },
      { type: "glass", x: 910, y: 400, w: 15, h: 80 },
      { type: "glass", x: 870, y: 350, w: 110, h: 15 }
    ],
    pigs: [
      { type: "small", x: 835, y: 500 },
      { type: "small", x: 905, y: 500 },
      { type: "small", x: 870, y: 400 },
      { type: "small", x: 870, y: 320 }
    ],
    starThresholds: {
      one: 1,
      two: 3000,
      three: 5200
    }
  },
  {
    id: 4,
    name: "Level 4 - Gỗ + Kính",
    difficulty: "Easy",
    width: 1200,
    height: 600,
    sling: { x: 180, y: 440 },
    birds: ["yellow", "blue", "blue", "red"],
    blocks: [
      { type: "wood", x: 800, y: 500, w: 20, h: 80 },
      { type: "glass", x: 900, y: 500, w: 15, h: 80 },
      { type: "wood", x: 850, y: 450, w: 130, h: 20 },
      { type: "glass", x: 810, y: 400, w: 15, h: 80 },
      { type: "wood", x: 890, y: 400, w: 20, h: 80 },
      { type: "glass", x: 850, y: 350, w: 110, h: 15 }
    ],
    pigs: [
      { type: "regular", x: 850, y: 500 },
      { type: "regular", x: 850, y: 400 },
      { type: "regular", x: 815, y: 320 },
      { type: "regular", x: 885, y: 320 }
    ],
    starThresholds: {
      one: 1,
      two: 4500,
      three: 7200
    }
  },
  {
    id: 5,
    name: "Level 5 - Đá đầu tiên",
    difficulty: "Medium",
    width: 1200,
    height: 600,
    sling: { x: 180, y: 440 },
    birds: ["yellow", "yellow", "red", "red"],
    blocks: [
      { type: "stone", x: 780, y: 490, w: 25, h: 100 },
      { type: "stone", x: 920, y: 490, w: 25, h: 100 },
      { type: "stone", x: 850, y: 430, w: 170, h: 20 },
      { type: "wood", x: 810, y: 370, w: 20, h: 100 },
      { type: "wood", x: 890, y: 370, w: 20, h: 100 },
      { type: "wood", x: 850, y: 310, w: 110, h: 20 }
    ],
    pigs: [
      { type: "helmet", x: 850, y: 500 },
      { type: "helmet", x: 850, y: 370 },
      { type: "regular", x: 780, y: 370 },
      { type: "regular", x: 920, y: 370 }
    ],
    starThresholds: {
      one: 1,
      two: 5000,
      three: 8500
    }
  },
  {
    id: 6,
    name: "Level 6 - TNT",
    difficulty: "Medium",
    width: 1200,
    height: 600,
    sling: { x: 180, y: 440 },
    birds: ["black", "red", "red", "yellow"],
    blocks: [
      { type: "wood", x: 750, y: 500, w: 20, h: 80 },
      { type: "tnt", x: 830, y: 510, w: 40, h: 40 },
      { type: "wood", x: 910, y: 500, w: 20, h: 80 },
      { type: "wood", x: 830, y: 450, w: 200, h: 20 },
      { type: "glass", x: 780, y: 400, w: 15, h: 80 },
      { type: "tnt", x: 830, y: 400, w: 40, h: 40 },
      { type: "glass", x: 880, y: 400, w: 15, h: 80 },
      { type: "glass", x: 830, y: 350, w: 130, h: 15 }
    ],
    pigs: [
      { type: "regular", x: 790, y: 500 },
      { type: "regular", x: 870, y: 500 },
      { type: "regular", x: 800, y: 400 },
      { type: "regular", x: 860, y: 400 },
      { type: "regular", x: 830, y: 320 }
    ],
    starThresholds: {
      one: 1,
      two: 6000,
      three: 9800
    }
  },
  {
    id: 7,
    name: "Level 7 - Thành trì",
    difficulty: "Hard",
    width: 1200,
    height: 600,
    sling: { x: 180, y: 440 },
    birds: ["black", "black", "yellow", "yellow"],
    blocks: [
      { type: "stone", x: 760, y: 520, w: 30, h: 100 },
      { type: "stone", x: 840, y: 520, w: 30, h: 100 },
      { type: "stone", x: 920, y: 520, w: 30, h: 100 },
      { type: "stone", x: 800, y: 460, w: 110, h: 20 },
      { type: "stone", x: 880, y: 460, w: 110, h: 20 },
      { type: "wood", x: 780, y: 400, w: 20, h: 100 },
      { type: "wood", x: 900, y: 400, w: 20, h: 100 },
      { type: "wood", x: 840, y: 340, w: 160, h: 20 }
    ],
    pigs: [
      { type: "helmet", x: 800, y: 550 },
      { type: "helmet", x: 880, y: 550 },
      { type: "helmet", x: 840, y: 430 },
      { type: "regular", x: 1000, y: 552 },
      { type: "regular", x: 780, y: 312 },
      { type: "regular", x: 900, y: 312 }
    ],
    starThresholds: {
      one: 1,
      two: 7000,
      three: 11500
    }
  },
  {
    id: 8,
    name: "Level 8 - Công trình phức tạp",
    difficulty: "Hard",
    width: 1200,
    height: 600,
    sling: { x: 180, y: 440 },
    birds: ["white", "black", "blue", "blue"],
    blocks: [
      // Floor 1
      { type: "stone", x: 750, y: 500, w: 25, h: 80 },
      { type: "stone", x: 850, y: 500, w: 25, h: 80 },
      { type: "stone", x: 950, y: 500, w: 25, h: 80 },
      { type: "stone", x: 850, y: 450, w: 240, h: 20 },
      // Floor 2
      { type: "wood", x: 780, y: 400, w: 20, h: 80 },
      { type: "wood", x: 920, y: 400, w: 20, h: 80 },
      { type: "wood", x: 850, y: 350, w: 180, h: 15 },
      // Floor 3
      { type: "glass", x: 810, y: 300, w: 15, h: 80 },
      { type: "glass", x: 890, y: 300, w: 15, h: 80 },
      { type: "glass", x: 850, y: 250, w: 110, h: 15 }
    ],
    pigs: [
      { type: "helmet", x: 800, y: 500 },
      { type: "helmet", x: 900, y: 500 },
      { type: "helmet", x: 850, y: 400 },
      { type: "regular", x: 800, y: 400 },
      { type: "regular", x: 900, y: 400 },
      { type: "regular", x: 850, y: 300 },
      { type: "regular", x: 850, y: 220 }
    ],
    starThresholds: {
      one: 1,
      two: 8000,
      three: 13000
    }
  },
  {
    id: 9,
    name: "Level 9 - Pháo đài",
    difficulty: "Very Hard",
    width: 1300,
    height: 600,
    sling: { x: 180, y: 440 },
    birds: ["red", "blue", "yellow", "black", "white"],
    blocks: [
      // Stone base
      { type: "stone", x: 720, y: 500, w: 25, h: 80 },
      { type: "stone", x: 840, y: 500, w: 25, h: 80 },
      { type: "stone", x: 960, y: 500, w: 25, h: 80 },
      { type: "stone", x: 840, y: 450, w: 280, h: 20 },
      { type: "tnt", x: 840, y: 510, w: 40, h: 40 },
      // Wood middle
      { type: "wood", x: 750, y: 400, w: 20, h: 80 },
      { type: "wood", x: 930, y: 400, w: 20, h: 80 },
      { type: "wood", x: 840, y: 350, w: 220, h: 15 },
      // Glass top
      { type: "glass", x: 780, y: 300, w: 15, h: 80 },
      { type: "glass", x: 900, y: 300, w: 15, h: 80 },
      { type: "glass", x: 840, y: 250, w: 150, h: 15 }
    ],
    pigs: [
      { type: "moustache", x: 780, y: 500 },
      { type: "moustache", x: 900, y: 500 },
      { type: "helmet", x: 840, y: 400 },
      { type: "helmet", x: 780, y: 400 },
      { type: "helmet", x: 900, y: 400 },
      { type: "regular", x: 840, y: 300 },
      { type: "regular", x: 810, y: 220 },
      { type: "regular", x: 870, y: 220 }
    ],
    starThresholds: {
      one: 1,
      two: 10000,
      three: 15500
    }
  },
  {
    id: 10,
    name: "Level 10 - Trùm cuối",
    difficulty: "Boss",
    width: 1800, // Large tracking map width
    height: 600,
    sling: { x: 200, y: 440 },
    birds: ["red", "red", "red", "blue", "yellow", "black", "white"],
    blocks: [
      // Giant stone foundation
      { type: "stone", x: 1200, y: 490, w: 30, h: 100 },
      { type: "stone", x: 1350, y: 490, w: 30, h: 100 },
      { type: "stone", x: 1500, y: 490, w: 30, h: 100 },
      { type: "stone", x: 1275, y: 430, w: 180, h: 20 },
      { type: "stone", x: 1425, y: 430, w: 180, h: 20 },
      // Wood middle columns and deck
      { type: "wood", x: 1240, y: 370, w: 20, h: 100 },
      { type: "wood", x: 1460, y: 370, w: 20, h: 100 },
      { type: "wood", x: 1350, y: 310, w: 260, h: 20 },
      // Glass upper dome
      { type: "glass", x: 1290, y: 260, w: 15, h: 80 },
      { type: "glass", x: 1410, y: 260, w: 15, h: 80 },
      { type: "glass", x: 1350, y: 210, w: 140, h: 15 },
      // TNT Outposts
      { type: "tnt", x: 1100, y: 510, w: 40, h: 40 },
      { type: "tnt", x: 1600, y: 510, w: 40, h: 40 }
    ],
    pigs: [
      { type: "king", x: 1350, y: 490 }, // Boss in the center
      { type: "moustache", x: 1260, y: 490 },
      { type: "moustache", x: 1440, y: 490 },
      { type: "moustache", x: 1350, y: 370 },
      { type: "moustache", x: 1350, y: 260 },
      { type: "helmet", x: 1100, y: 460 }, // Guard on TNT 1
      { type: "helmet", x: 1600, y: 460 }, // Guard on TNT 2
      { type: "helmet", x: 1350, y: 400 }
    ],
    starThresholds: {
      one: 1,
      two: 14000,
      three: 20500
    }
  }
];
