import React from 'react'
// import { getComponentWithMock } from './__util__/index'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import ListSendEvent from '../ListSendEvent'
import { generateFeedItemProps } from '../../__tests__/__util__'

describe('ListSendEvent', () => {
  // const ModalSendEvent = getComponentWithMock('../ModalSendEvent', 'send')
  const props = generateFeedItemProps('send')
  it('renders without errors', () => {
    const tree = renderer.create(<ListSendEvent {...props} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<ListSendEvent {...props} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
