import type { HomePageData } from './types'

export async function getHomePageData(): Promise<HomePageData> {
  return {
    title: 'Home',
    subtitle: 'Scaffolded with the requested MVVM architecture.',
  }
}
