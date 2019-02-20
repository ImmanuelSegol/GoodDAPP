import Gun from 'gun'
import extend from '../gundb-extend'

let userStorage = require('../UserStorage.js').default
let event = { id: 'xyz', date: new Date('2019-01-01T10:00:00.000Z').toString(), data: { foo: 'bar', unchanged: 'zar' } }
let event2 = { id: 'xyz2', date: new Date('2019-01-01T20:00:00.000Z').toString(), data: { foo: 'bar' } }
let event3 = { id: 'xyz3', date: new Date('2019-01-01T14:00:00.000Z').toString(), data: { foo: 'xar' } }
let mergedEvent = { id: 'xyz', date: new Date('2019-01-01').toString(), data: { foo: 'zar', unchanged: 'zar', extra: 'bar' } }
let event4 = { id: 'xyz4', date: new Date('2019-01-02T10:00:00.000Z').toString(), data: { foo: 'bar', unchanged: 'zar' } }

describe('UserStorage', () => {
  beforeAll(async () => {
    global.gun = Gun()
    jest.setTimeout(30000)
    await userStorage.wallet.ready
    console.debug('wallet ready...')
    await userStorage.ready
    console.log('storage ready...')
  })

  it('logins to gundb', async () => {
    expect(userStorage.user).not.toBeUndefined()
  })

  it('sets gundb field', async () => {
    const res = await userStorage.profile
      .get('x')
      .put({ z: 1, y: 1 })
      .then()
    expect(res).toEqual(expect.objectContaining({ z: 1, y: 1 }))
  })

  it('updates gundb field', done => {
    const gunRes = userStorage.profile.get('x').put({ z: 2, y: 2 }, async v => {
      let res = await userStorage.profile.get('x').then()
      expect(res).toEqual(expect.objectContaining({ z: 2, y: 2 }))
      done()
    })
  })

  it('sets profile field', async () => {
    await userStorage.setProfileField('name', 'hadar', 'public')
    const res = await userStorage.profile.get('name').then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'public', display: 'hadar' }))
  })

  it('update profile field', async () => {
    const ack = await userStorage.setProfileField('name', 'hadar2', 'public')
    const res = await userStorage.profile.get('name').then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'public', display: 'hadar2' }))
  })

  it('gets profile field', async () => {
    const gunRes = userStorage.getProfileField('name')
    const res = await gunRes.then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'public', display: 'hadar2', value: expect.anything() }))
  })

  it('sets profile field private (encrypted)', async () => {
    const gunRes = await userStorage.setProfileField('id', 'z123', 'private')
    const res = await userStorage.profile.get('id').then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'private', display: '' }))
  })

  it('profile field private is encrypted', async () => {
    const res = await userStorage.profile
      .get('id')
      .get('value')
      .then()
    expect(Object.keys(res)).toEqual(['ct', 'iv', 's'])
  })

  it('gets profile field private (decrypted)', async () => {
    const gunRes = userStorage.getProfileFieldValue('id')
    const res = await gunRes.then()
    expect(res).toEqual('z123')
  })

  it('sets profile email field masked', async () => {
    const gunRes = await userStorage.setProfileField('email', 'johndoe@blah.com', 'masked')
    const res = await userStorage.profile.get('email').then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'masked', display: 'j*****e@blah.com' }))
  })

  it('sets profile mobile field masked', async () => {
    const gunRes = await userStorage.setProfileField('mobile', '+972-50-7384928', 'masked')
    const res = await userStorage.profile.get('mobile').then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'masked', display: '***********4928' }))
  })

  it('sets profile phone field masked', async () => {
    const gunRes = await userStorage.setProfileField('phone', '+972-50-7384928', 'masked')
    const res = await userStorage.profile.get('phone').then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'masked', display: '***********4928' }))
  })

  it('doesnt mask non email/phone profile fields', async () => {
    const gunRes = await userStorage.setProfileField('name', 'John Doe', 'masked')
    const res = await userStorage.profile.get('name').then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'public', display: 'John Doe' }))
  })

  it('change profile field privacy to public', async () => {
    const gunRes = await userStorage.setProfileFieldPrivacy('phone', 'public')
    const res = await userStorage.profile.get('phone').then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'public', display: '+972-50-7384928' }))
  })

  it('change profile field privacy to private', async () => {
    const gunRes = await userStorage.setProfileFieldPrivacy('phone', 'private')
    const res = await userStorage.profile.get('phone').then()
    expect(res).toEqual(expect.objectContaining({ privacy: 'private', display: '' }))
  })

  it('add event', async () => {
    const gunRes = await userStorage.updateFeedEvent(event)
    const index = await userStorage.feed
      .get('index')
      .once()
      .then()
    const events = await userStorage.feed.get('2019-01-01').decrypt()
    expect(index).toHaveProperty('2019-01-01')
    expect(events).toEqual([event])
  })

  it('add second event', async () => {
    const gunRes = await userStorage.updateFeedEvent(event2)
    const index = await userStorage.feed
      .get('index')
      .once()
      .then()
    const events = await userStorage.feed.get('2019-01-01').decrypt()
    expect(index['2019-01-01']).toEqual(2)
    expect(events).toEqual([event2, event])
  })

  it('updates first event', async () => {
    let event = { id: 'xyz', date: new Date('2019-01-01').toString(), data: { foo: 'zar', extra: 'bar' } }
    const gunRes = await userStorage.updateFeedEvent(event)
    const index = await userStorage.feed
      .get('index')
      .once()
      .then()
    const events = await userStorage.feed.get('2019-01-01').decrypt()
    expect(index['2019-01-01']).toEqual(2)
    expect(events).toEqual([event2, mergedEvent])
  })

  it('add middle event', async () => {
    const gunRes = await userStorage.updateFeedEvent(event3)
    const index = await userStorage.feed
      .get('index')
      .once()
      .then()
    const events = await userStorage.feed.get('2019-01-01').decrypt()
    expect(index['2019-01-01']).toEqual(3)
    expect(events).toEqual([event2, event3, mergedEvent])
  })

  it('keeps event index sorted', async () => {    
    const gunRes = await userStorage.updateFeedEvent(event4)
    const index = await userStorage.feed
      .get('index')
      .once()
      .then()
    const events = await userStorage.feed.get('2019-01-02').decrypt()
    expect(index['2019-01-02']).toEqual(1)
    expect(events).toEqual([event4])
  })

  it('gets events first page', async () => {
    const gunRes = await userStorage.getFeedPage(2)
    expect(gunRes.length).toEqual(4)
  })

  it('gets events second page', async () => {
    const gunRes = await userStorage.getFeedPage(2)
    expect(gunRes.length).toEqual(0)
  })

  it('resets cursor and get events single day page', async () => {
    const gunRes = await userStorage.getFeedPage(1,true)
    expect(gunRes.length).toEqual(1)
  })

})