import React from 'react'
import Claim from '../Claim'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('Claim', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<Claim />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<Claim />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})