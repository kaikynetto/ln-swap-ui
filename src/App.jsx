import { useState } from "react"
import { ArrowsDownUp } from "phosphor-react"
import "./App.css"

function App() {
  const [ feerate, setFeerate ] = useState(1)
  const [ fromAmount, setFromAmount ] = useState(0)
  const [ fromSymbol, setFromSymbol ] = useState("LN")

  const [ toAmount, setToAmount ] = useState(0)
  const [ toSymbol, setToSymbol ] = useState("BTC")

  const [ address, setAddress ] = useState("")

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

  return (
    <div className="App">
      <div className="container">
        <div className="box">
          <p className="symbol">{fromSymbol}</p>
          <input className="input" placeholder="0" value={fromAmount} type="number" onChange={(e) => setFromAmount(e.target.value)}/>
        </div>
        
        <button className="change" onClick={changePosition}>
          <ArrowsDownUp size={25} color="gray" weight="bold"/>
        </button>

        <div className="box">
          <p  className="symbol">{toSymbol}</p>
          <input className="input" placeholder="0" value={toAmount} type="number" onChange={(e) => setToAmount(e.target.value)}/>
        </div>

        <div className="box">
          { 
            toSymbol == "LN" 
            ? 
              <p  className="symbol"> Invoice </p>
            : 
              <p  className="symbol"> Address </p>
          }
          <input className="input" onChange={(e) => setToAmount(e.target.value)}/> 
        </div>
        <div className="feerate">
          <p className="display-feerate">{feerate} / vbytes</p>
          <input className="range" type="range" min="1" max="100" value={feerate} onChange={(e) => setFeerate(e.target.value)}/>
        </div>

        <button className="swap"> 
          Swap
        </button>
      </div>
    </div>
  )
}

export default App
