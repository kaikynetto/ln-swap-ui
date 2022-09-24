import { useEffect, useState } from "react"
import { CheckCircle, XCircle } from "phosphor-react"
import { useParams } from "react-router-dom"
import { QRCodeSVG } from 'qrcode.react'
import LNSwap from "../../lib/ln_swap"

import { useNavigate } from "react-router-dom";

import "./styles.css"

function Tx() {
    const { txid } = useParams();
    const [ tx, setTx ] = useState({})
    const [ status, setStatus ] = useState(null)
    const [ amount, setAmount ] = useState(0)

    const [ addressUri, setAddressUri ] = useState()
    const [ address, setAddress ] = useState()
    const [ counter, setCounter ] = useState(0)

    const navigate = useNavigate()
    const ln_swap = new LNSwap(import.meta.env.VITE_LN_SWAP_API)

    useEffect(() => {
        ln_swap.get_transaction(txid).then((r) => {
            const data = r.data
            if (data.type == "loop-out") {
                const invoice = data.from.invoice
                setAddressUri(`lightning:${invoice}`)
                setAddress(invoice)

                ln_swap.decode_invoice(invoice).then((r) => {
                    const data = r.data
                    const amount = data.num_satoshis
                    setAmount(amount)
                })
            } 
            else if (data.type == "loop-in") {
                const address = data.from.address
                const amount = data.from.amount

                setAddressUri(`bitcoin:${address}?amount=${amount}`)
                setAddress(address)
                setAmount(amount)
            }
            
            setTx(data)
            setStatus(data.from.status)
            setCounter(data.from.expiry)
        }).catch((r) => {
            navigate("/")
        })
    }, [txid])
    
    useEffect(() => {
        const now = Math.floor(Date.now() / 1000)
        const timer = counter > 0 && setInterval(() => setCounter((tx.from.expiry - now).toFixed(0)), 1000);
        return () => clearInterval(timer);
    }, [counter]);

    useEffect(() => {
        const get_tx = (status === "pending" && setInterval(() => {
            ln_swap.get_transaction(txid).then((r) => { 
                const data = r.data
                setTx(data)
            })
        }, 5000))
        return () => clearInterval(get_tx);
    }, [tx])
    
    if ((status === null)) {
        return (
            <div></div>
        )
    }
    else if ((tx.from) && (tx.from.status === "settled")) {
        return (
            <div className="container" style={{height: 600}}>
                <CheckCircle size={250} style={{marginTop: "25%"}} color="green" weight="bold" />
                <p style={{fontSize: 11, fontStyle: "italic"}}>
                    {tx.to.txid}
                </p>
                <button style={{marginTop: "10%"}} onClick={() => navigate("/")}>
                    Come back
                </button>
            </div>
        )
    }
    else if ((counter > 0)) {
        return (
            <div className="container" style={{height: 600}}>
                <p> {counter} s </p>
                <a href={addressUri}>
                <QRCodeSVG value={address} size={450}/>                
                </a>
                <input value={address} disabled={true} style={{
                    width: "60%", 
                    marginTop: "2%",
                    background: "none",
                    border: "none",
                    outline: "none"
                }}/>
                <p>
                    {amount} {tx.type == "loop-in" ? "BTC" : "SATs"} {(tx.from.feerate !== undefined) ? `(${tx.from.feerate} / vbytes)` : ""}
                </p>
            </div>
        )
    }
    else if ((counter <= 0) && ((status === "pending") || (status === "canceled"))) {
        return (
            <div className="container">
                <XCircle size={250} style={{marginTop: "25%"}} color="red" weight="bold" />
                <p> 
                    Time expired!
                </p>
            </div>
        )
    }
}

export default Tx;