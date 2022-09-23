import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from 'qrcode.react';
import LNSwap from "../../lib/ln_swap";

import "./styles.css"

function Tx() {
    var { txid } = useParams();
    var [ tx, setTx ] = useState({})
    var [ amount, setAmount ] = useState(0)
    var [ address, setAddress ] = useState()
    var [ counter, setCounter ] = useState(0)

    const ln_swap = new LNSwap(import.meta.env.VITE_LN_SWAP_API)

    useEffect(() => {
        ln_swap.get_transaction(txid).then((r) => {
            const data = r.data
            if (data.type == "loop-out") {
                const invoice = data.from.invoice
                setAddress(`lightning:${invoice}`)

                ln_swap.decode_invoice(invoice).then((r) => {
                    const data = r.data
                    const amount = data.num_satoshis
                    setAmount(amount)
                })
            } 
            else if (data.type == "loop-in") {
                const address = data.from.address
                const amount = data.from.amount
                setAddress(`bitcoin:${address}?amount=${amount}`)
                setAmount(amount)
            }
            
            setTx(data)
            
            setCounter((tx.from.expiry).toFixed(0))
        })
    }, [txid])
    
    useEffect(() => {
        const now = Math.floor(Date.now() / 1000)
        const timer = counter > 0 && setInterval(() => setCounter((tx.from.expiry - now).toFixed(0)), 1000);
        return () => clearInterval(timer);
    }, [tx, counter]);
    
    return (
        <div className="container" style={{height: 600}}>
            <p> {counter} s </p>
            <a href={address}>
             <QRCodeSVG value={address} size={450}/>                
            </a>
            <p>{amount} {tx.type == "loop-in" ? "BTC" : "SATs"}</p>
        </div>
    )
}

export default Tx;