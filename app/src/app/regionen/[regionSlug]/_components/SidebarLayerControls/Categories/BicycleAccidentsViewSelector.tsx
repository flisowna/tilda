'use client'

import React from 'react'
import { useCategoriesConfig } from '../../../_hooks/useQueryState/useCategoriesConfig/useCategoriesConfig'
import { produce } from 'immer'

export const BicycleAccidentsViewSelector = () => {
  const { categoriesConfig, setCategoriesConfig } = useCategoriesConfig()

  const bicycleAccidentsCategory = categoriesConfig?.find((cat) => cat.id === 'bicycleAccidents')
  const subcategory = bicycleAccidentsCategory?.subcategories.find(
    (sub) => sub.id === 'bicycleAccidents',
  )

  if (!subcategory) return null

  const currentView = subcategory.styles.find((s) => s.id === 'heatmap')?.active
    ? 'heatmap'
    : 'standard'

  const handleViewChange = (viewType: 'standard' | 'heatmap') => {
    const newConfig = produce(categoriesConfig, (draft) => {
      const category = draft?.find((cat) => cat.id === 'bicycleAccidents')
      const subcat = category?.subcategories.find((sub) => sub.id === 'bicycleAccidents')
      if (!subcat) return

      if (viewType === 'heatmap') {
        subcat.styles.forEach((style) => {
          if (style.id === 'heatmap') {
            style.active = true
          }
        })
      } else {
        // Standard view: deactivate heatmap, ensure at least one severity is active
        const hasActiveSeverity = subcat.styles.some(
          (s) => ['fatal', 'serious', 'light'].includes(s.id) && s.active,
        )
        subcat.styles.forEach((style) => {
          if (style.id === 'heatmap') {
            style.active = false
          } else if (['fatal', 'serious', 'light'].includes(style.id)) {
            if (!hasActiveSeverity) {
              style.active = true
            }
          }
        })
      }
    })
    void setCategoriesConfig(newConfig)
  }

  return (
    <div className="mx-2 mb-3 mt-2 space-y-2 rounded border border-gray-200 bg-gray-50 p-3">
      <div className="text-xs font-semibold text-gray-700">Ansicht</div>
      <select
        value={currentView}
        onChange={(e) => handleViewChange(e.target.value as 'standard' | 'heatmap')}
        className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
      >
        <option value="standard">Standard</option>
        <option value="heatmap">Heatmap</option>
      </select>
    </div>
  )
}

