import { useEffect, useState } from "react"
import { ArrowsDownUp, Power } from "phosphor-react"
import LNSwap from "../../lib/ln_swap";

import { useNavigate } from "react-router-dom";
import "./styles.css"

function App() {  
  const [ fromAmount, setFromAmount ] = useState(0)
  const [ fromSymbol, setFromSymbol ] = useState("LN")

  const [ toAmount, setToAmount ] = useState(0)
  const [ toSymbol, setToSymbol ] = useState("BTC")

  const [ feerate, setFeerate ] = useState(1)
  const [ feeBaseSat, setFeeBaseSat ] = useState(0)

  const [ address, setAddress ] = useState("")
  const [ info, setInfo ] = useState({})
  const [ type, setType ] = useState("loop-out")

  const navigate = useNavigate()

  const ln_swap = new LNSwap(import.meta.env.VITE_LN_SWAP_API);
  
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
    
    setToSymbol(backup_from_symbol)
    setFromSymbol(backup_to_symbol)

    if (type === "loop-out") {
      setType("loop-in")
    } else {
      setType("loop-out")
    }
  }
  
  useEffect(() => {
    ln_swap.info().then((r) => {
      const data = r.data
      setInfo(data)
      setFromAmount(data.LOOP_MIN_BTC)
    })
  }, [])

  useEffect(() => {
    if (address) {
      ln_swap.estimate_fee(address, fromAmount, 1).then((r) => {
        if (toSymbol !== "LN") {
          const data = r.data
          setFeeBaseSat(data.fee_sats)
        }
      })
    }
  }, [address])
  
  useEffect(() => {
    const fee_btc = calculateFee(fromAmount)
    if ((fromAmount - fee_btc > 0) && (fromAmount > 0)) {
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
          <input className="input" placeholder="0" min="0" disabled={toSymbol == "LN"} value={typeof(fromAmount) == 'number' ? fromAmount.toFixed(8) : fromAmount} type="number" onChange={(e) => {
            const amount = e.target.value
            setFromAmount(amount)
            
            const fee_btc = calculateFee(amount)
            setToAmount(amount - fee_btc)
          }}/>
        </div>
        
        <button className="change" onClick={changePosition}>
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
          <input className="input" onChange={(e) => {
              const value = e.target.value

              if ((toSymbol === "LN") && (value)) {
                ln_swap.decode_invoice(value).then((r) => {
                  const amount = (r.data.num_satoshis / 100000000)
                  setFromAmount(amount)
                })
              } 
              setAddress(value)
          }}/> 
        </div>
        
        <div className="feerate">
          {
            toSymbol !== "LN" ? (
              <p className="display-feerate">
                Fee: {feerate} / vbytes ({((fromAmount - toAmount) * 100000000).toFixed(0)} sats)
              </p>
            ) : (
              <p className="display-feerate">
                Fee: ({((fromAmount - toAmount) * 100000000).toFixed(0)} sats)
              </p>
            )
          }
          <input className="range" type="range" disabled={toSymbol == "LN"} min="1" max="100" value={feerate} onChange={(e) => setFeerate(e.target.value)}/>
        </div>
        
        <button 
          className="swap" 
          disabled={(toAmount < info.SERVICE_MIN_FEE_RATE) || (address == "")}
          onClick={() => {
            if (type === "loop-out") {
              ln_swap.create_loop_out(fromAmount, address, feerate).then((r) => {
                const data = r.data
                const txid = data.id

                navigate(`/tx/${txid}`)
              })
            }

            if (type === "loop-in") {
              ln_swap.create_loop_in(address).then((r) => {
                const data = r.data
                const txid = data.id
                
                navigate(`/tx/${txid}`)
              })
            }

          }}
        > 
          Swap
        </button>
      </div>
    </div>
  )
}

export default App
