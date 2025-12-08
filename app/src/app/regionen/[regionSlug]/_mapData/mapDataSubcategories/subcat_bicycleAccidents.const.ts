import { FileMapDataSubcategory } from '../types'

// Data source: uMap Berlin Unfallkarte API (via /api/bicycle-accidents)
// This subcategory displays bicycle accident data from uMap API (2018-2024)
// Data is already filtered for bicycle accidents in the API route
// Checkboxes for severity categories (fatal, serious, light) + dropdown for view type (Standard/Heatmap)

const subcatId = 'bicycleAccidents'
const source = 'bicycle_accidents_umap' // Updated to use GeoJSON source
export type SubcatBicycleAccidentsId = typeof subcatId
export type SubcatBicycleAccidentsStyleIds = 'fatal' | 'serious' | 'light' | 'heatmap'

export const subcat_bicycleAccidents: FileMapDataSubcategory = {
  id: subcatId,
  name: 'Fahrradunfälle',
  ui: 'checkbox',
  sourceId: source,
  styles: [
    {
      id: 'fatal',
      name: 'Unfälle mit Getöteten',
      legends: [
        {
          id: 'fatal',
          name: 'Unfälle mit Getöteten',
          style: {
            type: 'circle',
            color: '#000000', // Black - most severe, clearly distinct
          },
        },
      ],
      layers: [
        {
          id: 'circle',
          type: 'circle',
          source,
          filter: ['==', ['get', 'Unfallkate'], '1'],
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 4, 15, 5, 19, 8, 20, 14],
            'circle-opacity': ['interpolate', ['linear'], ['zoom'], 12, 0.8, 13, 0.9, 20, 0.9],
            'circle-stroke-color': '#000000',
            'circle-color': '#000000',
            'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 18, 3, 20, 8],
            'circle-stroke-opacity': ['interpolate', ['linear'], ['zoom'], 12, 0.8, 13, 1, 20, 1],
          },
        },
        {
          id: 'label',
          type: 'symbol',
          source,
          filter: ['==', ['get', 'Unfallkate'], '1'],
          layout: {
            'text-field': ['to-string', ['get', 'UJAHR']],
            'text-size': ['interpolate', ['linear'], ['zoom'], 14, 8, 16, 10, 18, 13, 20, 22],
            'text-anchor': 'bottom',
            'text-offset': [0, -0.7],
            'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
            'text-letter-spacing': 0.01,
          },
          paint: {
            'text-color': '#000000',
            'text-halo-color': 'hsl(51, 5%, 100%)',
            'text-halo-blur': 0.5,
            'text-opacity': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.5, 1, 20, 1],
            'text-halo-width': 1.2,
          },
        },
      ],
    },
    {
      id: 'serious',
      name: 'Unfälle mit Schwerverletzten',
      legends: [
        {
          id: 'serious',
          name: 'Unfälle mit Schwerverletzten',
          style: {
            type: 'circle',
            color: '#DC143C', // Crimson red - more distinct from light injuries
          },
        },
      ],
      layers: [
        {
          id: 'circle',
          type: 'circle',
          source,
          filter: ['==', ['get', 'Unfallkate'], '2'],
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 3, 15, 4, 19, 6, 20, 12],
            'circle-opacity': ['interpolate', ['linear'], ['zoom'], 12, 0.7, 13, 0.9, 20, 0.9],
            'circle-stroke-color': '#DC143C',
            'circle-color': '#DC143C',
            'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 18, 3, 20, 6],
            'circle-stroke-opacity': ['interpolate', ['linear'], ['zoom'], 12, 0.8, 13, 1, 20, 1],
          },
        },
        {
          id: 'label',
          type: 'symbol',
          source,
          filter: ['==', ['get', 'Unfallkate'], '2'],
          layout: {
            'text-field': ['to-string', ['get', 'UJAHR']],
            'text-size': ['interpolate', ['linear'], ['zoom'], 14, 8, 16, 10, 18, 13, 20, 22],
            'text-anchor': 'bottom',
            'text-offset': [0, -0.7],
            'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
            'text-letter-spacing': 0.01,
          },
          paint: {
            'text-color': '#DC143C',
            'text-halo-color': 'hsl(51, 5%, 100%)',
            'text-halo-blur': 0.5,
            'text-opacity': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.5, 1, 20, 1],
            'text-halo-width': 1.2,
          },
        },
      ],
    },
    {
      id: 'light',
      name: 'Unfälle mit Leichtverletzten',
      legends: [
        {
          id: 'light',
          name: 'Unfälle mit Leichtverletzten',
          style: {
            type: 'circle',
            color: '#FFA500', // Orange - more distinct from serious injuries
          },
        },
      ],
      layers: [
        {
          id: 'circle',
          type: 'circle',
          source,
          filter: ['==', ['get', 'Unfallkate'], '3'],
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 3, 15, 4, 19, 6, 20, 12],
            'circle-opacity': ['interpolate', ['linear'], ['zoom'], 12, 0.7, 13, 0.9, 20, 0.9],
            'circle-stroke-color': '#FFA500',
            'circle-color': '#FFA500',
            'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 18, 2, 20, 6],
            'circle-stroke-opacity': ['interpolate', ['linear'], ['zoom'], 12, 0.8, 13, 1, 20, 1],
          },
        },
        {
          id: 'label',
          type: 'symbol',
          source,
          filter: ['==', ['get', 'Unfallkate'], '3'],
          layout: {
            'text-field': ['to-string', ['get', 'UJAHR']],
            'text-size': ['interpolate', ['linear'], ['zoom'], 14, 8, 16, 10, 18, 13, 20, 22],
            'text-anchor': 'bottom',
            'text-offset': [0, -0.7],
            'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
            'text-letter-spacing': 0.01,
          },
          paint: {
            'text-color': 'hsl(0, 0%, 51%)',
            'text-halo-color': 'hsl(51, 5%, 100%)',
            'text-halo-blur': 0.5,
            'text-opacity': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.5, 1, 20, 1],
            'text-halo-width': 1.2,
          },
        },
      ],
    },
    {
      id: 'heatmap',
      name: 'Heatmap',
      legends: [
        {
          id: 'heatmap',
          name: 'Häufigkeit der Unfälle',
          style: {
            type: 'heatmap',
            color: '#bf1d1d',
          },
        },
      ],
      layers: [
        {
          id: 'heatmap',
          type: 'heatmap',
          source,
          filter: ['match', ['get', 'Unfallkate'], ['1', '2', '3'], true, false],
          paint: {
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0,
              'rgba(191, 29, 29, 0)',
              0.1,
              'rgba(191, 29, 29, 0.2)',
              0.3,
              'rgba(191, 29, 29, 0.5)',
              0.5,
              'rgba(191, 29, 29, 0.7)',
              0.7,
              'rgba(191, 29, 29, 0.85)',
              1,
              '#bf1d1d',
            ],
            'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 10, 0.6, 12, 0.8, 15, 0.9],
            'heatmap-weight': 1,
            'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 10, 5, 12, 10, 15, 20],
            'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 10, 0.5, 12, 1, 15, 1.5],
          },
        },
      ],
    },
  ],
}
