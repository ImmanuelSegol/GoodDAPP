import React from 'react'
import Donate from '../Donate'
import { createSwitchNavigator } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('Donate', () => {
  it('renders without errors', () => {
    const WebRouter = createBrowserApp(createSwitchNavigator({ Donate }))

    const tree = renderer.create(<WebRouter />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const WebRouter = createBrowserApp(createSwitchNavigator({ Donate }))

    const component = renderer.create(<WebRouter />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
