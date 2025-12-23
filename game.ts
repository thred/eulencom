// Room interface for type safety
interface Room {
  name: string;
  description: string;
  darkDescription?: string;
  exits: { [direction: string]: string };
  items?: string[];
}

// Game state
interface GameState {
  currentRoom: string;
  inventory: string[];
  visitedRooms: Set<string>;
  lightsOn: boolean;
  doorLocked: boolean;
  dressed: boolean;
  fellOverChair: boolean;
  commodorePickedUp: boolean;
  gameWon: boolean;
  gameLost: boolean;
}

// Define all rooms in the game
const rooms: { [key: string]: Room } = {
  bedroom: {
    name: "Your Nerd Cave (1989)",
    description:
      "Your bedroom is a shrine to 80s computing. Posters of Tron and WarGames adorn the walls. Your trusty Commodore 64 sits on the desk to the SOUTH, its beige plastic gleaming. A wardrobe full of graphic tees is to the WEST. An overturned office chair with squeaky wheels lies near the desk. The door to freedom (and breakfast) is to the NORTH. A light switch is mounted on the wall by the door.",
    darkDescription:
      "It's pitch black. You can't see a thing. You hear muffled sounds outside your door to the NORTH. Your bed is somewhere behind you. You know your room has a desk to the SOUTH, a wardrobe to the WEST, and a light switch... somewhere near the door.",
    exits: { north: "hallway" },
    items: ["clothes"],
  },
  hallway: {
    name: "The Hallway of Victory",
    description:
      "SURPRISE!!! 🎉🎂🎈\n\nA massive crowd erupts in cheers! Balloons fall from the ceiling! Your friends, and even that weird kid writing adventures for your birthday are all here!\n\n'HAPPY BIRTHDAY!' they shout in unison.\n\nYour Metallica t-shirt has never looked so good. Today is YOUR day!\n\n🎮 CONGRATULATIONS! YOU WON THE GAME! 🎮",
    exits: {},
    items: [],
  },
  hallwayFail: {
    name: "The Hallway of Shame",
    description:
      "You open the door, naked ...\n\nThe crowd gasps. Your friends cover their eyes. Someone's camera flashes. You dissolve in shame. GAME OVER.",
    exits: {},
    items: [],
  },
};

// Initialize game state
const gameState: GameState = {
  currentRoom: "bedroom",
  inventory: [],
  visitedRooms: new Set(["bedroom"]),
  lightsOn: false,
  doorLocked: true,
  dressed: false,
  fellOverChair: false,
  commodorePickedUp: false,
  gameWon: false,
  gameLost: false,
};

// Get DOM elements
const outputElement = document.getElementById("output") as HTMLDivElement;
const inputElement = document.getElementById("input") as HTMLInputElement;

// Output functions
function printLine(text: string, className: string = ""): void {
  const line = document.createElement("div");
  line.className = `output-line ${className}`;
  line.textContent = text;
  outputElement.appendChild(line);
  outputElement.scrollTop = outputElement.scrollHeight;
}

function printWelcome(): void {
  printLine("You wake up groggily. Your digital alarm clock");
  printLine("blinks 10:47 AM in angry red LEDs.");
  printLine("");
  printLine("'Ugh... what day is it?' you mumble. You ");
  printLine("remember it's the day before Christmas and");
  printLine("you still haven't all your gifts.");
  printLine("");
  printLine("You think: 'I will get them on Christmas");
  printLine("Eve ...'. You smile, but that won't solve");
  printLine("your problem today.");
  printLine("");
  printLine("Outside your door, you hear... something.");
  printLine("Whispers? Shuffling? Probably just your cat.");
  printLine("");
  printLine("─────────────────────────────────────────────");
  printLine("Commands: LOOK, GO [direction], TAKE [item],");
  printLine("          USE [item], INVENTORY, HELP");
  printLine("─────────────────────────────────────────────");
  printLine("");
  describeRoom();
}

