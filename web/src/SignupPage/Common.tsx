import {IParticipantSignup} from "./ParticipantSignupPage";

export const invalidTextT = {
  de: 'Die Angabe dieses Felds ist erforderlich',
  en: 'This field is required',
};

export const errorMessages = {
  "auth/too-many-requests": {
    de: "Du hast diese Aktion zu oft hintereinander ausgeführt - bitte kurz warten und es erneut versuchen (sorry, dies ist eine Beschränkung durch unseren Provider).",
    en: "You're trying this too often in a row - please wait a minute and try again (sorry, this is a limitation by our provider)"
  },
  // Mail address not verified, login expired, and logged in via phone number
  "auth/requires-recent-login": {
    de: "Login abgelaufen - bitte auf der Stammverwaltungsseite aus- und wieder einloggen.",
    en: "Login expired - please log out and log in again on the group management page."
  },
  "auth/invalid-email": {
    de: "E-Mail-Adresse ist ungültig.",
    en: "Email address is invalid."
  },
}

export const dayVisitorMealChoices = {
  breakfast: {
    de: 'Frühstück',
    en: 'Breakfast',
  },
  lunch: {
    de: 'Mittagessen',
    en: 'Lunch',
  },
  dinner: {
    de: 'Abendessen',
    en: 'Dinner',
  }
}

export const staffTypes = {
  subcamp: {
    de: 'Mithilfe in einem Unterlager',
    en: 'Staff at a sub camp',
  },
  central: {
    de: 'Mithilfe in der zentralen Organisation',
    en: 'Staff with the central team',
  },
}

export const staffSubtypes = {
  cafe: {
    de: 'Café',
    en: 'Café',
  },
  themeyurt: {
    de: 'Themenjurte',
    en: 'Theme yurts',
  },
  equipment: {
    de: 'Ausrüster',
    en: 'Equipment',
  },
  infrastructure: {
    de: 'Infrastruktur',
    en: 'Infrastructure',
  },
  content: {
    de: 'Inhalt',
    en: 'Content',
  },
  international: {
    de: 'Internationales',
    en: 'International',
  },
  jumper: {
    de: 'Springer (flexibler Einsatz, je nach Bedarf)',
    en: 'Jumper (flexible assignment, whatever is needed)',
  },
}

export const placementGroups = [
  'Osterinsel',
  'Prismanien',
  'Wasteland',
  'Erde Feuer Wasser Luft',
  'Brownsea Island',
  'Atlantis',
  'Neupfadland',
  'St. Goldvein',
  'Espuertes',
];


export const genders = {
  female: {
    de: 'weiblicher Schnitt',
    en: 'female',
  },
  male: {
    de: 'männlicher Schnitt',
    en: 'male',
  },
};

export const foodOptions = {
  vegetarian: {
    de: 'Vegetarisch',
    en: 'Vegetarian',
  },
  vegan: {
    de: 'Vegan',
    en: 'Vegan',
  },
  meat: {
    de: 'Fleisch',
    en: 'Meat',
  },
};

export const participantTypeMap = {
  regular: {
    de: 'Stammesmitglied (außer Leiter)',
    en: 'Regular group member (except leaders)',
  },
  leader: {
    de: 'Leiter*in',
    en: 'Group leader',
  },
  small_child: {
    de: 'Kinder unter sechs Jahren',
    en: 'Children under the age of six',
  },
  alumni: {
    de: 'Ehemalige',
    en: 'Alumni',
  },
  staff: {
    de: 'Helfende',
    en: 'Staff',
  },
};

export type IParticipantDocument = { values: IParticipantSignup, billing: { effectivePrice: number } };
