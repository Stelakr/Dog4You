// /backend/data/breeds.js
/*  {
    name: '',
    height: { min: , max:  }, 
    weight: { min: , max:  },
    lifeExpectancy: { min: , max:  },

    affectionateWithFamily: ,
    goodWithKids: ,
    goodWithOtherDogs: ,
    droolingLevel: ,
    opennessToStrangers: ,
    barkingLevel: ,
    shedding: ,
    protectiveNature: ,
    playfulnessLevel: ,
    adaptabilityLevel: ,
    energyLevel: ,
    trainability: ,

    groomingFrequency: { value: , unit: '' },
    coatType: '',
    coatLength: ['', ''],
    livingEnvironment: ['', '', ''],

    imageUrl:'',

    commonHealthIssues: [
      { name: '', prevalence: 3 },
      { name: '', prevalence: 3 }
    ]
  }, */
module.exports = [
  {
    name: 'Affenpinscher',
    height: { min: 9, max: 12 }, 
    weight: { min: 7, max: 10 },
    lifeExpectancy: { min: 12, max: 15 },

    affectionateWithFamily: 3,
    goodWithKids: 3,
    goodWithOtherDogs: 3,
    droolingLevel: 1,
    opennessToStrangers: 5,
    barkingLevel: 3,
    shedding: 3,
    protectiveNature: 3,
    playfulnessLevel: 3,
    adaptabilityLevel: 4,
    energyLevel: 3,
    trainability: 3,

    groomingFrequency: { value: 3, unit: 'month' },
    coatType: 'wiry',
    coatLength: ['short', 'medium'],
    livingEnvironment: ['urban', 'suburban', 'rural'],

    imageUrl:'',

    commonHealthIssues: [
      { name: 'Brachycephalic Airway Syndrome', prevalence: 3 },
      { name: 'Patellar luxation', prevalence: 3 },
      { name: 'Hip Dysplasia', prevalence: 3 }
    ]
  },
  {
    name: 'Afghan Hound',
    height: { min: 25, max: 27 },
    weight: { min: 50, max: 60 },
    lifeExpectancy: { min: 12, max: 18 },

    affectionateWithFamily: 3,
    goodWithKids: 3,
    goodWithOtherDogs: 3,
    droolingLevel: 1,
    opennessToStrangers: 3,
    barkingLevel: 3,
    shedding: 1,
    protectiveNature: 3,
    playfulnessLevel: 3,
    adaptabilityLevel: 3,
    energyLevel: 4,
    trainability: 1,

    groomingFrequency: { value: 3, unit: 'week' },
    coatType: 'silky',
    coatLength: 'long',
    livingEnvironment: ['urban', 'suburban', 'rural'],
    imageUrl:'',

    commonHealthIssues: [
      { name: 'Chylothorax', prevalence: 3 },
      { name: 'Gastric Dilation and Volvulus', prevalence: 3 }
    ]
  },

  {
    name: 'Airedale Terrier',
    height: { min: 22, max: 24 },
    weight: { min: 50, max: 70 },
    lifeExpectancy: { min: 11, max: 14 },

    affectionateWithFamily: 3,
    goodWithKids: 3,
    goodWithOtherDogs: 3,
    droolingLevel: 1,
    opennessToStrangers: 3,
    barkingLevel: 3,
    shedding: 1,
    protectiveNature: 5,
    playfulnessLevel: 3,
    adaptabilityLevel: 3,
    energyLevel: 3,
    trainability: 3,

    groomingFrequency: { value: 2, unit: 'week' },
    coatType: 'wiry',
    coatLength:'short',
    livingEnvironment: ['urban', 'suburban', 'rural'],

    imageUrl:'',

    commonHealthIssues: [
      { name: 'Hip Dysplasia', prevalence: 4 },
      { name: 'Bloat', prevalence: 3 }
    ]
  },

  {
    name: 'Akita',
    height: { min: 24, max: 28 },
    weight: { min: 70, max: 130 },
    lifeExpectancy: { min: 10, max: 14 },

    affectionateWithFamily: 3,
    goodWithKids: 3,
    goodWithOtherDogs: 1,
    droolingLevel: 1,
    opennessToStrangers: 2,
    barkingLevel: 2,
    shedding: 3,
    protectiveNature: 5,
    playfulnessLevel: 3,
    adaptabilityLevel: 3,
    energyLevel: 4,
    trainability: 3,

    groomingFrequency: { value: 2, unit: 'week' },
    coatType: 'double',
    coatLength: 'medium',
    livingEnvironment: ['urban', 'suburban', 'rural'],

    imageUrl:'', 
    //WORKING

    commonHealthIssues: [
      { name: 'Hip Dysplasia', prevalence: 3 },
      { name: 'Hypothyroidism', prevalence: 4 }, 
      { name: 'Sebaceous Adenitis', prevalence: 5 }
    ]
  },

  {
    name: 'Alaskan Malamute',
    height: { min: 23, max: 25 },
    weight: { min: 75, max: 85 },
    lifeExpectancy: { min: 10, max: 14 },

    affectionateWithFamily: 3,
    goodWithKids: 3,
    goodWithOtherDogs: 3,
    droolingLevel: 1,
    opennessToStrangers: 3,
    barkingLevel: 3,
    shedding: 3,
    protectiveNature: 4,
    playfulnessLevel: 3,
    adaptabilityLevel: 3,
    energyLevel: 4,
    trainability: 5,

    groomingFrequency: { value: 2, unit: 'week' },
    coatType: 'double',
    coatLength: 'medium',
    livingEnvironment: ['urban', 'suburban'],

    
     imageUrl:'',

    commonHealthIssues: [
      { name: 'Elbow Dysplasia', prevalence: 4 },
      { name: 'Hip Dysplasia', prevalence: 4 },
      { name: 'Cataracts', prevalence: 3 }
    ]
  },
  {
    name: 'American Bulldog',
    height: { min: 20, max: 25 },
    weight: { min: 60, max: 100 },
    lifeExpectancy: { min: 10, max: 12 },

    affectionateWithFamily: 2,
    goodWithKids: 2,
    goodWithOtherDogs: 3,
    droolingLevel: 2,
    opennessToStrangers: 1,
    barkingLevel: 4,
    shedding: 2,
    protectiveNature: 4,
    playfulnessLevel: 1,
    adaptabilityLevel: 1,
    energyLevel: 4,
    trainability: 4,

    groomingFrequency: { value: 2, unit: 'month' },
    coatType: 'smooth',
    coatLength: 'short',
    livingEnvironment: ['suburban', 'rural'],

    commonHealthIssues: [
      { name: 'Hip Dysplasia', prevalence: 4 },
      { name: 'Elbow Dysplasia', prevalence: 3 },
      { name: 'Allergies ', prevalence: 4 }
    ]
  },
  {
    name: 'American Eskimo Dog',
    height: { min: 9, max: 19 },
    weight: { min: 6, max: 35 },
    lifeExpectancy: { min: 13, max: 15 },

    affectionateWithFamily: 5,
    goodWithKids: 5,
    goodWithOtherDogs: 3,
    droolingLevel: 1,
    opennessToStrangers: 5,
    barkingLevel: 3,
    shedding: 3,
    protectiveNature: 3,
    playfulnessLevel: 3,
    adaptabilityLevel: 4,
    energyLevel: 4,
    trainability: 4,

    groomingFrequency: { value: 2, unit: 'week' },
    coatType: 'double',
    coatLength: 'medium',
    livingEnvironment: ['urban', 'suburban'],

    imageUrl:'',

    commonHealthIssues: [
      { name: 'Progressive Retinal Atrophy', prevalence: 3 },
      { name: 'Dental Disease', prevalence: 4 }
    ]
  },
  {
    name: 'American Foxhound',
    height: { min: 21, max: 25 },
    weight: { min: 60, max: 70 },
    lifeExpectancy: { min: 11, max: 13 },

    affectionateWithFamily: 3,
    goodWithKids: 5,
    goodWithOtherDogs: 5,
    droolingLevel: 1,
    opennessToStrangers: 3,
    barkingLevel: 5,
    shedding: 3,
    protectiveNature: 3,
    playfulnessLevel: 3,
    adaptabilityLevel: 3,
    energyLevel: 4,
    trainability: 3,

    groomingFrequency: { value: 2, unit: 'month' },
    coatType: 'smooth',
    coatLength: 'short',
    livingEnvironment: ['urban', 'suburban', 'rural'],

    commonHealthIssues: [
      { name: 'Hip Dysplasia', prevalence: 4 },
      { name: 'Thrombocytopathy', prevalence: 3 }
    ]
  },
  {
    name: 'American Hairless Terrier',
    height: { min: 12, max: 16 },
    weight: { min: 12, max: 28 },
    lifeExpectancy: { min: 14, max: 16 },

    affectionateWithFamily: 5,
    goodWithKids: 5,
    goodWithOtherDogs: 3,
    droolingLevel: 1,
    opennessToStrangers: 3,
    barkingLevel: 3,
    shedding: 1,
    protectiveNature: 3,
    playfulnessLevel: 3,    
    adaptabilityLevel: 5,
    energyLevel: 3,
    trainability: 5,

    groomingFrequency: { value: 1, unit: 'month' },
    coatType: 'hairless',
    coatLength: 'short',
    livingEnvironment: ['urban', 'suburban', 'rural'],

    commonHealthIssues: [
      { name: 'Patella Luxation', prevalence: 3 },
      { name: 'Heart Disease', prevalence: 3 }
    ]
  },
  {
    name: 'American Staffordshire Terrier',
    height: { min: 17, max: 19 },
    weight: { min: 40, max: 70 },
    lifeExpectancy: { min: 12, max: 16 },

    affectionateWithFamily: 5,
    goodWithKids: 3,
    goodWithOtherDogs: 3,
    droolingLevel: 1,
    opennessToStrangers: 4,
    barkingLevel: 3,
    shedding: 2,
    protectiveNature: 5,
    playfulnessLevel: 3,    
    adaptabilityLevel: 3,
    energyLevel: 3,
    trainability: 3,

    groomingFrequency: { value: 1, unit: 'month' },
    coatType: 'smooth',
    coatLength: 'short',
    livingEnvironment: ['urban', 'suburban', 'rural'],

    imageUrl:'',

    commonHealthIssues: [
      { name: 'Hip Dysplasia', prevalence: 4 },
      { name: 'Elbow Dysplasia', prevalence: 3 },
      { name: 'Progressive Retinal Atrophy (PRA)', prevalence: 2 }
    ]
  },
  {
    name: 'American Water Spaniel',
    height: { min: 15, max: 18 }, 
    weight: { min: 25 , max: 45 },
    lifeExpectancy: { min: 10, max: 14 },

    affectionateWithFamily: 3,
    goodWithKids: 3,
    goodWithOtherDogs: 3,
    droolingLevel: 1,
    opennessToStrangers: 3,
    barkingLevel: 3,
    shedding: 1,
    protectiveNature: 3,
    playfulnessLevel: 3,
    adaptabilityLevel: 3,
    energyLevel: 3,
    trainability: 5,

    groomingFrequency: { value: 1, unit: 'week' },
    coatType: ['double','curly'],
    coatLength: ['medium'],
    livingEnvironment: ['rural', 'suburban'],

    imageUrl:'',

    commonHealthIssues: [
      { name: 'Hip Dysplasia', prevalence: 2 },
      { name: 'Degenerative Myelopathy', prevalence: 2 }
    ]
  },
  {
    name: 'Anatolian Shepherd Dog',
    height: { min: 27, max: 29 }, 
    weight: { min: 80, max: 150 },
    lifeExpectancy: { min: 11, max: 13 },

    affectionateWithFamily: 1,
    goodWithKids: 3,
    goodWithOtherDogs: 3,
    droolingLevel: 1,
    opennessToStrangers: 1,
    barkingLevel: 3,
    shedding: 3,
    protectiveNature: 5,
    playfulnessLevel: 3,
    adaptabilityLevel: 3,
    energyLevel: 3,
    trainability: 2,

    groomingFrequency: { value: 2, unit: 'month' },
    coatType: 'smooth',
    coatLength: ['short'],
    livingEnvironment: ['rural', 'suburban'],

    imageUrl:'',

    commonHealthIssues: [
      { name: 'Entropion', prevalence: 4 },
      { name: 'Sensitivity to Anesthesia', prevalence: 1 },
      { name: 'Gastric Dilatation and Volvulus', prevalence: 4 }
    ]
  },
  {
    name: 'Appenzeller Sennenhund',
    height: { min: 20, max: 22 }, 
    weight: { min: 48, max: 70 },
    lifeExpectancy: { min: 13, max: 15 },

    affectionateWithFamily: 5,
    goodWithKids: 3,
    goodWithOtherDogs: 5,
    droolingLevel: 3,
    opennessToStrangers: 1,
    barkingLevel: 5,
    shedding: 3,
    protectiveNature: 5,
    playfulnessLevel: 3,
    adaptabilityLevel: 5,
    energyLevel: 5,
    trainability: 5,

    groomingFrequency: { value: 1, unit: 'week' },
    coatType: ['smooth', 'double'],
    coatLength: ['short',],
    livingEnvironment: ['rural', 'suburban'],

    imageUrl:'',

    commonHealthIssues: [
      { name: '', prevalence: 3 },
      { name: '', prevalence: 3 }
    ]
  },
  {
    name: 'Australian Cattle Dog',
    height: { min: 17, max: 20 }, 
    weight: { min: 35, max: 50 },
    lifeExpectancy: { min: 12, max: 16 },

    affectionateWithFamily: 3,
    goodWithKids: 3,
    goodWithOtherDogs: 3,
    droolingLevel: 1,
    opennessToStrangers: 3,
    barkingLevel: 1,
    shedding: 3,
    protectiveNature: 4,
    playfulnessLevel: 3,
    adaptabilityLevel: 3,
    energyLevel: 5,
    trainability: 4,

    groomingFrequency: { value: 1, unit: 'month' },
    coatType: ['smooth', 'double'],
    coatLength: ['short'],
    livingEnvironment: ['rural', 'suburban'],

    imageUrl:'',

    commonHealthIssues: [
      { name: 'Eye Issues', prevalence: 3 },
      { name: 'Deafness', prevalence: 3 }
    ]
  },
  {
    name: 'Australian Kelpie',
    height: { min: 17, max: 20 }, 
    weight: { min: 35, max: 50 },
    lifeExpectancy: { min: 10, max: 13 },

    affectionateWithFamily: 3,
    goodWithKids: 3,
    goodWithOtherDogs: 3,
    droolingLevel: 1,
    opennessToStrangers: 3,
    barkingLevel: 1,
    shedding: 3,
    protectiveNature: 4,
    playfulnessLevel: 3,
    adaptabilityLevel: 3,
    energyLevel: 5,
    trainability: 4,

    groomingFrequency: { value: 1, unit: 'month' },
    coatType: ['smooth', 'double'],
    coatLength: ['short'],
    livingEnvironment: ['rural', 'suburban'],

    imageUrl:'',

    commonHealthIssues: [
      { name: 'Hip Dysplasia', prevalence: 4 },
      { name: 'Luxating Patella', prevalence: 3 }
    ]
  },
  {
    name: 'Australian Shepherd',
    height: { min: 18, max: 23 }, 
    weight: { min: 40, max: 65 },
    lifeExpectancy: { min: 12, max: 25 },

    affectionateWithFamily: 3,
    goodWithKids: 5,
    goodWithOtherDogs: 3,
    droolingLevel: 1,
    opennessToStrangers: 3,
    barkingLevel: 3,
    shedding: 3,
    protectiveNature: 3,
    playfulnessLevel: 4,
    adaptabilityLevel: 3,
    energyLevel: 5,
    trainability: 5,

    groomingFrequency: { value: 2, unit: 'month' },
    coatType: 'double',
    coatLength: ['medium'],
    livingEnvironment: ['rural', 'suburban',],

    imageUrl:'',

    commonHealthIssues: [
      { name: 'Hip and Elbow Dysplasia', prevalence: 4 },
      { name: 'Progressive Retinal Atrophy', prevalence: 2 }
    ]
  },
  {
    name: 'Australian Terrier',
    height: { min: 10, max: 11 }, 
    weight: { min: 15, max: 20 },
    lifeExpectancy: { min: 11, max: 15 },

    affectionateWithFamily: 4,
    goodWithKids: 5,
    goodWithOtherDogs: 3,
    droolingLevel: 1,
    opennessToStrangers: 3,
    barkingLevel: 3,
    shedding: 1,
    protectiveNature: 4,
    playfulnessLevel: 3,
    adaptabilityLevel: 4,
    energyLevel: 3,
    trainability: 4,

    groomingFrequency: { value: 3, unit: 'month' },
    coatType: ['rough', 'double'],
    coatLength: ['medium'],
    livingEnvironment: ['urban', 'suburban'],

    imageUrl:'',

    commonHealthIssues: [
      { name: 'Luxating Patella', prevalence: 3 },
      { name: 'Legg-Calve-Perthes Disease', prevalence: 2 }
    ]
  },
  {
    name: 'Azawakh',
    height: { min: 23.5, max: 29 }, 
    weight: { min: 33, max: 55 },
    lifeExpectancy: { min: 12, max: 15 },

    affectionateWithFamily: 3,
    goodWithKids: 3,
    goodWithOtherDogs: 3,
    droolingLevel: 1,
    opennessToStrangers: 1,
    barkingLevel: 1,
    shedding: 2,
    protectiveNature: 3,
    playfulnessLevel: 3,
    adaptabilityLevel: 3,
    energyLevel: 3,
    trainability: 2,

    groomingFrequency: { value: 2, unit: 'month' },
    coatType: ['smooth'],
    coatLength: ['short'],
    livingEnvironment: ['urban', 'suburban'],

    imageUrl:'',

    commonHealthIssues: [
      { name: 'Hypothyroidism', prevalence: 4 },
      { name: 'Masticatory Muscle Myositis', prevalence: 3 }
    ]
  },
  {
    name: 'Barbado da Terceira',
    height: { min: 19, max: 22 }, 
    weight: { min: 46, max: 60 },
    lifeExpectancy: { min: 12, max: 14 },

    affectionateWithFamily: 5,
    goodWithKids: 3,
    goodWithOtherDogs: 3,
    droolingLevel: 1,
    opennessToStrangers: 1,
    barkingLevel: 1,
    shedding: 1,
    protectiveNature: 5,
    playfulnessLevel: 5,
    adaptabilityLevel: 5,
    energyLevel: 5,
    trainability: 5,

    groomingFrequency: { value: 1, unit: 'week' },
    coatType: ['double', 'wavy'],
    coatLength: ['medium'],
    livingEnvironment: ['urban', 'suburban', 'rural'],

    imageUrl:'',

    commonHealthIssues: [
      { name: '', prevalence:  3 },
      { name: '', prevalence:  3 }
    ]
  },
  {
    name: 'Barbet',
    height: { min: 19, max: 24.5 }, 
    weight: { min: 35, max: 65 },
    lifeExpectancy: { min: 12, max: 14 },

    affectionateWithFamily: 4,
    goodWithKids: 3,
    goodWithOtherDogs: 3,
    droolingLevel: 1,
    opennessToStrangers: 3,
    barkingLevel: 3,
    shedding: 1,
    protectiveNature: 3,
    playfulnessLevel: 3,
    adaptabilityLevel: 3,
    energyLevel: 3,
    trainability: 4,

    groomingFrequency: { value: 5, unit: 'week' },
    coatType: ['curly', 'wavy'],
    coatLength: ['medium', 'long'],
    livingEnvironment: ['rural', 'urban', 'suburban'],

    imageUrl:'',

    commonHealthIssues: [
      { name: 'Hip Dysplasia', prevalence: 3 },
      { name: 'Progressive Retinal Atrophy (PRA)', prevalence: 2 },
      { name: 'Ear Infections', prevalence: 4 }


    ]
  },
  {
    name: 'Basenji',
    height: { min: 16, max: 17 }, 
    weight: { min: 22, max: 24 },
    lifeExpectancy: { min: 13, max: 14 },

    affectionateWithFamily: 3,
    goodWithKids: 3,
    goodWithOtherDogs: 3,
    droolingLevel: 1,
    opennessToStrangers: 3,
    barkingLevel: 1,
    shedding: 2,
    protectiveNature: 3,
    playfulnessLevel: 3,
    adaptabilityLevel: 3,
    energyLevel: 4,
    trainability: 2,

    groomingFrequency: { value: 1, unit: 'month' },
    coatType: ['smooth'],
    coatLength: ['short'],
    livingEnvironment: ['urban', 'suburban', 'rural'],

    imageUrl:'',

    commonHealthIssues: [
      { name: 'Hypothyroidism', prevalence: 4 },
      { name: 'Fanconi Syndrome', prevalence: 3 }
    ]
  },
  {
    name: 'Basset Hound',
    height: { min: 10, max: 15 }, 
    weight: { min: 40, max: 65 },
    lifeExpectancy: { min: 12, max: 13 },

    affectionateWithFamily: 3,
    goodWithKids: 5,
    goodWithOtherDogs: 5,
    droolingLevel: 4,
    opennessToStrangers: 3,
    barkingLevel: 4,
    shedding: 2,
    protectiveNature: 3,
    playfulnessLevel: 3,
    adaptabilityLevel: 3,
    energyLevel: 2,
    trainability: 3,

    groomingFrequency: { value: 2, unit: 'week' },
    coatType: ['smooth'],
    coatLength: ['short'],
    livingEnvironment: ['urban', 'suburban', 'rural'],

    imageUrl:'',

    commonHealthIssues: [
      { name: 'Skin and Ear Problems', prevalence: 4 },
      { name: 'Hip and Elbow Dysplasia', prevalence: 3 }
    ]
  },
  {
    name: 'Beagle',
    height: { min: 10, max: 15 }, 
    weight: { min: 15, max: 30 },
    lifeExpectancy: { min: 10, max: 15 },

    affectionateWithFamily: 3,
    goodWithKids: 5,
    goodWithOtherDogs: 5,
    droolingLevel: 1,
    opennessToStrangers: 3,
    barkingLevel: 4,
    shedding: 3,
    protectiveNature: 2,
    playfulnessLevel: 4,
    adaptabilityLevel: 4,
    energyLevel: 4,
    trainability: 3,

    groomingFrequency: { value: 2, unit: 'month' },
    coatType: ['smooth'],
    coatLength: ['short'],
    livingEnvironment: ['rural', 'suburban', 'urban'],

    imageUrl:'',

    commonHealthIssues: [
      { name: 'Ear Infections', prevalence: 4 },
      { name: 'Obesity', prevalence: 3 }
    ]
  },
  {
    name: 'Bearded Collie',
    height: { min: 20, max: 22 }, 
    weight: { min: 45, max: 55 },
    lifeExpectancy: { min: 12, max: 14 },

    affectionateWithFamily: 4,
    goodWithKids: 5,
    goodWithOtherDogs: 5,
    droolingLevel: 1,
    opennessToStrangers: 4,
    barkingLevel: 5,
    shedding: 3,
    protectiveNature: 3,
    playfulnessLevel: 4,
    adaptabilityLevel: 4,
    energyLevel: 4,
    trainability: 3,

    groomingFrequency: { value: 3, unit: 'week' },
    coatType: ['silky'],
    coatLength: ['long'],
    livingEnvironment: ['urban', 'rural', 'suburban'],

    imageUrl:'',

    commonHealthIssues: [
      { name: 'Hip Dysplasia', prevalence: 2 },
      { name: 'Addison’s Disease', prevalence: 3 }
    ]
  },


//Prvi dio pasmina 3 za testiranje - provjeri jesu dobre
  {
    name: 'Golden Retriever',
    height: { min: 55, max: 61 },
    weight: { min: 25, max: 34 },
    lifeExpectancy: { min: 10, max: 12 },

    affectionateWithFamily: 5,
    goodWithKids: 5,
    goodWithOtherDogs: 5,
    droolingLevel: 2,
    opennessToStrangers: 5,
    barkingLevel: 3,
    shedding: 5,
    protectiveNature: 2,
    playfulnessLevel: 5,
    adaptabilityLevel: 4,
    energyLevel: 4,
    trainability: 5,

    groomingFrequency: { value: 2, unit: 'week' },
    coatType: 'double',
    coatLength: 'medium',
    livingEnvironment: ['urban', 'suburban', 'rural'],

    commonHealthIssues: [
      { name: 'Cancer (various)', prevalence: 4 },
      { name: 'Hip Dysplasia', prevalence: 3 }
    ]
  },

  {
    name: 'Poodle',
    height: { min: 45, max: 60 },
    weight: { min: 18, max: 32 },
    lifeExpectancy: { min: 12, max: 15 },

    affectionateWithFamily: 5,
    goodWithKids: 4,
    goodWithOtherDogs: 4,
    droolingLevel: 1,
    opennessToStrangers: 4,
    barkingLevel: 4,
    shedding: 1,
    protectiveNature: 2,
    playfulnessLevel: 4,
    adaptabilityLevel: 5,
    energyLevel: 3,
    trainability: 5,

    groomingFrequency: { value: 4, unit: 'week' },
    coatType: 'curly',
    coatLength: 'medium',
    livingEnvironment: ['urban', 'suburban'],

    commonHealthIssues: [
      { name: 'Addison’s Disease', prevalence: 2 },
      { name: 'Hip Dysplasia', prevalence: 3 }
    ]
  },

  {
    name: 'Border Collie',
    height: { min: 46, max: 56 },
    weight: { min: 14, max: 20 },
    lifeExpectancy: { min: 12, max: 15 },

    affectionateWithFamily: 4,
    goodWithKids: 4,
    goodWithOtherDogs: 3,
    droolingLevel: 1,
    opennessToStrangers: 3,
    barkingLevel: 4,
    shedding: 4,
    protectiveNature: 3,
    playfulnessLevel: 5,
    adaptabilityLevel: 3,
    energyLevel: 5,
    trainability: 5,

    groomingFrequency: { value: 1, unit: 'week' },
    coatType: 'double',
    coatLength: 'medium',
    livingEnvironment: ['suburban', 'rural'],

    commonHealthIssues: [
      { name: 'CEA (Collie Eye Anomaly)', prevalence: 3 },
      { name: 'Epilepsy', prevalence: 3 }
    ]
  }
];
