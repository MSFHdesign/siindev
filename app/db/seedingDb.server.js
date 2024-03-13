import mongoose from "mongoose";
import bcrypt from "bcrypt";
let isSeeding = false;

export default async function seedDb() {
  if (isSeeding) {
    console.log("Seeding is already in progress.");
    return;
  }

  isSeeding = true;
  console.log("Starting seeding process...");

  try {
    const eventCount = await mongoose.models.Events.countDocuments();
    const userCount = await mongoose.models.User.countDocuments();

    if (eventCount === 0 && userCount === 0) {
      console.log("Seeding database...");
      // Start loading indicator
      process.stdout.write("Seeding in progress");

      await insertData();

      // Stop loading indicator and show completion message
      process.stdout.write(
        "\n Done seeding database, db is ready with no errors!\n ",
      );
    } else {
      console.log("Database already seeded.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    isSeeding = false;
  }
}

async function insertData() {
  const { adminId, dobId, raceId } = await insertUsers();
  await insertEvents(adminId, dobId, raceId);
  await distributeUsersToEvents();
}

async function insertUsers() {
  const adminPassword = await hashPassword("1");
  const userPassword = await hashPassword("1");
  const disabledPassword = await hashPassword("1");
  const superadminPassword = await hashPassword("1");

  const admin = await mongoose.models.User.create({
    email: "admin@admin.dk",
    password: adminPassword,
    role: "admin",
    personalInfo: {
      name: "Admin",
      age: 35,
      city: "Copenhagen",
    },
    registeredEvents: [],
    createdEvents: [],
  });

  await mongoose.models.User.create({
    email: "user@user.dk",
    password: userPassword,
    role: "user",
    personalInfo: {
      name: "Regular User",
      age: 28,
      city: "Aarhus",
    },
    registeredEvents: [],
  });

  await mongoose.models.User.create({
    email: "disabled@example.com",
    password: disabledPassword,
    role: "disabled",
    personalInfo: {
      name: "Disabled User",
      age: 40,
      city: "Odense",
    },
  });

  const dob = await mongoose.models.User.create({
    email: "dob@eaaa.dk",
    password: superadminPassword,
    role: "superadmin",
    personalInfo: {
      name: "Dan",
      age: 25,
      city: "Ry",
    },
  });

  const race = await mongoose.models.User.create({
    email: "race@eaaa.dk",
    password: superadminPassword,
    role: "superadmin",
    personalInfo: {
      name: "Rasmus",
      age: 25,
      city: "Ry",
    },
  });

  // bots
  for (let i = 0; i < 100; i++) {
    const userPassword = await hashPassword("password" + i);

    await mongoose.models.User.create({
      email: `user${i}@example.com`,
      password: userPassword,
      role: "user",
      personalInfo: {
        name: `User ${i}`,
        age: Math.floor(Math.random() * 50) + 18,
        city: `City ${i}`,
      },
      registeredEvents: [],
    });
  }

  return {
    adminId: admin._id,
    dobId: dob._id,
    raceId: race._id,
  };
}

async function insertEvents(adminId, dobId, raceId) {
  const { events, organizerIds } = generateRandomEvents(
    50,
    adminId,
    dobId,
    raceId,
  );
  const createdEvents = await mongoose.models.Events.insertMany(events); // Sikrer at dette matcher din modelnavn

  // Opdaterer brugere med de oprettede events
  organizerIds.forEach(async (organizerId, index) => {
    await mongoose.models.User.findByIdAndUpdate(organizerId, {
      $push: { createdEvents: createdEvents[index]._id },
    });
  });
}

function generateRandomEvents(numberOfEvents, adminId, dobId, raceId) {
  let events = [];
  let organizerIds = [];
  for (let i = 0; i < numberOfEvents; i++) {
    const eventType = getRandomEventType();
    const organizerId = getRandomOrganizer([adminId, dobId, raceId]);

    const { startDate, endDate } = getRandomDates();
    const randomNr = generateRandomImageUrl();
    events.push({
      title: getRandomTitle(eventType),
      description: getRandomDescription(eventType),
      type: eventType,
      location: {
        name: `${eventType} hall, nr: ${i}`,
        address: getRandomCity() + `gaden nr  ${randomNr}`,
        city: getRandomCity(),
        country: "Denmark",
      },
      startTime: startDate,
      endTime: endDate,
      organizer: organizerId,
      guests: [],
      capacity: getRandomCapacity(),
      price: getRandomPrice(),
      imageUrl: `https://picsum.photos/seed/${randomNr}/300/200`,
      registrationsCount: 0,
    });
    organizerIds.push(organizerId);
  }
  return { events, organizerIds };
}

async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

function getRandomOrganizer(organizers) {
  const randomIndex = Math.floor(Math.random() * organizers.length);
  return (
    // console.log("organizers: ", organizers[randomIndex]),
    organizers[randomIndex]
  );
}

function getRandomEventType() {
  const eventTypes = [
    "conference",
    "workshop",
    "networking",
    "social",
    "fundraiser",
    "webinar",
    "party",
    "concert",
    "sports",
    "educational",
  ];
  const randomIndex = Math.floor(Math.random() * eventTypes.length);
  return eventTypes[randomIndex];
}

function getRandomCity() {
  const city = [
    "København",
    "Århus",
    "Odense",
    "Aalborg",
    "Esbjerg",
    "Randers",
    "Kolding",
    "Horsens",
    "Vejle",
    "Roskilde",
    "Herning",
    "Helsingør",
    "Silkeborg",
    "Næstved",
    "Fredericia",
    "Viborg",
    "Køge",
    "Holstebro",
    "Taastrup",
    "Slagelse",
  ];
  const randomIndex = Math.floor(Math.random() * city.length);
  return city[randomIndex];
}

//description
function getRandomTitle(eventType) {
  const title = [
    `${eventType} for noobs`,
    `${eventType} for the cool kids`,
    `${eventType} for the music lovers`,
    `${eventType} event for the none-active people`,
    `Educational ${eventType} for the smart people`,
    `${eventType} for the business people`,
    `Workshop for the creative people`,
    `${eventType} for the social people`,
    `Social ${eventType} for the social people`,
    `Fundraiser ${eventType} for the good people`,
    `Party ${eventType} for the party people`,
    `Concert ${eventType} for the music lovers`,
    `Sports ${eventType} for the active people`,
    `${eventType} for coding ninjas`,
    `${eventType} for the caffeine addicts`,
    `Epic ${eventType} for the gamers`,
    `Chill ${eventType} for the laid-back folks`,
    `${eventType} for the adventure seekers`,
    `${eventType} for the meme lords`,
    `Interactive ${eventType} for the curious minds`,
    `Tech ${eventType} for the gadget geeks`,
    `Wholesome ${eventType} for the wholesome souls`,
    `Lavish ${eventType} for the fancy folks`,
    `${eventType} for the DIY enthusiasts`,
    `Zen ${eventType} for the zen masters`,
    `Gourmet ${eventType} for the foodies`,
    `Mystical ${eventType} for the mystic souls`,
  ];

  const randomIndex = Math.floor(Math.random() * title.length);
  return title[randomIndex];
}

function getRandomDescription(eventType) {
  const descriptions = [
    `Get ready to be blown away at this ${eventType}! Expect surprises around every corner. From thrilling activities to mind-boggling entertainment, this event is guaranteed to leave you speechless. Bring your sense of adventure and get ready for a day filled with laughter, excitement, and memories that will last a lifetime!`,
    `Join us for a wild ride at the ${eventType} extravaganza! You won't believe your eyes as you step into a world of wonder and excitement. With jaw-dropping performances, interactive exhibits, and delicious treats at every turn, this event is sure to be a hit with the whole family. Don't miss out on the fun – grab your tickets now!`,
    `Prepare for an adventure of a lifetime at our ${eventType}! It's going to be off the charts with non-stop action and thrills. From heart-pounding rides to pulse-pounding music, this event has something for everyone. So grab your friends, pack your bags, and get ready to make memories that will last a lifetime. See you there!`,
    `Calling all thrill-seekers! Our ${eventType} promises non-stop excitement and fun. Get ready to experience the adrenaline rush of a lifetime as you embark on a journey into the unknown. With thrilling rides, exhilarating games, and delicious food, this event is sure to be the highlight of your year. Don't miss out – buy your tickets now!`,
    `Embark on a journey to the unknown at our ${eventType}! You won't want to miss this epic experience filled with mystery, magic, and mayhem. From enchanting performances to mind-bending illusions, this event will leave you spellbound. So gather your friends and join us for a night of unforgettable fun!`,
    `Dive into the unknown depths of our ${eventType}! It's going to be a rollercoaster of emotions, with twists and turns at every corner. From heartwarming moments to side-splitting laughter, this event has it all. So grab your tickets now and get ready for the ride of your life!`,
    `Unleash your inner party animal at our legendary ${eventType}! Get ready to dance the night away as you groove to the hottest beats and coolest tunes. With delicious drinks, amazing food, and a lively atmosphere, this event is sure to be the talk of the town. So put on your dancing shoes and join us for a night you'll never forget!`,
    `Calling all wizards and witches! Our ${eventType} will cast a spell on you with its magic and wonder. Step into a world of enchantment as you explore spellbinding exhibits, magical creatures, and mystical wonders. With potions, spells, and fantastical adventures at every turn, this event is perfect for wizards of all ages. Don't miss out – get your tickets now!`,
    `Get ready to laugh, cry, and cheer at our ${eventType}! It's going to be a spectacle to remember, with heartwarming performances, hilarious comedians, and jaw-dropping stunts. Whether you're a fan of comedy, drama, or action, this event has something for everyone. So grab your popcorn and get ready for a night of entertainment like no other!`,
    `Join us for a night of madness and mayhem at our electrifying ${eventType}! It's going to be epic with mind-blowing performances, thrilling rides, and delicious food. Whether you're a thrill-seeker, foodie, or music lover, this event has something for everyone. So grab your friends and join us for a night you'll never forget!`,
    `Prepare to be amazed at our ${eventType}! It's going to be a mind-bending experience like no other, with mind-blowing illusions, jaw-dropping stunts, and heart-stopping thrills. Whether you're a fan of magic, mystery, or mayhem, this event is sure to leave you speechless. So grab your tickets now and get ready for a night of unforgettable fun!`,
    `Calling all superheroes! Our ${eventType} will test your powers and push you to the limit. Get ready to embark on an epic adventure filled with heroic deeds, daring rescues, and thrilling battles. With super-powered activities, heroic challenges, and larger-than-life exhibits, this event is perfect for superheroes of all ages. Don't miss out – buy your tickets now and unleash your inner hero!`,
    `Step into a world of fantasy and wonder at our enchanting ${eventType}! It's going to be pure magic with spellbinding performances, magical creatures, and mystical wonders. Whether you're a fan of wizards, witches, or mythical beasts, this event has something for everyone. So grab your wand and join us for a night of enchantment and adventure!`,
    `Get ready to rock and roll at our sensational ${eventType}! It's going to be a blast from start to finish with electrifying performances, toe-tapping tunes, and rockin' rhythms. Whether you're a fan of classic rock, pop, or indie, this event has something for everyone. So grab your air guitar and join us for a night of music and mayhem!`,
    `Calling all adventurers! Our ${eventType} will take you on a journey of discovery and excitement. Get ready to explore exotic lands, brave dangerous creatures, and uncover ancient treasures. Whether you're a fan of exploration, discovery, or adventure, this event is sure to satisfy your wanderlust. So grab your map and join us for a night of epic quests and thrilling adventures!`,
    `Prepare to be whisked away on a magical journey at our ${eventType}! From enchanting performances to mystical surprises, this event will transport you to a world of wonder and whimsy. So grab your wand and join us for a night of spellbinding entertainment!`,
    `Get ready for a night of laughs and lighthearted fun at our ${eventType}! With hilarious comedians, witty improv, and uproarious antics, this event is guaranteed to tickle your funny bone. So grab your friends and get ready to laugh until your sides ache!`,
    `Join us for an unforgettable evening of elegance and sophistication at our ${eventType}! From glamorous galas to opulent soirées, this event is the epitome of luxury. So slip into your finest attire and prepare to be dazzled by the glitz and glamour of the social event of the season!`,
    `Calling all adventure seekers! Our ${eventType} is an adrenaline-fueled thrill ride you won't want to miss. From daring stunts to extreme sports, this event is packed with excitement from start to finish. So buckle up and get ready for the adventure of a lifetime!`,
    `Prepare to be amazed at our ${eventType}! With mind-bending illusions, death-defying feats, and jaw-dropping spectacles, this event will leave you on the edge of your seat. So brace yourself for an evening of wonder and awe as we push the boundaries of what's possible!`,
    `Prepare to be whisked away on a magical journey at our ${eventType}! From enchanting performances to mystical surprises, this event will transport you to a world of wonder and whimsy. So grab your wand and join us for a night of spellbinding entertainment!`,
    `Get ready for a night of laughs and lighthearted fun at our ${eventType}! With hilarious comedians, witty improv, and uproarious antics, this event is guaranteed to tickle your funny bone. So grab your friends and get ready to laugh until your sides ache!`,
    `Join us for an unforgettable evening of elegance and sophistication at our ${eventType}! From glamorous galas to opulent soirées, this event is the epitome of luxury. So slip into your finest attire and prepare to be dazzled by the glitz and glamour of the social event of the season!`,
    `Calling all adventure seekers! Our ${eventType} is an adrenaline-fueled thrill ride you won't want to miss. From daring stunts to extreme sports, this event is packed with excitement from start to finish. So buckle up and get ready for the adventure of a lifetime!`,
    `Prepare to be amazed at our ${eventType}! With mind-bending illusions, death-defying feats, and jaw-dropping spectacles, this event will leave you on the edge of your seat. So brace yourself for an evening of wonder and awe as we push the boundaries of what's possible!`,
  ];
  const randomIndex = Math.floor(Math.random() * descriptions.length);
  return descriptions[randomIndex];
}

function getRandomCapacity() {
  return Math.floor(Math.random() * 200) + 20;
}

function getRandomPrice() {
  return Math.floor(Math.random() * 200) + 1;
}

function getRandomDates() {
  const start = new Date();
  const randomDays = Math.floor(Math.random() * 365) + 1;
  start.setDate(start.getDate() - randomDays);
  const end = new Date(start);
  end.setDate(start.getDate() + Math.floor(Math.random() * 30) + 1);
  return { startDate: start, endDate: end };
}

function generateRandomImageUrl() {
  return Math.floor(Math.random() * 10000000) + 1;
}

async function distributeUsersToEvents() {
  const events = await mongoose.models.Events.find();
  const users = await mongoose.models.User.find({ role: "user" });

  users.forEach(async (user) => {
    const randomEventIndex = Math.floor(Math.random() * events.length);
    const selectedEvent = events[randomEventIndex];

    // Tilføj bruger til event 'guests'
    await mongoose.models.Events.findByIdAndUpdate(selectedEvent._id, {
      $push: { guests: user._id },
      $inc: { registrationsCount: 1 },
    });

    // Opdater brugerens 'registeredEvents'
    await mongoose.models.User.findByIdAndUpdate(user._id, {
      $push: { registeredEvents: selectedEvent._id },
    });
  });
}

seedDb().catch(console.error);
