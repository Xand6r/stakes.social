import React, { useContext, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { providers } from 'web3modal'
import { Button } from 'antd'
import WalletContext from 'src/context/walletContext'
import { useProvider, useConnectWallet } from 'src/fixtures/wallet/hooks'
import { ResponsiveModal } from 'src/components/atoms/ResponsiveModal'
import { useENS } from 'src/fixtures/ens/hooks'
import { useEffect } from 'react'
import Davatar from '@davatar/react'

const WalletContainer = styled.div`
  margin: -2rem 0 1rem 0;
`
const AccountContainer = styled.div`
  display: flex;
  align-items: center;
`
const Avatar = styled.div`
  margin-right: 8px;
`
const WalletAddressContainer = styled.div`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`

interface Props {}

export const WalletSettings = (_: Props) => {
  const router = useRouter()
  const { web3Modal } = useContext(WalletContext)
  const [ens, setENS] = useState('')
  const [isDisconnectModalVisible, setIsDisconnectModalVisible] = useState(false)
  const { accountAddress } = useProvider()
  const { connect, disconnect } = useConnectWallet()

  const showDisconnectModal = () => {
    setIsDisconnectModalVisible(true)
  }
  const disconnectOk = () => {
    disconnect()
    setIsDisconnectModalVisible(false)
    router.push('/')
  }
  const disconnectCancel = () => {
    setIsDisconnectModalVisible(false)
  }

  const reconnectWallet = async () => {
    disconnect()
    await connect()
  }

  const { getENS } = useENS()

  useEffect(() => {
    const fetchENS = async () => {
      if (accountAddress) await getENS(accountAddress || '').then((o?: string | null) => setENS(o || ''))
    }
    fetchENS()
  }, [accountAddress, getENS])

  const wallet = useMemo(() => {
    return web3Modal?.cachedProvider === providers.WALLETCONNECT.id
      ? { name: providers.WALLETCONNECT.name, logo: providers.WALLETCONNECT.logo }
      : web3Modal?.cachedProvider === providers.FORTMATIC.id
      ? { name: providers.FORTMATIC.name, logo: providers.FORTMATIC.logo }
      : web3Modal?.cachedProvider === 'custom-walletlink'
      ? {
          name: 'WalletLink',
          logo: 'https://github.com/dev-protocol/asset.stakes.social/blob/main/public/wallet/coinbase-wallet.jpg?raw=true'
        }
      : web3Modal?.cachedProvider === providers.METAMASK.id
      ? { name: providers.METAMASK.name, logo: providers.METAMASK.logo }
      : undefined
  }, [web3Modal?.cachedProvider])

  return wallet ? (
    <div>
      <WalletContainer>
        <img src={wallet.logo} height="30" width="30" />
        <AccountContainer>
          {accountAddress && (
            <Avatar>
              <Davatar size={24} address={accountAddress} />
            </Avatar>
          )}
          <WalletAddressContainer>{ens || accountAddress}</WalletAddressContainer>
        </AccountContainer>
      </WalletContainer>
      <div>
        <Button type="primary" onClick={showDisconnectModal}>
          Disconnect
        </Button>
        <Button type="primary" style={{ marginLeft: '.5em' }} onClick={reconnectWallet}>
          Change
        </Button>
        <ResponsiveModal visible={isDisconnectModalVisible} onOk={disconnectOk} onCancel={disconnectCancel}>
          <p>Disconnecting the Wallet?</p>
        </ResponsiveModal>
      </div>
    </div>
  ) : (
    <></>
  )
}
