// @flow
import React, { useState, useEffect } from 'react'
import { View } from 'react-native'
import UserStorage, { type TransactionEvent } from '../../lib/gundb/UserStorage'

import logger from '../../lib/logger/pino-logger'
import GDStore from '../../lib/undux/GDStore'
import { useWrappedGoodWallet } from '../../lib/wallet/useWrappedWallet'
import { BackButton, useScreenState } from '../appNavigation/stackNavigation'
import { BigGoodDollar, CustomButton, CustomDialog, Section, Wrapper, Avatar } from '../common'
import TopBar from '../common/TopBar'
import { receiveStyles } from './styles'

export type AmountProps = {
  screenProps: any,
  navigation: any
}

const TITLE = 'Send GD'

const log = logger.child({ from: 'SendQRSummary' })

const SendQRSummary = (props: AmountProps) => {
  const { screenProps } = props
  const [screenState] = useScreenState(screenProps)
  const goodWallet = useWrappedGoodWallet()
  const store = GDStore.useStore()
  const { loading } = store.get('currentScreen')

  const { amount, reason, to } = screenState
  const [profile, setProfile] = useState({})

  const updateProfile = async () => {
    const profile = await UserStorage.getUserProfile(to)
    setProfile(profile)
  }
  useEffect(() => {
    updateProfile()
  }, [to])

  const sendGD = async () => {
    try {
      const receipt = await goodWallet.sendAmount(to, amount, {
        onTransactionHash: hash => {
          log.debug({ hash })
          // Save transaction
          const transactionEvent: TransactionEvent = {
            id: hash,
            date: new Date().toString(),
            type: 'send',
            data: {
              to,
              reason,
              amount
            }
          }
          UserStorage.updateFeedEvent(transactionEvent)
          return hash
        }
      })
      log.debug({ receipt, screenProps })
      store.set('currentScreen')({
        dialogData: {
          visible: true,
          title: 'SUCCESS!',
          message: 'The GD was sent successfully',
          dismissText: 'Yay!',
          onDismiss: screenProps.goToRoot
        }
      })
    } catch (e) {
      log.error(e)
    }
  }

  return (
    <Wrapper style={styles.wrapper}>
      <TopBar push={screenProps.push} />
      <Section style={styles.section}>
        <Section.Row style={styles.sectionRow}>
          <Section.Title style={styles.headline}>Summary</Section.Title>
          <View style={styles.sectionTo}>
            <Avatar size={90} style={styles.avatar} source={profile && profile.avatar} />
            {to && <Section.Text style={styles.toText}>{`To: ${to}`}</Section.Text>}
            {profile.name && <Section.Text style={styles.toText}>{`Name: ${profile.name}`}</Section.Text>}
          </View>
          <Section.Text>
            {`Here's `}
            <BigGoodDollar number={amount} />
          </Section.Text>
          <Section.Text>{reason ? reason : null}</Section.Text>
          <View style={styles.buttonGroup}>
            <BackButton mode="text" screenProps={screenProps} style={{ flex: 1 }}>
              Cancel
            </BackButton>
            <CustomButton mode="contained" onPress={sendGD} style={{ flex: 2 }} loading={loading}>
              Confirm
            </CustomButton>
          </View>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

const styles = {
  ...receiveStyles,
  headline: {
    textTransform: 'uppercase'
  },
  sectionTo: {
    alignItems: 'center'
  },
  toText: {
    marginTop: '1rem',
    marginBottom: '1rem'
  },
  avatar: {
    backgroundColor: 'white'
  }
}

SendQRSummary.navigationOptions = {
  title: TITLE
}

SendQRSummary.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  // Component shouldn't be loaded if there's no 'amount', nor 'to' fields with data
  return !!screenState.amount && !!screenState.to
}

export default SendQRSummary
