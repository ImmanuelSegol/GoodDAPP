import React from 'react'
import Avatar from '../Avatar'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('Avatar', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<Avatar />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<Avatar />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
