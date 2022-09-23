import { BrowserRouter, Routes, Route } from "react-router-dom"
import Tx from "./routers/tx"
import Home from "./routers/home"

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />}/>
                <Route path="/tx/:txid" element={<Tx />}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App