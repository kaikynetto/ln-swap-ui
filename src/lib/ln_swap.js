import axios from "axios"

class LNSwap {

    constructor(url) {
        this.url = url
    }

    call(method, path, data) {
        return axios({
           method: method,
           url: this.url + path,
           data: data 
        })
    }

    info() {
        return this.call("GET", "/api/v1/info")
    }

    estimate_fee(address, amount, feerate = 1) {
        return this.call("GET", `/api/v1/estimate/fee?address=${address}&amount=${amount}&feerate=${feerate}`)
    }

    get_transaction(txid) {
        return this.call("GET", `/api/v1/tx/${txid}`)
    }

    create_loop_out(amount, address, feerate) {
        const data = {
            "amount":  amount,
            "address": address,
            "feerate": feerate
        }
        return this.call("POST", "/api/v1/loop/out", data)
    }
    
    create_loop_in(invoice) {
        const data = {"invoice":  invoice,}
        return this.call("POST", "/api/v1/loop/in", data)
    }

    decode_invoice(invoice) {
        return this.call("GET", `/api/v1/decode/invoice/${invoice}`)
    }

}

export default LNSwap