function describeRoom(): void {
  const room = rooms[gameState.currentRoom];

  // Check for win/lose conditions
  if (gameState.gameWon || gameState.gameLost) {
    printLine("─────────────────────────────────────────────", "success");
    printLine(`📍 ${room.name}`, "success");
    printLine("─────────────────────────────────────────────", "success");
    printLine(room.description);
    printLine("");
    if (gameState.gameWon) {
      printLine("Type HELP!", "info");
    }
    return;
  }

  printLine("─────────────────────────────────────────────", "success");
  printLine(`📍 ${room.name}`, "success");
  printLine("─────────────────────────────────────────────", "success");

  // Show dark description if lights are off
  if (
    gameState.currentRoom === "bedroom" &&
    !gameState.lightsOn &&
    room.darkDescription
  ) {
    printLine(room.darkDescription);
  } else {
    printLine(room.description);

    if (room.items && room.items.length > 0) {
      printLine("");
      printLine(`You can see: ${room.items.join(", ")}`, "info");
    }
  }

  printLine("");
  if (!gameState.gameWon && !gameState.gameLost) {
    printLine(`Exits: ${Object.keys(room.exits).join(", ").toUpperCase()}`);
  }
  printLine("");
}

// Command handling
function handleCommand(command: string): void {
  const cmd = command.trim().toLowerCase();
  const parts = cmd.split(" ");
  const action = parts[0];
  const target = parts.slice(1).join(" ");

  switch (action) {
    case "look":
    case "l":
      handleLook(target);
      break;

    case "go":
    case "move":
      if (!target) {
        printLine("Go where? Try: GO NORTH", "error");
      } else {
        handleMove(target);
      }
      break;

    case "north":
    case "south":
    case "east":
    case "west":
      handleMove(action);
      break;

    case "take":
    case "get":
    case "pickup":
    case "pick":
      if (!target) {
        printLine("Take what?", "error");
      } else {
        handleTake(target);
      }
      break;

    case "inventory":
    case "inv":
    case "i":
      handleInventory();
      break;

    case "use":
    case "flip":
    case "turn":
    case "switch":
      if (!target) {
        printLine("Use what?", "error");
      } else {
        handleUse(target);
      }
      break;

    case "wear":
    case "put":
      if (
        target.includes("clothes") ||
        target.includes("shirt") ||
        target.includes("cloth")
      ) {
        handleUse("clothes");
      } else {
        printLine("Wear what?", "error");
      }
      break;

    case "unlock":
    case "open":
      if (target.includes("door")) {
        handleUse("key");
      } else {
        printLine(`You can't open that.`, "error");
      }
      break;

    case "help":
    case "?":
      printHelp();
      break;

    case "clear":
    case "cls":
      outputElement.innerHTML = "";
      describeRoom();
      break;

    case "":
      break;

    default:
      printLine(
        `I don't understand "${command}". Try HELP for available commands.`,
        "error"
      );
  }
}

function handleLook(target: string): void {
  if (!target) {
    describeRoom();
    return;
  }

  // Special examinations in the bedroom
  if (gameState.currentRoom === "bedroom") {
    if (!gameState.lightsOn) {
      printLine(
        "It's too dark to see anything specific. Maybe turn on the lights?",
        "error"
      );
      return;
    }

    if (
      target.includes("commodore") ||
      target.includes("c64") ||
      target.includes("computer")
    ) {
      printLine(
        "Your beloved Commodore 64! 64 whole kilobytes of RAM!",
        "info"
      );
      printLine("The beige beauty sits majestically on your desk.", "info");
      if (!gameState.commodorePickedUp) {
        printLine(
          "You might want to pick it up to see what's underneath...",
          "info"
        );
      }
    } else if (target.includes("desk")) {
      printLine(
        "Your cluttered desk. Home to your Commodore 64 and various floppy disks.",
        "info"
      );
      if (gameState.commodorePickedUp) {
        printLine("There's a key here now that you moved the C64!", "info");
      }
    } else if (target.includes("wardrobe") || target.includes("closet")) {
      printLine("Your wardrobe full of nerdy t-shirts.", "info");
      printLine("The classics. You should probably wear something.", "info");
      if (rooms.bedroom.items?.includes("clothes")) {
        printLine("You could TAKE CLOTHES from here.", "success");
      }
    } else if (target.includes("chair")) {
      if (gameState.fellOverChair) {
        printLine(
          "That treacherous chair that tripped you. It looks innocent now.",
          "info"
        );
      } else {
        printLine(
          "An office chair on wheels. Looks harmless... for now.",
          "info"
        );
      }
    } else if (target.includes("poster")) {
      printLine(
        "Your walls are covered in the finest 80s sci-fi cinema.",
        "info"
      );
      printLine("Tron. WarGames. The good stuff.", "info");
    } else {
      printLine("Nothing special about that.", "info");
    }
  } else {
    describeRoom();
  }
}

