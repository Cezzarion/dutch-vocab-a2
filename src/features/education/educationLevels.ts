export const educationLevels = ['wo', 'hbo', 'mbo', 'vwo', 'havo', 'vmbo'] as const

export type EducationLevel = (typeof educationLevels)[number]
