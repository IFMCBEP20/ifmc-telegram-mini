import { useState } from 'react'
import { ethers } from 'ethers'
import WalletConnectProvider from '@walletconnect/web3-provider'

const FACTORY = '0x10f6dcD13531437B1C6E3FC85Bfc48Ff643234A0'
const ABI = [
  {
    "inputs": [
      {"name":"name","type":"string"},
      {"name":"symbol","type":"string"},
      {"name":"description","type":"string"},
      {"name":"ipfsHash","type":"string"},
      {"name":"twitter","type":"string"},
      {"name":"telegram","type":"string"}
    ],
    "name":"createTokenAndBuy",
    "outputs": [{"name":"tokenAddr","type":"address"},{"name":"curveAddr","type":"address"}],
    "stateMutability":"payable",
    "type":"function"
  },
  {"inputs":[],"name":"LAUNCH_FEE","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
]

export default function App() {
  const tg = window.Telegram.WebApp
  tg.ready()

  const [form, setForm] = useState({ name:'', symbol:'', desc:'', twitter:'', telegram:'', buy:0 })
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')
  const [tx, setTx] = useState('')

  const upload = async () => {
    if (!file) return ''
    const data = new FormData()
    data.append('file', file)
    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: { Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}` },
      body: data
    })
    const { IpfsHash } = await res.json()
    return IpfsHash
  }

  const launch = async () => {
    setStatus('Connecting wallet...')
    const wc = new WalletConnectProvider({
      rpc: { 56: 'https://bsc-dataseed.binance.org/' },
      bridge: 'https://bridge.walletconnect.org',
      qrcode: false
    })
    await wc.enable()
    const provider = new ethers.BrowserProvider(wc)
    const signer = await provider.getSigner()
    const addr = await signer.getAddress()
    setStatus(`Wallet: ${addr.slice(0,8)}…`)

    setStatus('Uploading image...')
    const ipfs = await upload()

    const contract = new ethers.Contract(FACTORY, ABI, signer)
    const fee = await contract.LAUNCH_FEE()
    const value = fee + ethers.parseEther(form.buy.toString())

    setStatus('Sending transaction...')
    const tx = await contract.createTokenAndBuy(
      form.name, form.symbol, form.desc, ipfs, form.twitter, form.telegram,
      { value }
    )
    setTx(tx.hash)
    setStatus('Confirming...')
    await tx.wait()
    setStatus('Launched!')

    tg.showAlert(`Token created!\nTx: ${tx.hash}\nhttps://bscscan.com/tx/${tx.hash}`)
  }

  return (
    <div className="card">
      <h2>Launch Meme Token</h2>
      <input placeholder="Name" onChange={e=>setForm({...form,name:e.target.value})} />
      <input placeholder="Symbol" onChange={e=>setForm({...form,symbol:e.target.value})} />
      <textarea placeholder="Description" onChange={e=>setForm({...form,desc:e.target.value})} />
      <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} />
      <input placeholder="Twitter (optional)" onChange={e=>setForm({...form,twitter:e.target.value})} />
      <input placeholder="Telegram (optional)" onChange={e=>setForm({...form,telegram:e.target.value})} />
      <input type="number" step="0.001" placeholder="Buy BNB (0 = none)" onChange={e=>setForm({...form,buy:+e.target.value})} />
      <button onClick={launch} disabled={!form.name || !form.symbol}>
        {status || 'Launch Token'}
      </button>
      {tx && <p><a href={`https://bscscan.com/tx/${tx}`} target="_blank">View on BscScan</a></p>}
    </div>
  )
}