function handleMove(direction: string): void {
  const room = rooms[gameState.currentRoom];

  // Don't allow movement if game is over
  if (gameState.gameWon || gameState.gameLost) {
    printLine(
      "The game is over. Type CLEAR to restart or HELP to learn how to extend the game.",
      "info"
    );
    return;
  }

  // Special handling for going WEST to wardrobe
  if (gameState.currentRoom === "bedroom" && direction === "west") {
    if (!gameState.lightsOn) {
      printLine(
        "You bump into something soft. Probably the wardrobe. Turn on the lights!",
        "error"
      );
      return;
    }
    printLine(
      "You open the wardrobe. Ah, the smell of vintage cotton and nostalgia.",
      "info"
    );
    if (!rooms.bedroom.items?.includes("clothes")) {
      printLine("You already took your favorite outfit from here.", "info");
    } else {
      printLine("Your clothes are here. You should TAKE CLOTHES.", "success");
    }
    return;
  }

  // Special handling for trying to go south in the dark
  if (
    gameState.currentRoom === "bedroom" &&
    !gameState.lightsOn &&
    direction === "south"
  ) {
    if (!gameState.fellOverChair) {
      printLine("You stumble forward in the darkness...", "error");
      printLine("");
      printLine("*CRASH!* *CLATTER!* *BONK!*", "error");
      printLine("");
      printLine(
        "OW! You trip over your office chair and face-plant into the carpet!",
        "error"
      );
      printLine("The chair rolls away, squeaking mockingly.", "error");
      printLine("Maybe you should turn on the lights first, genius.", "error");
      gameState.fellOverChair = true;
    } else {
      printLine(
        "You carefully navigate around the chair this time.",
        "success"
      );
      printLine("Smart move. Still can't see anything though.", "info");
    }
    return;
  }

  // Special handling for going SOUTH to desk
  if (gameState.currentRoom === "bedroom" && direction === "south") {
    if (!gameState.lightsOn) {
      printLine("You can't see the desk in the dark!", "error");
      return;
    }
    printLine(
      "You approach your desk. Your Commodore 64 sits proudly upon it.",
      "info"
    );
    if (gameState.commodorePickedUp && rooms.bedroom.items?.includes("key")) {
      printLine("The KEY is here, revealed from under the C64!", "success");
    } else if (!gameState.commodorePickedUp) {
      printLine("Maybe you should examine or take the Commodore 64?", "info");
    }
    return;
  }

  // Check if trying to go north (to the door)
  if (direction === "north" && gameState.currentRoom === "bedroom") {
    if (gameState.doorLocked) {
      printLine("You try the door. It's locked from the outside!", "error");
      printLine("Why would someone lock you in?! Suspicious...", "info");
      return;
    }

    // Door is unlocked - check if dressed
    if (!gameState.dressed) {
      printLine("You open the door in your underwear...", "error");
      printLine("");
      gameState.currentRoom = "hallwayFail";
      gameState.gameLost = true;
      describeRoom();
      return;
    }

    // Victory condition!
    printLine("You unlock the door and swing it open...", "success");
    printLine("");
    gameState.currentRoom = "hallway";
    gameState.gameWon = true;
    describeRoom();
    return;
  }

  const nextRoom = room.exits[direction];

  if (nextRoom) {
    gameState.currentRoom = nextRoom;
    gameState.visitedRooms.add(nextRoom);
    printLine(`You go ${direction}...`, "success");
    printLine("");
    describeRoom();
  } else {
    printLine(`You can't go ${direction} from here.`, "error");
  }
}

