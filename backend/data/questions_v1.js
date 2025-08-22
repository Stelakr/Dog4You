// /backend/data/questions_v1.js
module.exports = [
  {
    text: "What is the preferred energy level in your dream dog?",
    trait: "energyLevel",
    category: "lifestyle",
    options: [
      { label: "Very low - lazy", value: 1 },
      { label: " Low - likes a walkie more", value: 2 },
      { label: "Moderate", value: 3 },
      { label: "High", value: 4 },
      { label: "Very high", value: 5 }
    ],
    order: 1
  },
  {
    text: "What vocal level is acceptable/ preferred in your home?",
    trait: "barkingLevel",
    category: "preferences",
    options: [
      { label: "Don't know how they sound", value: 1 },
      { label: "Quiet", value: 2 },
      { label: "Moderate", value: 3 },
      { label: "Vocal", value: 4 },
      { label: "Barks non stop - alerts everything", value: 5 }
    ],
    order: 2
  },
  {
    text: "How much shedding can you handle?",
    trait: "shedding",
    category: "preferences",
    options: [
      { label: "Very Low", value: 1 },
      { label: "Low", value: 2 },
      { label: "Moderate", value: 3 },
      { label: "High", value: 4 },
      { label: "Very High", value: 5 }
    ],
    order: 3
  },
  {
    text: "What is your preferred coat type?",
    trait: "coatType",
    category: "preferences",
    options: [
      { label: "Curly", value: "curly" },
      { label: "Smooth", value: "smooth" },
      { label: "Double", value: "double" },
      { label: "Wiry", value: "wiry" },
      { label: "Hairless", value: "hairless" },
      { label: "Wavy", value: "wavy" },
      { label: "Silky", value: "silky" },
      { label: "Corded", value: "corded" },
      { label: "Rough", value: "rough" },


    ],
    order: 4
  },
  {
    text: "What is your preferred coat length?",
    trait: "coatLength",
    category: "preferences",
    options: [
      { label: "Short", value: "short" },
      { label: "Medium", value: "medium" },
      { label: "Long", value: "long" }
    ],
    order: 5
  },
  {
    text: "I'd love a dog suited to:",
    trait: "livingEnvironment",
    category: "constraints",
    options: [
      { label: "Urban", value: "urban" },
      { label: "Suburban", value: "suburban" },
      { label: "Rural", value: "rural" }
    ],
    order: 6
  },
  {
    text: "How important is being good with children to you? *If you have kids - do not choose below 4",
    trait: "goodWithKids",
    category: "lifestyle",
    options: [
      { label: "Very Low", value: 1 },
      { label: "Low", value: 2 },
      { label: "OK", value: 3 },
      { label: "Good", value: 4 },
      { label: "Excellent", value: 5 }
    ],
    order: 7
  },
  {
    text: "How important is it for you that your dog gets along with other dogs?",
    trait: "goodWithOtherDogs",
    category: "lifestyle",
    options: [
      { label: "Very Low", value: 1 },
      { label: "Low", value: 2 },
      { label: "OK", value: 3 },
      { label: "Good", value: 4 },
      { label: "Excellent", value: 5 }
    ],
    order: 8
  },
  {
    text: "How quickly do you want your dog to pickup commands?",
    trait: "trainability",
    category: "lifestyle",
    options: [
      { label: "Very Low", value: 1 },
      { label: "Low", value: 2 },
      { label: "Moderate", value: 3 },
      { label: "High", value: 4 },
      { label: "Very High", value: 5 }
    ],
    order: 9
  },
  {
    text: "What is you preferred size range?",
    trait: "sizeCategory",
    category: "preferences",
    options: [
      { label: "Small", value: "small" },
      { label: "Medium", value: "medium" },
      { label: "Large", value: "large" }
    ],
    order: 10
  },
  {
    text: "What is the drooling level you're willing to accept?",
    trait: "droolingLevel",
    category: "preferences",
    options: [
      { label: "Minimal", value: 1 },
      { label: "Low", value: 2 },
      { label: "Moderate", value: 3 },
      { label: "High", value: 4 },
      { label: "Very High", value: 5 }
    ],
    order: 11
  },
  {
    text: "How playful should your dog be?",
    trait: "playfulnessLevel",
    category: "preferences",
    options: [
      { label: "Very Low", value: 1 },
      { label: "Low", value: 2 },
      { label: "Moderate", value: 3 },
      { label: "High", value: 4 },
      { label: "Very High", value: 5 }
    ],
    order: 12
  },
  {
    text: "How adaptable to changes is your dog supposed to be?",
    trait: "adaptabilityLevel",
    category: "lifestyle",
    options: [
      { label: "Very Low", value: 1 },
      { label: "Low", value: 2 },
      { label: "Moderate", value: 3 },
      { label: "High", value: 4 },
      { label: "Very High", value: 5 }
    ],
    order: 13
  },
  {
    text: "How open to strangers should your dog be?",
    trait: "opennessToStrangers",
    category: "preferences",
    options: [
      { label: "Very Reserved", value: 1 },
      { label: "Reserved", value: 2 },
      { label: "Neutral", value: 3 },
      { label: "Friendly", value: 4 },
      { label: "Very Friendly", value: 5 }
    ],
    order: 14
  },
  {
    text: "How protective should your dog be?",
    trait: "protectiveNature",
    category: "preferences",
    options: [
      { label: "Not Protective", value: 1 },
      { label: "Slightly", value: 2 },
      { label: "Moderate", value: 3 },
      { label: "High", value: 4 },
      { label: "Very High", value: 5 }
    ],
    order: 15
  },
  {
    text: "How affectionate with family should your dog be?",
    trait: "affectionateWithFamily",
    category: "preferences",
    options: [
      { label: "Low", value: 1 },
      { label: "Somewhat", value: 2 },
      { label: "Moderate", value: 3 },
      { label: "High", value: 4 },
      { label: "Very High", value: 5 }
    ],
    order: 16
  }
];
