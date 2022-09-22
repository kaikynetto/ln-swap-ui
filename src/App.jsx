import { useEffect, useState } from "react"
import { ArrowsDownUp } from "phosphor-react"
import TorchLight from "./lib/torch";

import "./App.css"

function App() {  
  const [ fromAmount, setFromAmount ] = useState(0)
  const [ fromSymbol, setFromSymbol ] = useState("LN")

  const [ toAmount, setToAmount ] = useState(0)
  const [ toSymbol, setToSymbol ] = useState("BTC")

  const [ feerate, setFeerate ] = useState(1)
  const [ feeBaseSat, setFeeBaseSat ] = useState(0)

  const [ address, setAddress ] = useState("")
  const [ info, setInfo ] = useState({})

  const torch = new TorchLight(import.meta.env.VITE_TORCH_LIGHT_API);
  
  function calculateFee(amount) {
    var fee_btc = (amount * info.SERVICE_FEE_RATE / 100)
    if (fee_btc < info.SERVICE_MIN_FEE_RATE) {
      fee_btc = info.SERVICE_MIN_FEE_RATE
    }
    
    if (toSymbol !== "LN") {
      fee_btc += (feeBaseSat * feerate) / 100000000
    }
    return fee_btc
  }

  function changePosition() {
    const backup_to_symbol = toSymbol
    const backup_from_symbol = fromSymbol
    
    const backup_to_amount = toAmount
    const backup_from_amount = fromAmount

    setToSymbol(backup_from_symbol)
    setFromSymbol(backup_to_symbol)
    
    setToAmount(backup_from_amount)
    setFromAmount(backup_to_amount)
  }

  useEffect(() => {
    torch.info().then((r) => {
      const data = r.data
      setInfo(data)
      setFromAmount(data.TRADE_MIN_BTC)
    })
  }, [])

  useEffect(() => {
    if (address) {
      torch.estimate_fee(address, fromAmount, 1).then((r) => {
        const data = r.data
        console.log(data)
        setFeeBaseSat(data.fee_sats)
      })
    }
  }, [address])
  
  useEffect(() => {
    const fee_btc = calculateFee(fromAmount)
    if ((fromAmount - fee_btc > 0) && (fromAmount > 0)) {
      console.log(fromAmount - fee_btc)
      setToAmount(fromAmount - fee_btc)
    } else {
      setToAmount(0)
    }
  }, [fromAmount, feerate, feeBaseSat])
  
  return (
    <div className="App">
      <div className="container">
        <div className="box">
          <p className="symbol">{fromSymbol}</p>
          <input className="input" placeholder="0" min="0" value={typeof(fromAmount) == 'number' ? fromAmount.toFixed(8) : fromAmount} type="number" onChange={(e) => {
            const amount = e.target.value
            setFromAmount(amount)
            
            const fee_btc = calculateFee(amount)
            setToAmount(amount - fee_btc)
          }}/>
        </div>
        
        <button className="change">
          <ArrowsDownUp size={25} color="gray" weight="bold"/>
        </button>

        <div className="box">
          <p  className="symbol">{toSymbol}</p>
          <input className="input" placeholder="0" min="0" step="0.0000001" value={typeof(toAmount) == 'number' ? toAmount.toFixed(8): toAmount } disabled={true} type="number"/>
        </div>
        <div className="box">
          { 
            toSymbol == "LN" 
            ? 
              <p  className="symbol"> Invoice </p>
            : 
              <p  className="symbol"> Address </p>
          }
          <input className="input" onChange={(e) => setAddress(e.target.value)}/> 
        </div>
        <div className="feerate">
          <p className="display-feerate">{feerate} / vbytes ({feeBaseSat * feerate} sats)</p>
          <input className="range" type="range" min="1" max="100" value={feerate} onChange={(e) => setFeerate(e.target.value)}/>
        </div>
          
        <button className="swap" disabled={(toAmount < info.SERVICE_MIN_FEE_RATE) || (address == "")}> 
          Swap
        </button>
      </div>
    </div>
  )
}

export default App