function handleTake(itemName: string): void {
  const room = rooms[gameState.currentRoom];

  // Can't see in the dark
  if (gameState.currentRoom === "bedroom" && !gameState.lightsOn) {
    printLine(
      "It's too dark to find anything. Try turning on the lights!",
      "error"
    );
    return;
  }

  // Special case: picking up the Commodore 64
  if (
    (itemName.includes("commodore") ||
      itemName.includes("c64") ||
      itemName.includes("computer")) &&
    gameState.currentRoom === "bedroom" &&
    !gameState.commodorePickedUp
  ) {
    printLine("You carefully lift your precious Commodore 64...", "info");
    printLine(
      "It's heavier than it looks! Those 80s computers were built to last.",
      "info"
    );
    printLine("");
    printLine("Wait! There's something underneath it!", "success");
    printLine("A KEY! It was hiding under your C64 all along!", "success");
    printLine("");
    printLine("You set the computer back down gently.", "info");
    gameState.commodorePickedUp = true;
    rooms.bedroom.items = ["key"];
    return;
  }

  if (!room.items || room.items.length === 0) {
    printLine("There's nothing to take here.", "error");
    return;
  }

  const itemIndex = room.items.findIndex(
    (item) => item.toLowerCase() === itemName.toLowerCase()
  );

  if (itemIndex !== -1) {
    const item = room.items[itemIndex];
    room.items.splice(itemIndex, 1);
    gameState.inventory.push(item);
    printLine(`You take the ${item}.`, "success");

    if (item === "key") {
      printLine(
        "This must be the key to your door! But why was it under your C64?",
        "info"
      );
    } else if (item === "clothes") {
      printLine(
        "Your favorite Metallica t-shirt and jeans. A classic combo.",
        "info"
      );
    }
  } else {
    printLine(`There's no ${itemName} here.`, "error");
  }
}

function handleInventory(): void {
  if (gameState.inventory.length === 0) {
    printLine("Your inventory is empty.");
  } else {
    printLine("You are carrying:");
    gameState.inventory.forEach((item) => {
      printLine(`  - ${item}`, "info");
    });
  }
}

function handleUse(itemName: string): void {
  // Special case: light switch (not an inventory item)
  if (itemName.includes("light") || itemName.includes("switch")) {
    if (gameState.currentRoom === "bedroom") {
      if (!gameState.lightsOn) {
        printLine("*Click*", "success");
        printLine("");
        printLine(
          "The lights flicker on, revealing your glorious nerd kingdom!",
          "success"
        );
        gameState.lightsOn = true;
        printLine("");
        describeRoom();
      } else {
        printLine(
          "The lights are already on. You could turn them off, but why would you?",
          "info"
        );
      }
    } else {
      printLine("There's no light switch here.", "error");
    }
    return;
  }

  const hasItem = gameState.inventory.some(
    (item) => item.toLowerCase() === itemName.toLowerCase()
  );

  if (!hasItem) {
    printLine(`You don't have a ${itemName}.`, "error");
    return;
  }

  // Handle using items
  if (itemName === "key") {
    if (gameState.currentRoom === "bedroom") {
      if (gameState.doorLocked) {
        printLine("You unlock the bedroom door with the key!", "success");
        printLine("*Click* The lock turns smoothly.", "success");
        gameState.doorLocked = false;
      } else {
        printLine("The door is already unlocked.", "info");
      }
    } else {
      printLine("There's nothing to unlock here.", "error");
    }
  } else if (
    itemName === "clothes" ||
    itemName.includes("shirt") ||
    itemName.includes("cloth")
  ) {
    if (!gameState.dressed) {
      printLine(
        "You put on your clothes. Your Metallica t-shirt fits perfectly.",
        "success"
      );
      gameState.dressed = true;
      // Remove clothes from inventory once worn
      const index = gameState.inventory.findIndex((i) => i === "clothes");
      if (index !== -1) {
        gameState.inventory.splice(index, 1);
      }
    } else {
      printLine("You're already dressed. Looking good!", "info");
    }
  } else {
    printLine(`You're not sure how to use the ${itemName} here.`, "error");
  }
}

function printHelp(): void {
  printLine("═══════════════════════════════════════", "info");
  printLine("AVAILABLE COMMANDS:", "info");
  printLine("═══════════════════════════════════════", "info");
  printLine("  LOOK [item] - Examine surroundings or item");
  printLine("  GO [direction] - Move (NORTH, SOUTH, EAST, WEST)");
  printLine("  TAKE [item] - Pick up an item");
  printLine("  USE [item] - Use an item or interact");
  printLine("  WEAR [clothes] - Put on clothes");
  printLine("  UNLOCK [door] - Use key on door");
  printLine("  INVENTORY (INV, I) - Check your items");
  printLine("  HELP (?) - Show this message");
  printLine("  CLEAR (CLS) - Clear the screen");
  printLine("");
}

// Event listeners
inputElement.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    const command = inputElement.value;
    if (command.trim()) {
      printLine(command, "user-input");
      handleCommand(command);
    }
    inputElement.value = "";
  }
});

// Initialize game
printWelcome();
