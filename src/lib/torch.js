import axios from "axios"

class TorchLight {

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
}

export default TorchLight