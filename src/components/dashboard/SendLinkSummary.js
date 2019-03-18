// @flow
import React from 'react'
import { View } from 'react-native'
import { useWrappedGoodWallet } from '../../lib/wallet/useWrappedWallet'
import { type TransactionEvent } from '../../lib/gundb/UserStorage'
import { useWrappedUserStorage } from '../../lib/gundb/useWrappedStorage'
import { Section, Wrapper, Avatar, BigGoodDollar, CustomButton, CustomDialog } from '../common'
import { BackButton, PushButton, useScreenState } from '../appNavigation/stackNavigation'
import { receiveStyles } from './styles'
import TopBar from '../common/TopBar'
import { useWrappedApi } from '../../lib/API/useWrappedApi'
import isEmail from 'validator/lib/isEmail'
import isMobilePhone from '../../lib/validators/isMobilePhone'
import GDStore from '../../lib/undux/GDStore'
import logger from '../../lib/logger/pino-logger'
import wrapper from '../../lib/undux/utils/wrapper'

const log = logger.child({ from: 'SendLinkSummary' })

export type AmountProps = {
  screenProps: any,
  navigation: any
}

const TITLE = 'Send GD'

const SendLinkSummary = (props: AmountProps) => {
  const { screenProps } = props
  const [screenState] = useScreenState(screenProps)
  const goodWallet = useWrappedGoodWallet()
  const store = GDStore.useStore()
  const { loading } = store.get('currentScreen')
  const API = useWrappedApi()
  const UserStorage = useWrappedUserStorage()

  const { amount, reason, to } = screenState

  const sendLinkTo = (to, sendLink) => {
    if (!to) return
    // Send email if to is email
    if (isEmail(to)) {
      return API.sendLinkByEmail(to, sendLink)
    }

    // Send sms if to is phone
    if (isMobilePhone(to)) {
      return API.sendLinkBySMS(to, sendLink)
    }

    throw new Error(`${to} is neither a valid phone or email`)
  }

  const generateLinkAndSend = async () => {
    let generateLinkResponse
    try {
      // Generate link deposit
      generateLinkResponse = await goodWallet.generateLink(amount)
    } catch (e) {
      log.error(e)
    }

    if (generateLinkResponse) {
      try {
        // Generate link deposit
        const { sendLink, receipt } = generateLinkResponse
        // Share link
        await sendLinkTo(to, sendLink)

        // Save transaction
        const transactionEvent: TransactionEvent = {
          id: receipt.blockHash,
          date: new Date().toString(),
          type: 'send',
          data: {
            to,
            reason,
            amount,
            sendLink,
            receipt
          }
        }
        await UserStorage.updateFeedEvent(transactionEvent)

        // Cheking events are being stored
        // FIXME: Remove this since is only to check that is working
        const events = await UserStorage.feed.get('2019-03-01').decrypt()
        log.debug({ events, transactionEvent })

        // Show confirmation
        screenProps.push('SendConfirmation', { sendLink })
      } catch (e) {
        const { hashedString } = generateLinkResponse
        await goodWallet.cancelOtl(hashedString)
        log.error(e)
      }
    }
  }
  return (
    <Wrapper style={styles.wrapper}>
      <TopBar />
      <Section style={styles.section}>
        <Section.Row style={styles.sectionRow}>
          <Section.Title style={styles.headline}>Summery</Section.Title>
          <View style={styles.sectionTo}>
            <Avatar size={90} />
            {to && <Section.Text style={styles.toText}>{`To: ${to}`}</Section.Text>}
          </View>
          <Section.Text>
            {`Here's `}
            <BigGoodDollar number={amount} />
          </Section.Text>
          <Section.Text>{reason && `For ${reason}`}</Section.Text>
          <View style={styles.buttonGroup}>
            <BackButton mode="text" screenProps={screenProps} style={{ flex: 1 }}>
              Cancel
            </BackButton>
            <CustomButton mode="contained" onPress={generateLinkAndSend} style={{ flex: 2 }} loading={loading}>
              Next
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
  }
}

SendLinkSummary.navigationOptions = {
  title: TITLE
}

export default SendLinkSummary
