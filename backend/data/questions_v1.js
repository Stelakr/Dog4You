module.exports = [
    {
        text: "What is the preferred energy level in your dream dog?",
        trait: "energyLevel",
        category: "lifestyle",
        options: [
            { label: "Very low - lazy like you", value: 1 },
            { label: " Low - likes a walkie more", value: 2 },
            { label: "Moderate", value: 3 },
            { label: "High-daily loong walks", value: 4 },
            { label: "Very high", value: 5}
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
        text: "Preferred coat type?",
        trait: "coatType",
        category: "preferences",
        options: [
        { label: "Curly", value: "curly" },
        { label: "Smooth", value: "smooth" },
        { label: "Double", value: "double" },
        { label: "Wire", value: "wire" },
        { label: "Hairless", value: "hairless" }
        ],
        order: 4
    },
    {
        text: "Preferred coat length?",
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
        text: "I need a dog suited to:",
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
        text: "How important is being good with children to you?",
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
        text: "How important is getting along with other dogs?",
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
        text: "How much structure for training do you enjoy providing?",
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
        text: "Preferred size range?",
        trait: "sizeCategory",
        category: "preferences",
        options: [
        { label: "Small", value: "small" },
        { label: "Medium", value: "medium" },
        { label: "Large", value: "large" }
        ],
        order: 10
    }
];