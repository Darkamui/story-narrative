import type { ComponentType } from 'react'
import type { Locale } from '../i18n/locale'

type StoryCopy = { title: string; subject: string; description: string; imageAlt: string; format: string }
export type StoryDefinition = {
  slug: string
  number: string
  image: string
  copy: Record<Locale, StoryCopy>
  legacyFragments: readonly string[]
  load: () => Promise<{ default: ComponentType }>
}

// Keep imports dynamic: the library must not load a story's renderer or data.
export const stories: readonly StoryDefinition[] = [{
  slug: 'aluminum', number: '01', image: 'images/aluminum.jpg',
  copy: {
    en: {
      title: 'Inside the Cell', subject: 'Aluminum',
      description: 'Follow a grain of alumina into an electrolysis cell. Separate its layers, trace the process, and watch a material take shape.',
      imageAlt: 'Exploded view of the aluminum electrolysis cell, showing its separated assemblies.',
      format: '12 chapters · Interactive 3D · EN / FR',
    },
    fr: {
      title: 'Au cœur de la cuve', subject: 'Aluminium',
      description: 'Suivez un grain d’alumine dans une cuve d’électrolyse. Séparez ses couches, explorez le procédé et découvrez comment le métal prend forme.',
      imageAlt: 'Vue éclatée de la cuve d’électrolyse de l’aluminium et de ses différents ensembles.',
      format: '12 chapitres · 3D interactive · EN / FR',
    },
  },
  legacyFragments: ['grain', 'reveal', 'assemblies', 'anatomy', 'section', 'current', 'electrolysis', 'normal', 'anode-effect', 'metal', 'tapping', 'casting'],
  load: () => import('../stories/aluminum/app/AluminumStory'),
}, {
  slug: 'graphics-card', number: '02', image: 'images/graphics-card/assembled.webp',
  copy: {
    en: {
      title: 'One Frame', subject: 'Graphics card',
      description: 'Open a graphics card. Find the chip that calculates the image, explore its supporting parts, and follow the heat through the cooler.',
      imageAlt: 'The original AXIOM 320 triple-fan graphics card, rendered from its authored 3D model.',
      format: '9 guided views · Interactive 3D · EN / FR',
    },
    fr: {
      title: 'Une image', subject: 'Carte graphique',
      description: 'Ouvrez une carte graphique. Trouvez la puce qui calcule l’image, explorez les pièces qui l’entourent et suivez la chaleur dans le refroidisseur.',
      imageAlt: 'La carte graphique originale AXIOM 320 à trois ventilateurs, rendue depuis son modèle 3D.',
      format: '9 vues guidées · 3D interactive · EN / FR',
    },
  },
  legacyFragments: [],
  load: () => import('../stories/graphics-card/GraphicsCardStory'),
}]
export const homeHref = import.meta.env.BASE_URL
export const storyHref = (story: Pick<StoryDefinition, 'slug'>) => `${homeHref}stories/${story.slug}`
export function resolveRoute(pathname: string, base = homeHref) {
  const root = base.replace(/\/$/, '')
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === (root || '/')) return { kind: 'home' } as const
  const story = stories.find(item => path === `${root}/stories/${item.slug}`)
  return story ? { kind: 'story', story } as const : { kind: 'missing' } as const
}
