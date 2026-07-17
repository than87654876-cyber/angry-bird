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
  },
  {
    id: 11,
    name: "Màn 11: Sự Càn Quét Của Big Red",
    difficulty: "Medium",
    width: 1800,
    sling: { x: 200, y: 440 },
    birds: ["red", "red", "green"],
    blocks: [
      { type: "stone", x: 1100, y: 470, w: 40, h: 200 },
      { type: "stone", x: 1100, y: 350, w: 100, h: 40 },
      { type: "stone", x: 1300, y: 520, w: 25, h: 100 },
      { type: "stone", x: 1400, y: 520, w: 25, h: 100 },
      { type: "wood", x: 1350, y: 460, w: 130, h: 20 },
      { type: "glass", x: 1350, y: 400, w: 60, h: 60 }
    ],
    pigs: [
      { type: "moustache", x: 1350, y: 520 },
      { type: "helmet", x: 1350, y: 430 },
      { type: "regular", x: 1100, y: 310 }
    ],
    starThresholds: {
      one: 1,
      two: 6000,
      three: 8500
    }
  },
  {
    id: 12,
    name: "Màn 12: Sự Trỗi Dậy Của Chim Cam",
    difficulty: "Medium",
    width: 1800,
    sling: { x: 200, y: 440 },
    birds: ["yellow", "orange", "blue"],
    blocks: [
      { type: "wood", x: 1200, y: 520, w: 20, h: 100 },
      { type: "wood", x: 1280, y: 520, w: 20, h: 100 },
      { type: "wood", x: 1240, y: 460, w: 100, h: 20 },
      { type: "wood", x: 1210, y: 400, w: 20, h: 100 },
      { type: "wood", x: 1270, y: 400, w: 20, h: 100 },
      { type: "wood", x: 1240, y: 340, w: 100, h: 20 },
      { type: "stone", x: 1140, y: 520, w: 30, h: 100 },
      { type: "stone", x: 1340, y: 520, w: 30, h: 100 },
      { type: "glass", x: 1240, y: 300, w: 60, h: 60 }
    ],
    pigs: [
      { type: "moustache", x: 1240, y: 520 },
      { type: "helmet", x: 1240, y: 400 },
      { type: "regular", x: 1140, y: 450 },
      { type: "regular", x: 1340, y: 450 }
    ],
    starThresholds: {
      one: 1,
      two: 7500,
      three: 10500
    }
  },
  {
    id: 13,
    name: "Màn 13: Tia Laser Xuyên Thấu",
    difficulty: "Medium",
    width: 1800,
    sling: { x: 200, y: 440 },
    birds: ["blue", "purple", "yellow"],
    blocks: [
      { type: "stone", x: 1150, y: 470, w: 40, h: 200 },
      { type: "stone", x: 1350, y: 470, w: 40, h: 200 },
      { type: "wood", x: 1250, y: 520, w: 100, h: 20 },
      { type: "glass", x: 1250, y: 460, w: 80, h: 100 },
      { type: "wood", x: 1250, y: 400, w: 100, h: 20 }
    ],
    pigs: [
      { type: "moustache", x: 1250, y: 500 },
      { type: "helmet", x: 1150, y: 340 },
      { type: "helmet", x: 1350, y: 340 }
    ],
    starThresholds: {
      one: 1,
      two: 6500,
      three: 9200
    }
  },
  {
    id: 14,
    name: "Màn 14: Kích Bại Từ Phía Sau",
    difficulty: "Hard",
    width: 1800,
    sling: { x: 200, y: 440 },
    birds: ["blue", "yellow", "green"],
    blocks: [
      { type: "stone", x: 1100, y: 470, w: 40, h: 200 },
      { type: "stone", x: 1400, y: 470, w: 40, h: 200 },
      { type: "wood", x: 1250, y: 520, w: 200, h: 20 },
      { type: "glass", x: 1250, y: 460, w: 120, h: 20 },
      { type: "stone", x: 1250, y: 400, w: 60, h: 60 }
    ],
    pigs: [
      { type: "moustache", x: 1250, y: 490 },
      { type: "helmet", x: 1190, y: 490 },
      { type: "helmet", x: 1310, y: 490 }
    ],
    starThresholds: {
      one: 1,
      two: 6500,
      three: 9000
    }
  },
  {
    id: 15,
    name: "Màn 15: Liên Quân Big Red & Phình To",
    difficulty: "Hard",
    width: 1800,
    sling: { x: 200, y: 440 },
    birds: ["red", "orange", "green"],
    blocks: [
      { type: "wood", x: 1150, y: 520, w: 20, h: 100 },
      { type: "wood", x: 1250, y: 520, w: 20, h: 100 },
      { type: "stone", x: 1200, y: 460, w: 120, h: 20 },
      { type: "tnt", x: 1200, y: 520, w: 40, h: 40 },
      { type: "glass", x: 1200, y: 400, w: 80, h: 80 },
      { type: "stone", x: 1100, y: 520, w: 30, h: 100 }
    ],
    pigs: [
      { type: "moustache", x: 1200, y: 340 },
      { type: "helmet", x: 1100, y: 450 },
      { type: "helmet", x: 1290, y: 520 }
    ],
    starThresholds: {
      one: 1,
      two: 7000,
      three: 9500
    }
  },
  {
    id: 16,
    name: "Màn 16: Tháp Đa Tầng Cực Hạn",
    difficulty: "Hard",
    width: 1800,
    sling: { x: 200, y: 440 },
    birds: ["yellow", "black", "orange"],
    blocks: [
      { type: "stone", x: 1100, y: 520, w: 30, h: 100 },
      { type: "stone", x: 1250, y: 520, w: 30, h: 100 },
      { type: "wood", x: 1175, y: 460, w: 180, h: 20 },
      { type: "glass", x: 1140, y: 400, w: 15, h: 100 },
      { type: "glass", x: 1210, y: 400, w: 15, h: 100 },
      { type: "wood", x: 1175, y: 340, w: 100, h: 15 },
      { type: "tnt", x: 1175, y: 520, w: 40, h: 40 },
      { type: "stone", x: 1175, y: 300, w: 40, h: 60 }
    ],
    pigs: [
      { type: "moustache", x: 1175, y: 410 },
      { type: "helmet", x: 1120, y: 520 },
      { type: "helmet", x: 1230, y: 520 },
      { type: "regular", x: 1175, y: 250 }
    ],
    starThresholds: {
      one: 1,
      two: 8500,
      three: 11000
    }
  },
  {
    id: 17,
    name: "Màn 17: Phục Kích Mật Phòng",
    difficulty: "Hard",
    width: 1800,
    sling: { x: 200, y: 440 },
    birds: ["white", "purple", "blue"],
    blocks: [
      { type: "stone", x: 1150, y: 470, w: 40, h: 200 },
      { type: "stone", x: 1350, y: 470, w: 40, h: 200 },
      { type: "glass", x: 1250, y: 520, w: 160, h: 15 },
      { type: "wood", x: 1250, y: 420, w: 160, h: 15 },
      { type: "stone", x: 1250, y: 370, w: 30, h: 80 }
    ],
    pigs: [
      { type: "moustache", x: 1250, y: 490 },
      { type: "moustache", x: 1250, y: 440 },
      { type: "helmet", x: 1250, y: 320 }
    ],
    starThresholds: {
      one: 1,
      two: 7500,
      three: 10000
    }
  },
  {
    id: 18,
    name: "Màn 18: Lâu Đài Đá Vỡ Vụn",
    difficulty: "Hard",
    width: 1800,
    sling: { x: 200, y: 440 },
    birds: ["blue", "black", "orange", "yellow"],
    blocks: [
      { type: "stone", x: 1150, y: 520, w: 40, h: 100 },
      { type: "stone", x: 1300, y: 520, w: 40, h: 100 },
      { type: "wood", x: 1225, y: 460, w: 160, h: 20 },
      { type: "wood", x: 1200, y: 400, w: 20, h: 100 },
      { type: "wood", x: 1250, y: 400, w: 20, h: 100 },
      { type: "tnt", x: 1225, y: 520, w: 45, h: 45 },
      { type: "stone", x: 1225, y: 340, w: 100, h: 20 }
    ],
    pigs: [
      { type: "moustache", x: 1225, y: 420 },
      { type: "helmet", x: 1100, y: 520 },
      { type: "helmet", x: 1350, y: 520 },
      { type: "regular", x: 1225, y: 300 }
    ],
    starThresholds: {
      one: 1,
      two: 8800,
      three: 12200
    }
  },
  {
    id: 19,
    name: "Màn 19: Tam Hùng Phối Hợp",
    difficulty: "Extreme",
    width: 2000,
    sling: { x: 200, y: 440 },
    birds: ["purple", "orange", "green", "red"],
    blocks: [
      { type: "stone", x: 1200, y: 520, w: 40, h: 100 },
      { type: "stone", x: 1400, y: 520, w: 40, h: 100 },
      { type: "wood", x: 1300, y: 460, w: 220, h: 20 },
      { type: "glass", x: 1250, y: 400, w: 20, h: 100 },
      { type: "glass", x: 1350, y: 400, w: 20, h: 100 },
      { type: "stone", x: 1300, y: 340, w: 120, h: 20 },
      { type: "tnt", x: 1100, y: 520, w: 40, h: 40 },
      { type: "tnt", x: 1500, y: 520, w: 40, h: 40 },
      { type: "stone", x: 1300, y: 520, w: 30, h: 100 }
    ],
    pigs: [
      { type: "king", x: 1300, y: 420 },
      { type: "moustache", x: 1300, y: 490 },
      { type: "helmet", x: 1100, y: 470 },
      { type: "helmet", x: 1500, y: 470 }
    ],
    starThresholds: {
      one: 1,
      two: 12000,
      three: 15500
    }
  },
  {
    id: 20,
    name: "Màn 20: Đại Chiến Thần Bát Đại",
    difficulty: "Extreme",
    width: 2200,
    sling: { x: 200, y: 440 },
    birds: ["red", "blue", "yellow", "black", "white", "green", "orange", "purple"],
    blocks: [
      { type: "stone", x: 1200, y: 520, w: 50, h: 100 },
      { type: "stone", x: 1450, y: 520, w: 50, h: 100 },
      { type: "stone", x: 1325, y: 460, w: 300, h: 20 },
      { type: "wood", x: 1250, y: 400, w: 25, h: 100 },
      { type: "wood", x: 1400, y: 400, w: 25, h: 100 },
      { type: "wood", x: 1325, y: 340, w: 180, h: 20 },
      { type: "glass", x: 1290, y: 280, w: 15, h: 100 },
      { type: "glass", x: 1360, y: 280, w: 15, h: 100 },
      { type: "glass", x: 1325, y: 220, w: 90, h: 15 },
      { type: "tnt", x: 1325, y: 520, w: 40, h: 40 },
      { type: "tnt", x: 1050, y: 520, w: 40, h: 40 },
      { type: "tnt", x: 1600, y: 520, w: 40, h: 40 },
      { type: "stone", x: 1325, y: 400, w: 40, h: 80 }
    ],
    pigs: [
      { type: "king", x: 1325, y: 280 },
      { type: "moustache", x: 1325, y: 520 },
      { type: "moustache", x: 1325, y: 430 },
      { type: "helmet", x: 1220, y: 520 },
      { type: "helmet", x: 1430, y: 520 },
      { type: "helmet", x: 1050, y: 470 },
      { type: "helmet", x: 1600, y: 470 }
    ],
    starThresholds: {
      one: 1,
      two: 18000,
      three: 25000
    }
  }
];
